import os
import ollama
from pydantic import BaseModel
import requests
import logging

from server.services.bing_search import search_bing
from server.models import ExplanationEntry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CreateSynonymSchema(BaseModel):
    word: str
    synonyms: list[str]
    explanation: str


client = ollama.Client(host=os.environ.get("OLLAMA_HOST", "localhost"))


def search_synonym(synonym: str) -> str:
    """
    Searches for a synonym and explanations of the given word on Synonyms.se.

    Args:
        synonym (str): The word to find synonyms and explanations for.

    Returns:
        str: The explanation HTML from the website
    """
    response = requests.get(f"https://www.synonymer.se/sv-syn/{synonym}")
    explanation = response.text
    return explanation


available_functions = {
    "search_synonym": search_synonym,
    "search_bing": search_bing,  # Add the Bing search function to available functions
}


def create_synonym_ai(synonym: str, previous_entries: list[ExplanationEntry] = None):
    try:
        html_response = requests.get(f"https://www.synonymer.se/sv-syn/{synonym}")
        html_response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch synonym data: {e}")
        return None

    messages = [
        {
            "role": "system",
            "content": """Du är en AI som spelar rollen som språklärare. Din uppgift är att ge synonymer och förklara ord och meningar för användaren.
                Ditt svar MÅSTE vara på SVENSKA, inget annat språk är tillåtet.
                HALLUCINERA INTE. Om det inte finns några synonymer, ange tydligt att det inte finns några.
            """,
        },
        {
            "role": "system",
            "content": f"HTML-innehåll från synonymer.se: {html_response.text}",
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
        messages.append(
            {
                "role": "user",
                "content": f"Detta är ett nytt försök. Tidigare förklaringar: {previous_explanations}",
            }
        )

    try:
        response = client.chat(
            "llama3.2",
            messages=messages,
            format=CreateSynonymSchema.model_json_schema(),
            options={"temperature": 0},
        )
    except Exception as e:
        logger.error(f"Failed to get response from AI model: {e}")
        return None

    messages.append({"role": "assistant", "content": response.message.content})

    if response.message.tool_calls:
        for tool in response.message.tool_calls:
            if function_to_call := available_functions.get(tool.function.name):
                logger.info(f"Calling function: {tool.function.name}")
                logger.info(f"Arguments: {tool.function.arguments}")
                try:
                    output = function_to_call(**tool.function.arguments)
                    messages.append(
                        {
                            "role": "tool",
                            "content": str(output),
                            "name": tool.function.name,
                        }
                    )
                    logger.info(f"Function output: {output}")
                except Exception as e:
                    logger.error(f"Error calling function {tool.function.name}: {e}")
            else:
                logger.warning(f"Function {tool.function.name} not found")

    if response.message.tool_calls:
        try:
            response = client.chat(
                "llama3.2",
                messages=messages,
                options={"temperature": 0},
            )
            logger.info(f"Final response: {response.message.content}")
        except Exception as e:
            logger.error(f"Failed to get final response from AI model: {e}")
            return None
    else:
        logger.info("No tool calls returned from model")

    try:
        return CreateSynonymSchema.model_validate_json(response.message.content)
    except Exception as e:
        logger.error(f"Failed to validate response schema: {e}")
        return None
