from collections import defaultdict
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.user_connections: dict[int, list[WebSocket]] = defaultdict(list)
        self.admin_connections: list[WebSocket] = []

    async def connect_user(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.user_connections[user_id].append(websocket)

    def disconnect_user(self, user_id: int, websocket: WebSocket) -> None:
        if websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)

    async def connect_admin(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.admin_connections.append(websocket)

    def disconnect_admin(self, websocket: WebSocket) -> None:
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def send_user(self, user_id: int, payload: dict[str, Any]) -> None:
        disconnected: list[WebSocket] = []
        for websocket in self.user_connections.get(user_id, []):
            try:
                await websocket.send_json(payload)
            except RuntimeError:
                disconnected.append(websocket)
        for websocket in disconnected:
            self.disconnect_user(user_id, websocket)

    async def broadcast_admin(self, payload: dict[str, Any]) -> None:
        disconnected: list[WebSocket] = []
        for websocket in self.admin_connections:
            try:
                await websocket.send_json(payload)
            except RuntimeError:
                disconnected.append(websocket)
        for websocket in disconnected:
            self.disconnect_admin(websocket)


manager = ConnectionManager()
