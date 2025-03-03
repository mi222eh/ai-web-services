import logging
import os
from datetime import datetime
import json
from typing import Optional
from beanie import PydanticObjectId
import asyncio

from ...models import Explanation, ExplanationEntry
from .ai import create_and_validate_synonym
from ...services.websocket_service import ConnectionManager

logger = logging.getLogger(__name__)

# Track processing state
_processing_set = set()
_last_processed = {}

async def process_explanation(explanation_id: PydanticObjectId, is_retry: bool = False):
    """Process a single explanation"""
    explanation_id_str = str(explanation_id)
    
    # Skip if already being processed
    if explanation_id_str in _processing_set:
        logger.info(f"Skipping {explanation_id} - already being processed")
        return
        
    # Check if we need to wait before retrying
    current_time = datetime.now()
    last_time = _last_processed.get(explanation_id_str)
    if last_time and (current_time - last_time).total_seconds() < 30:
        logger.info(f"Skipping {explanation_id} - too soon to retry")
        return
        
    # Mark as being processed
    _processing_set.add(explanation_id_str)
    _last_processed[explanation_id_str] = current_time
    
    try:
        # Get the explanation
        explanation = await Explanation.get(explanation_id)
        if not explanation:
            return

        if not is_retry and explanation.entries:
            return

        # Generate explanation in a separate task to avoid blocking
        logger.info(f"Generating explanation for: {explanation.word}")
        try:
            # Use asyncio.get_event_loop().run_in_executor for CPU-bound tasks
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, create_and_validate_synonym, explanation.word)
            
            if not result:
                raise Exception("Failed to generate explanation")

            # Update entries
            entries = (
                explanation.entries
                + [
                    ExplanationEntry(
                        synonyms=result.synonyms, explanation=result.explanation
                    )
                ]
                if is_retry
                else [
                    ExplanationEntry(
                        synonyms=result.synonyms, explanation=result.explanation
                    )
                ]
            )

            # Save to database
            explanation.entries = entries
            explanation.updated_at = datetime.now()
            await explanation.save()
            
            logger.info(f"Successfully processed: {explanation.word}")

            # After successful processing, notify clients
            await ConnectionManager.send_message(
                {
                    "type": "explanation_ready",
                    "id": str(explanation_id),
                    "word": explanation.word,
                }
            )

        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            raise e

    except Exception as e:
        logger.error(f"Error processing explanation {explanation_id}: {e}")
        # Notify clients about the error
        await ConnectionManager.send_message(
                {
                    "type": "explanation_error",
                    "id": str(explanation_id),
                    "error": str(e),
                }
        )
    finally:
        # Always remove from processing set when done
        _processing_set.discard(explanation_id_str)
