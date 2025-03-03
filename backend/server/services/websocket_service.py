from fastapi import WebSocket
from typing import List, Dict, Any
import json


class ConnectionManager:
    active_connections: List[WebSocket] = []

    @staticmethod
    async def connect(websocket: WebSocket):
        await websocket.accept()
        ConnectionManager.active_connections.append(websocket)

    @staticmethod
    def disconnect(websocket: WebSocket):
        ConnectionManager.active_connections.remove(websocket)

    @staticmethod
    async def send_message(message: Dict[str, Any]):
        for connection in ConnectionManager.active_connections:
            await connection.send_text(json.dumps(message))
