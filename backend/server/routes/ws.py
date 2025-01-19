from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from ..middleware.auth import jwt, ALGORITHM
from ..config import settings

router = APIRouter()

@router.websocket("")
async def websocket_endpoint(websocket: WebSocket):
    print("\n=== WebSocket Connection Attempt ===")
    
    # Accept connection first
    await websocket.accept()
    print("WebSocket: Connection accepted")
    
    # Get the token from the cookie
    cookies = websocket.cookies
    token = cookies.get("access_token")
    print("WebSocket cookies:", cookies)
    print("WebSocket token:", token)
    
    if not token or not token.startswith("Bearer "):
        print("WebSocket: No valid token format")
        await websocket.close(code=4001, reason="No valid token")
        return
            
    try:
        # Verify the token
        token_value = token.split(" ")[1]
        print("WebSocket: Attempting to verify token:", token_value[:20] + "...")
        payload = jwt.decode(
            token_value, 
            settings.AUTH_SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print("WebSocket: Token verified, payload:", payload)
        
        while True:
            # Wait for messages
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
                
    except jwt.JWTError as e:
        print("WebSocket: Token verification failed:", str(e))
        await websocket.close(code=4002, reason="Invalid token")
        return
    except WebSocketDisconnect:
        print("WebSocket: Client disconnected")
    except Exception as e:
        print("WebSocket: Unexpected error:", str(e))
        await websocket.close(code=4003, reason="Server error")
        raise

# Function to notify clients when explanation is ready
async def notify_clients(message: str):
    await ConnectionManager.send_message(message)
