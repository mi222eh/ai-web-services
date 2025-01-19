from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from ..middleware.auth import jwt, ALGORITHM
from ..config import settings

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Get the token from the cookie
            cookies = websocket.cookies
            token = cookies.get("access_token")
            
            if not token or not token.startswith("Bearer "):
                await websocket.close(code=1008, reason="Not authenticated")
                return
                
            try:
                # Verify the token
                token_value = token.split(" ")[1]
                payload = jwt.decode(
                    token_value, 
                    settings.AUTH_SECRET_KEY,
                    algorithms=[ALGORITHM]
                )
                
                # Wait for messages
                data = await websocket.receive_text()
                await websocket.send_text(f"Message text was: {data}")
                
            except jwt.JWTError:
                await websocket.close(code=1008, reason="Invalid token")
                return
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")

# Function to notify clients when explanation is ready
async def notify_clients(message: str):
    await ConnectionManager.send_message(message)
