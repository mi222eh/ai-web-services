from fastapi import WebSocket
from typing import List

class ConnectionManagerClass:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        print("ConnectionManager: Adding new connection")
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        print("ConnectionManager: Removing connection")
        self.active_connections.remove(websocket)

    async def send_message(self, message: str):
        print(f"ConnectionManager: Broadcasting message to {len(self.active_connections)} clients")
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"ConnectionManager: Error sending message to client: {str(e)}")
                # Remove failed connection
                await self.disconnect(connection)

# Create a singleton instance
ConnectionManager = ConnectionManagerClass() 