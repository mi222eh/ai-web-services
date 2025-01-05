import os
import ollama
from pydantic import BaseModel


class CreateExplanationSchema(BaseModel):
    word: str
    explanation: str


client = ollama.Client(host=os.environ.get("OLLAMA_HOST", "localhost"))


def create_explanation_ai(explanation):
    # Implement the logic to convert the explanation into a DTO
    res = client.generate(
        model="llama3.2",
        prompt=f"Ge en förklaring till ord '{explanation}' på ett naturligt sätt på korrekt svenska.",
        format=CreateExplanationSchema.model_json_schema(),
    )

    return CreateExplanationSchema.model_validate_json(res.response)
