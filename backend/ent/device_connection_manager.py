import time

class DeviceInfo:
    def __init__(self, id):
        self.id = id
        self.sid = None
        self.info = None
        self.last_updated_at = time.time()

    def set_sid(self, sid):
        self.sid = sid
        return

    def set_info(self, info):
        self.info = info
        return

class DeviceConnectionManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.sio = None
            cls._instance.websocket_connection_count = 0
            cls._instance.sid_to_id = {}
            cls._instance.id_to_sid = {}
            cls._instance.device_info = {}
        return cls._instance

    def __init__(self):
        pass

    def set_sio(self, sio):
        self.sio = sio

    def _allocate_device(self, id) -> DeviceInfo:
        new_device = DeviceInfo(id)
        self.device_info[id] = new_device
        return new_device
    
    def _delete_device(self, id):
        if id not in self.device_info:
            return
        
        del self.device_info[id]
        return
    
    async def _close_client_websocket(self, sid):
        if sid is not None:
            await self.sio.disconnect(sid)
        return

    def _id_to_device(self, id) -> DeviceInfo:
        if id not in self.device_info:
            return None
        
        return self.device_info[id]
    
    def _cleanup(self):
        return

    def connect_websocket(self, sid):
        print(f"Client connected: {sid}")
        self.websocket_connection_count += 1
        if sid in self.sid_to_id:
            print(f"This is an impossible error. A new websocket connection with an already registered sid...: {sid}")
            self._cleanup()
            return

        self._cleanup()
        return

    async def disconnect_websocket(self, sid):
        print(f"Client disconnected: {sid}")
        self.websocket_connection_count -= 1

        if sid not in self.sid_to_id:
            print(f"This is an impossible error. Websocket disconnection occurred but no registered sid exists...: {sid}")
            print(f"sid_to_id: {self.sid_to_id}")
            self._cleanup()
            return
        
        # Delete id index information
        id = self.sid_to_id[sid]
        del self.sid_to_id[sid]
        del self.id_to_sid[id]

        self._delete_device(id)

        self._cleanup()
        return
    
    async def set_websocket_id(self, sid, id):
        print(f"Setting id for websocket: {sid}, {id}")

        if sid in self.sid_to_id:
            print(f"sid already has an assigned id. This request will be ignored: {sid}, {id}")
            self._cleanup()
            return

        if id in self.id_to_sid:
            print(f"id already has an assigned sid. The following sid and id will be cleaned up: {sid}, {id}")
            previous_sid = self.id_to_sid[id]
            await self._close_client_websocket(previous_sid)

        self.sid_to_id[sid] = id
        self.id_to_sid[id] = sid

        if id in self.device_info:
            print(f"Device info should not exist during id setup. If it exists at this point, it's a bug: {id}")
            self._cleanup()
            return

        new_device = self._allocate_device(id)
        new_device.set_sid(sid)

        self._cleanup()
        return
    
    async def set_websocket_device_info(self, sid, info):
        print(f"Setting device info via websocket: {sid}, {info}")
        if sid not in self.sid_to_id:
            print(f"Bug: Attempting to set device info but no id matches this sid: {sid}")
            self._cleanup()
            return
        
        id = self.sid_to_id[sid]
        device = self._id_to_device(id)
        if device is None:
            print(f"Bug: Device info setup occurs after id setup, so device must exist: {id}")
            self._cleanup()
            return
        
        device.set_info(info)
        self._cleanup()
        return
    
    def find_sid_by_id(self, id):
        if id not in self.id_to_sid:
            return None
        
        return self.id_to_sid[id]
    
    def find_id_by_sid(self, sid):
        if sid not in self.sid_to_id:
            return None
        
        return self.sid_to_id[sid]
    
    def find_device_info_by_id(self, id):
        if id not in self.device_info:
            return None
        
        return self.device_info[id]

    def check_link_target_exists(self, sid, target_id):
        target_sid = self.find_sid_by_id(target_id)
        if target_sid is None:
            return None
        
        if target_id not in self.device_info:
            return None
        
        return self.device_info[target_id]
    
    def get_id_list(self, page: int = 1, page_size: int = 10):
        # Convert all device info to list
        all_devices = list(self.device_info.values())
        
        # Sort by last update time (newest first)
        all_devices.sort(key=lambda x: x.last_updated_at, reverse=True)
        
        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        page_devices = all_devices[start_index:end_index]
        
        # Convert data to response format
        results = []
        for device in page_devices:
            results.append({
                "id": device.id,
                "sid": device.sid,
                "lastAccessTime": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(device.last_updated_at))
            })
            
        return results
    
    def get_total_registered_id_count(self):
        return len(self.device_info)
    
    async def get_total_websocket_client_connection_count(self):
        return self.websocket_connection_count