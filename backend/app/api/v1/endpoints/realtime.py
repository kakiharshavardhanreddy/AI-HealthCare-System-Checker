from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime import manager

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/notifications/{user_id}")
async def notifications_socket(websocket: WebSocket, user_id: int) -> None:
    await manager.connect_user(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_user(user_id, websocket)


@router.websocket("/ws/admin/activity")
async def admin_activity_socket(websocket: WebSocket) -> None:
    await manager.connect_admin(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
