import json
import time
import socketio

from ent.log_manager import LogManager as LM
from ent.log_manager import LogInfo
lm = LM()

from ent.device_connection_manager import DeviceConnectionManager as DCM
dcm = DCM()

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
dcm.set_sio(sio)

# WebSocket path constant
WEBSOCKET_PATH = '/api/v1/ws/ent02delivery'

@sio.event
async def connect(sid, environ):
    lm.add_log(LogInfo(
        level="INFO", service=LM.SERVICE_DELIVERY,
        message=f"connect: {sid}",
    ))
    dcm.connect_websocket(sid)

@sio.event
async def disconnect(sid):
    lm.add_log(LogInfo(
        level="INFO", service=LM.SERVICE_DELIVERY,
        message=f"disconnect: {sid}",
    ))
    await dcm.disconnect_websocket(sid)

@sio.on('set-id')
async def setId(sid, data_str):
    print(f"Received set-id message from {sid}: {data_str}")
    lm.add_log(LogInfo(
        level="INFO", service=LM.SERVICE_DELIVERY,
        message=f"set-id [{sid}] \r\n{data_str}",
    ))

    try:
        data = json.loads(data_str)
        if 'id' in data:
            id = data['id']
            await dcm.set_websocket_id(sid, id)
            await dcm.set_websocket_device_info(sid, {})

    except json.JSONDecodeError:
        print(f"JSON format error: {data_str} is not valid JSON")
        lm.add_log(LogInfo(
            level="ERROR", service=LM.SERVICE_DELIVERY,
            message=f"JSON format error: {data_str} is not valid JSON",
        ))

@sio.on('delivery')
async def delivery(sid, data_str):
    print(f"Received delivery message from {sid}: {data_str}")
    lm.add_log(LogInfo(
        level="INFO", service=LM.SERVICE_DELIVERY,
        message=f"delivery [{sid}] \r\n{data_str}",
    ))
    try:
        data = json.loads(data_str)
        # Ignore if 'from' field is missing
        if 'from' not in data:
            print(f"Missing 'from' field: {data_str}")
            lm.add_log(LogInfo(
                level="ERROR", service=LM.SERVICE_DELIVERY,
                message=f"Missing 'from' field: {data_str}",
            ))
            return

        # Check if 'to' and 'payload' fields exist
        if 'to' not in data or 'payload' not in data:
            print(f"Missing 'to' or 'payload' field: {data_str}")
            lm.add_log(LogInfo(
                level="ERROR", service=LM.SERVICE_DELIVERY,
                message=f"Missing 'to' or 'payload' field: {data_str}",
            ))
            error_data = {
                'message': 'Missing to or payload field',
                'from': data['from'],
                'to': data['from'],
            }
            await sio.emit('error', error_data, room=sid)
            return
        
        target_sid = dcm.find_sid_by_id(data['to'])
        if target_sid is None:
            print(f"Target id [{data['to']}] not found: {data_str}")
            lm.add_log(LogInfo(
                level="ERROR", service=LM.SERVICE_DELIVERY,
                message=f"Target id [{data['to']}] not found: {data_str}",
            ))
            error_data = {
                'message': f'Target id [{data["to"]}] not found',
                'from': data['from'],
                'to': data['from'],
            }
            await sio.emit('error', error_data, room=sid)
            return
        
        await sio.emit('delivery', data, room=target_sid)
        
    except json.JSONDecodeError:
        print(f"JSON format error: {data_str} is not valid JSON")
        lm.add_log(LogInfo(
            level="ERROR", service=LM.SERVICE_DELIVERY,
            message=f"JSON format error: {data_str} is not valid JSON",
        ))

socket_app = socketio.ASGIApp(sio, socketio_path=WEBSOCKET_PATH)