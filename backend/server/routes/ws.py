from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.websocket_service import ConnectionManager

router = APIRouter()


@router.websocket("")
async def websocket_endpoint(websocket: WebSocket):
    await ConnectionManager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        ConnectionManager.disconnect(websocket)


# Function to notify clients when explanation is ready
async def notify_clients(message: str):
    await ConnectionManager.send_message(message)
