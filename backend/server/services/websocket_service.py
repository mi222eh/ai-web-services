from fastapi import WebSocket
from typing import List


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
    async def send_message(message: str):
        for connection in ConnectionManager.active_connections:
            await connection.send_text(message)
