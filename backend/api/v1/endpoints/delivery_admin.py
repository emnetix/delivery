import os
from fastapi import APIRouter, HTTPException, Depends
import datetime

from ent.log_manager import LogManager as LM
from ent.log_manager import LogInfo
lm = LM()

from ent.device_connection_manager import DeviceConnectionManager as DCM
dcm = DCM()

router = APIRouter()

@router.get("/ent02delivery/admin/logs")
async def logs(after: str = None, limit: int = 100):
    try:
        env = os.environ.get('ENV', 'dev')
        loginfo = lm.get_log_info()
        logs = lm.get_logs(after=after, limit=limit)
        return {
            "status": "success",
            "log_info": loginfo,
            "logs": logs,
            "app_info": {
                "name": "emnetix",
                "version": "0.0.1",
                "environment": env
            }
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ent02delivery/admin/ids")
async def get_ids(page: int = 1, pageSize: int = 10):
    try:
        # Query ID list with pagination
        ids = dcm.get_id_list(page=page, page_size=pageSize)
       
        return {
            "status": "success",
            "ids": ids,
            "pagination": {
                "page": page,
                "pageSize": pageSize
            }
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ent02delivery/admin/stats")
async def get_stats():
    try:
        # Query statistics from DCM
        total_ids = dcm.get_total_registered_id_count()
        active_connections = await dcm.get_total_websocket_client_connection_count()
        last_updated = datetime.datetime.now().isoformat()

        return {
            "status": "success",
            "stats": {
                "total_ids": total_ids,
                "active_connections": active_connections,
                "last_updated": datetime.datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))