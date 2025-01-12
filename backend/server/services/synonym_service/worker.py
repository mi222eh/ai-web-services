import threading
import queue
import logging
import asyncio
import os
from typing import Optional, Tuple
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import json

from ...models import Explanation, ExplanationEntry
from .ai import create_and_validate_synonym
from ...services.websocket_service import ConnectionManager

logger = logging.getLogger(__name__)


class AIWorker:
    _instance: Optional["AIWorker"] = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.task_queue = queue.Queue()
        self.processing_lock = threading.Lock()
        self._start_threads()
        logger.info("AI Worker and Scanner initialized and started")

    def _start_threads(self):
        """Start worker and scanner threads"""
        self.worker_thread = threading.Thread(target=self._run_worker, daemon=True)
        self.scanner_thread = threading.Thread(target=self._run_scanner, daemon=True)
        self.worker_thread.start()
        self.scanner_thread.start()

    def _setup_async_thread(
        self,
    ) -> Tuple[asyncio.AbstractEventLoop, AsyncIOMotorClient]:
        """Setup event loop and MongoDB client for a thread"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        mongodb_url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongodb_url, io_loop=loop)
        return loop, client

    def _run_worker(self):
        """Main worker thread processing the task queue"""
        loop, client = self._setup_async_thread()
        db = client.worddb

        try:
            while True:
                task = self.task_queue.get()
                if task is None:
                    break

                explanation_id, is_retry = task
                logger.info(
                    f"Processing explanation: {explanation_id} (retry: {is_retry})"
                )

                try:
                    with self.processing_lock:
                        loop.run_until_complete(
                            self._process_explanation(explanation_id, is_retry, db)
                        )
                except Exception as e:
                    logger.error(f"Error processing explanation {explanation_id}: {e}")

                self.task_queue.task_done()
        except Exception as e:
            logger.error(f"Error in worker thread: {e}")
        finally:
            client.close()

    def _run_scanner(self):
        """Scanner thread looking for empty explanations"""
        loop, client = self._setup_async_thread()
        db = client.worddb

        try:
            while True:
                if not self.processing_lock.locked():
                    try:
                        loop.run_until_complete(self._scan_empty_explanations(db))
                    except Exception as e:
                        logger.error(f"Error scanning explanations: {e}")
                asyncio.run(asyncio.sleep(5))
        except Exception as e:
            logger.error(f"Error in scanner thread: {e}")
        finally:
            client.close()

    def _adjust_timeout(
        self, found_entries: bool, current: int, maximum: int, consecutive: int
    ) -> int:
        """Adjust scanner timeout based on results"""
        if found_entries:
            logger.info("Found empty entries, keeping scan interval at 30 seconds")
            return 30
        elif consecutive >= 2:
            new_timeout = min(current * 2, maximum)
            logger.info(
                f"No empty entries found, increasing scan interval to {new_timeout} seconds"
            )
            return new_timeout
        return current

    async def _scan_empty_explanations(self, db):
        """Scan for explanations without entries"""
        cursor = db.synonyms.find({"entries": {"$size": 0}})
        async for doc in cursor:
            explanation = Explanation(**doc)
            self.add_task(explanation.id)
            logger.info(f"Found empty explanation: {explanation.word}")
            return True  # Found at least one
        return False  # Found none

    async def _process_explanation(
        self, explanation_id: PydanticObjectId, is_retry: bool, db
    ):
        """Process a single explanation"""
        try:
            # Get the explanation
            explanation_data = await db.synonyms.find_one({"_id": explanation_id})
            if not explanation_data:
                return

            explanation = Explanation(**explanation_data)
            if not is_retry and explanation.entries:
                return

            # Generate explanation
            logger.info(f"Generating explanation for: {explanation.word}")
            result = create_and_validate_synonym(explanation.word)

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
            await db.synonyms.update_one(
                {"_id": explanation_id},
                {
                    "$set": {
                        "entries": [entry.model_dump() for entry in entries],
                        "updated_at": datetime.now(),
                    }
                },
            )
            logger.info(f"Successfully processed: {explanation.word}")

            # After successful processing, notify clients
            await ConnectionManager.send_message(
                json.dumps(
                    {
                        "type": "explanation_ready",
                        "id": str(explanation_id),
                        "word": explanation.word,
                    }
                )
            )

        except Exception as e:
            logger.error(f"Error processing explanation {explanation_id}: {e}")
            # Notify clients about the error
            await ConnectionManager.send_message(
                json.dumps(
                    {
                        "type": "explanation_error",
                        "id": str(explanation_id),
                        "error": str(e),
                    }
                )
            )

    def add_task(self, explanation_id: PydanticObjectId, is_retry: bool = False):
        """Add a new explanation to be processed"""
        logger.info(f"Adding task: {explanation_id} (retry: {is_retry})")
        self.task_queue.put((explanation_id, is_retry))


# Create a global worker instance
worker = AIWorker()
