import os
import ollama
from pydantic import BaseModel
import requests


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
}


def create_synonym_ai(synonym: str):
    html_response = requests.get(f"https://www.synonymer.se/sv-syn/{synonym}")
    # Implement the logic to convert the explanation into a DTO
    messages = [
        {
            "role": "system",
            "content": f"""You are an AI that is role playing a language teacher. Your job is to give synonyms and explain words and sentences to the user.
                Your answer MUST be in SWEDISH, no other language is allowed.
                DO NOT HALLUCINATE
            """,
        },
        {
            "role": "system",
            "content": f"{html_response.text}",
        },
        {
            "role": "user",
            "content": f"Vad har '{synonym}' för synonymer och vad betyder det? var god och förklara ordet",
        },
    ]

    response = client.chat(
        "llama3.2",
        messages=messages,
        format=CreateSynonymSchema.model_json_schema(),
        options={"temperature": 0},
    )

    messages.append({"role": "assistant", "content": response.message.content})

    if response.message.tool_calls:
        # There may be multiple tool calls in the response
        for tool in response.message.tool_calls:
            # Ensure the function is available, and then call it
            if function_to_call := available_functions.get(tool.function.name):
                print("Calling function:", tool.function.name)
                print("Arguments:", tool.function.arguments)
                output = function_to_call(**tool.function.arguments)
                messages.append(
                    {"role": "tool", "content": str(output), "name": tool.function.name}
                )

                print("Function output:", output)
            else:
                print("Function", tool.function.name, "not found")

    # Only needed to chat with the model using the tool call results
    if response.message.tool_calls:
        # Get final response from model with function outputs

        response = client.chat(
            "llama3.2",
            messages=messages,
            options={"temperature": 0},
        )
        print("Final response:", response.message.content)

    else:
        print("No tool calls returned from model")

    return CreateSynonymSchema.model_validate_json(response.message.content)
