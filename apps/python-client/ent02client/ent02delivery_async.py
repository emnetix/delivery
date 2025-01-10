import json
import os
import socketio
import uuid
from typing import Any, Optional

isProd = os.environ.get('ENV') == 'prod'

class ENT02DeliveryAsync:
    def __init__(self):
        # 기본 속성 초기화
        self.id: Optional[str] = None
        self.peer_id: Optional[str] = None
        
        # Socket.IO 설정
        self.sio = socketio.AsyncClient()
        self.ws_protocol = 'wss' if isProd else 'ws'
        if isProd :
            self.socket_url =  f"{self.ws_protocol}://test-delivery.emnetix.net"
        else:
            self.socket_url =  f"{self.ws_protocol}://localhost:8000"
        
        self.socket_path = '/api/v1/ws/ent02delivery'

        # 콜백을 빈 비동기 함수로 초기화
        async def noop(): pass
        self.on_connected = noop
        self.on_disconnected = noop
        self.on_delivery = noop
        self.on_error = noop

        # Socket.IO 이벤트 핸들러 설정
        self._setup_socket_handlers()

    def _setup_socket_handlers(self):
        @self.sio.event
        async def connect():
            if self.id:
                await self.sio.emit('set-id', json.dumps({'type': 'set-id', 'id': self.id}))
            await self.on_connected()

        @self.sio.event
        async def disconnect():
            await self.on_disconnected()

        @self.sio.on('delivery')
        async def on_delivery(data):
            await self.on_delivery(data)

        @self.sio.on('error')
        async def on_error(data):
            await self.on_error(data)

    async def create_id(self) -> str:
        return str(uuid.uuid4())

    async def set_id(self, id: str):
        self.id = id

    async def set_peer_id(self, id: str):
        self.peer_id = id

    async def connect_socket(self):
        if self.sio and self.sio.connected:
            await self.sio.disconnect()
        await self.sio.connect(
            self.socket_url,
            socketio_path=self.socket_path,
            transports=['websocket']
        )

    async def register_device(self):
        await self.connect_socket()

    async def send_data(self, data: Any):
        await self.sio.emit('delivery', json.dumps({
            'from': self.id,
            'to': self.peer_id,
            'payload': data
        }))
