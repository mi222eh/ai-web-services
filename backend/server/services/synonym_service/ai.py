import os
import ollama
from pydantic import BaseModel
import requests
import logging
from duckduckgo_search import DDGS
from server.models import ExplanationEntry
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Number of worker threads
MAX_WORKERS = 5


class RankingEntry(BaseModel):
    index: str
    rank: int
    motivation: str


class RankingSchema(BaseModel):
    rankings: list[RankingEntry]


class CreateSynonymSchema(BaseModel):
    word: str
    synonyms: list[str]
    explanation: str


class SearchQueriesSchema(BaseModel):
    queries: list[str]


OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "localhost")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma2")
logger.info(f"Connecting to Ollama at {OLLAMA_HOST} using model {OLLAMA_MODEL}")

client = ollama.Client(host=OLLAMA_HOST)


def search_parallel(queries: List[str], max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Run multiple searches in parallel
    """

    def search_one(query: str) -> List[Dict[str, Any]]:
        try:
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results))
        except Exception as e:
            logger.error(f"Search failed for query '{query}': {e}")
            return []

    all_results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_query = {
            executor.submit(search_one, query): query for query in queries
        }
        for future in as_completed(future_to_query):
            query = future_to_query[future]
            try:
                results = future.result()
                all_results.extend(results)
                logger.info(f"Search completed for query: {query}")
            except Exception as e:
                logger.error(f"Search failed for query '{query}': {e}")

    return all_results


def generate_results_parallel(
    synonym: str, search_info: str, num_results: int = 5
) -> List[CreateSynonymSchema]:
    """
    Generate multiple results in parallel
    """

    def generate_one(i: int) -> CreateSynonymSchema:
        logger.info(f"Generating result {i+1}/{num_results}...")
        return create_synonym_ai(synonym, search_info=search_info)

    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_index = {
            executor.submit(generate_one, i): i for i in range(num_results)
        }
        for future in as_completed(future_to_index):
            index = future_to_index[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
                    logger.info(f"Generated result {index+1}")
            except Exception as e:
                logger.error(f"Failed to generate result {index+1}: {e}")

    return results


def get_search_queries(synonym: str) -> list[str]:
    """
    Ask AI for good search queries for this word.
    """
    messages = [
        {
            "role": "system",
            "content": f"""Du är en expert på att söka efter information. Din uppgift är att skapa bra sökfrågor för att hitta synonymer och betydelser av ord.
                VIKTIGT! Svara i detta format:
                {{
                    "queries": [
                        "sökfråga 1",
                        "sökfråga 2",
                        "sökfråga 3"
                    ]
                }}
                
                VIKTIGT! Följ dessa regler EXAKT:
                - Sökfrågorna ska vara på svenska
                - Sökfrågorna ska ENDAST handla om ordet '{synonym}' - inga andra ord!
                - Varje sökfråga MÅSTE vara komplett och sluta med en punkt
                - Använd dessa exakta format:
                  1. "synonymer till {synonym} svenska."
                  2. "{synonym} betydelse definition svenska."
                  3. "vad betyder {synonym} förklaring svenska."
                - Max 3 sökfrågor
                - Inga förkortningar eller ofullständiga meningar""",
        },
        {
            "role": "user",
            "content": f"Skapa bra sökfrågor för att hitta synonymer och betydelse av ordet '{synonym}'.",
        },
    ]

    try:
        response = client.chat(
            OLLAMA_MODEL,
            messages=messages,
            format=SearchQueriesSchema.model_json_schema(),
            options={"temperature": 0.7},  # Little randomness for variety
        )
        result = SearchQueriesSchema.model_validate_json(response.message.content)
        return result.queries
    except Exception as e:
        logger.error(f"Failed to get search queries from AI: {e}")
        # Fallback to default queries
        return [
            f"synonymer till {synonym} svenska.",
            f"{synonym} betydelse definition svenska.",
            f"vad betyder {synonym} förklaring svenska.",
        ]


def get_search_results(synonym: str) -> str:
    """
    Get search results for a word and format them for the prompt.
    Now with parallel search!
    """
    logger.info(f"Searching for information about: {synonym}")

    # Get search queries from AI
    queries = get_search_queries(synonym)
    logger.info(f"Using search queries: {queries}")

    # Get all search results in parallel
    all_results = search_parallel(queries)

    # Format search results for prompt
    search_info = "Sökresultat:\n"
    seen_snippets = set()  # Avoid duplicates

    for r in all_results:
        if r.get("body"):
            snippet = r.get("body").strip()
            if snippet and snippet not in seen_snippets:
                search_info += f"- {snippet}\n"
                seen_snippets.add(snippet)

    return search_info


def create_synonym_ai(
    synonym: str,
    previous_entries: list[ExplanationEntry] = None,
    is_validation: bool = False,
    search_info: str = None,
):
    # Only search if no search_info provided
    if search_info is None:
        search_info = get_search_results(synonym)

    if is_validation:
        base_prompt = """Du är en språkexpert som validerar synonymer och förklaringar. 
            Din uppgift är att granska det tidigare resultatet och bekräfta om det är korrekt och användbart.
            Om du hittar fel eller möjliga förbättringar, ge en förbättrad version.
            Ditt svar MÅSTE vara på SVENSKA, inget annat språk är tillåtet.
            HALLUCINERA INTE. Om det inte finns några synonymer, ange tydligt att det inte finns några."""
    else:
        base_prompt = f"""Du är en AI som spelar rollen som språklärare. Din uppgift är att ge synonymer och förklara ord och meningar för användaren.
            Ditt svar MÅSTE vara på SVENSKA, inget annat språk är tillåtet.
            HALLUCINERA INTE. Om det inte finns några synonymer, ange tydligt att det inte finns några.
            
            Här är information från sökningar om ordet '{synonym}':
            
            {search_info}
            
            Använd denna information för att skapa ett bra svar. Svaret MÅSTE vara i detta format:
            {{
                "word": "ordet som söktes",
                "synonyms": ["synonym1", "synonym2", "etc"],
                "explanation": "En tydlig förklaring av ordets betydelse"
            }}
            
            Exempel på bra svar:
            {{
                "word": "glad",
                "synonyms": ["lycklig", "munter", "nöjd", "belåten"],
                "explanation": "Att känna eller uttrycka glädje och tillfredsställelse. Beskriver ett positivt sinnestillstånd."
            }}
            
            VIKTIGT! Använd BARA information från sökresultaten ovan. Om du inte hittar någon information, ange det tydligt."""

    messages = [
        {
            "role": "system",
            "content": base_prompt,
        },
        {
            "role": "user",
            "content": f"Vad har '{synonym}' för synonymer och vad betyder det? Var god och förklara ordet.",
        },
    ]

    if previous_entries:
        previous_explanations = "; ".join(
            [
                f"Synonymer: {entry.synonyms}, Förklaring: {entry.explanation}"
                for entry in previous_entries
            ]
        )
        if is_validation:
            messages.append(
                {
                    "role": "user",
                    "content": f"Granska och validera följande resultat:\n{previous_explanations}",
                }
            )
        else:
            messages.append(
                {
                    "role": "user",
                    "content": f"Detta är ett nytt försök. Tidigare förklaringar: {previous_explanations}",
                }
            )

    try:
        response = client.chat(
            OLLAMA_MODEL,
            messages=messages,
            format=CreateSynonymSchema.model_json_schema(),
            options={"temperature": 0},
        )
        logger.info(f"Got response from AI model")
    except Exception as e:
        logger.error(f"Failed to get response from AI model: {e}")
        raise e

    try:
        return CreateSynonymSchema.model_validate_json(response.message.content)
    except Exception as e:
        logger.error(f"Failed to validate response schema: {e}")
        return None


def create_and_validate_synonym(synonym: str) -> CreateSynonymSchema:
    """
    Creates multiple synonym explanations in parallel, ranks them, and selects the best one.
    """
    logger.info(f"Generating multiple synonym results for: {synonym}")

    # Get search results once
    search_info = get_search_results(synonym)

    # Generate results in parallel
    results = generate_results_parallel(synonym, search_info)

    if not results:
        logger.error("Failed to generate any valid synonym results")
        raise Exception("Failed to generate synonym results")

    if len(results) == 1:
        logger.info("Only one result generated, returning without ranking")
        return results[0]

    # Create a ranking prompt for the AI
    ranking_messages = [
        {
            "role": "system",
            "content": """Du är en språkexpert som ska ranka olika synonymförklaringar. 
            Bedöm varje förklaring baserat på följande kriterier:
            1. Precision och korrekthet i synonymerna
            2. Tydlighet och användbarhet i förklaringen
            3. Omfattning och fullständighet
            
            VIKTIGT! Du MÅSTE svara i detta JSON-format:
            {
                "rankings": [
                    {"index": "1", "rank": 1, "motivation": "Bäst för att..."},
                    {"index": "2", "rank": 2, "motivation": "Näst bäst för att..."},
                    ...
                ]
            }""",
        },
        {
            "role": "user",
            "content": f"Ranka följande förklaringar för ordet '{synonym}':\n"
            + "\n".join(
                [
                    f"Alternativ {i+1}:\nSynonymer: {r.synonyms}\nFörklaring: {r.explanation}"
                    for i, r in enumerate(results)
                ]
            ),
        },
    ]

    try:
        ranking_response = client.chat(
            OLLAMA_MODEL,
            messages=ranking_messages,
            format=RankingSchema.model_json_schema(),
            options={"temperature": 0},
        )

        # Parse the ranking response and get the best result
        rankings = RankingSchema.model_validate_json(ranking_response.message.content)
        best_index = min(rankings.rankings, key=lambda x: x.rank).index
        best_result = results[int(best_index) - 1]

        logger.info(
            f"Successfully ranked results and selected best option (rank {best_index})"
        )
        return best_result

    except Exception as e:
        logger.error(f"Failed during ranking process: {e}")
        # Fallback to first result if ranking fails
        logger.info("Falling back to first generated result")
        return results[0]
