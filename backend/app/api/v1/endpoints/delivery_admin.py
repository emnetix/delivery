import os
from fastapi import APIRouter, HTTPException, Depends
import datetime

from ent.log_manager import LogManager as LM
from ent.log_manager import LogInfo
lm = LM()

from ent.device_connection_manager import DeviceConnectionManager as DCM
dcm = DCM()

router = APIRouter()

# @inject

@router.get("/ent02delivery/admin/logs")
async def logs(after: str = None, limit: int = 100):
    """관리자용 로그 조회 엔드포인트"""
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
    """페이지네이션된 ID 목록 조회 엔드포인트"""
    try:
        # Fetch paginated ID list
        ids = dcm.get_id_list(page=page, page_size=pageSize)
       
        # Sample data structure
        # ids = [
        #     {"id": "1", "sid": "sid_1", "lastAccessTime": "2024-03-20T10:30:00Z"},
        #     {"id": "2", "sid": "sid_2", "lastAccessTime": "2024-03-20T10:31:00Z"},
        #     {"id": "3", "sid": "sid_3", "lastAccessTime": "2024-03-20T10:32:00Z"},
        #     {"id": "4", "sid": "sid_4", "lastAccessTime": "2024-03-20T10:33:00Z"},
        #     {"id": "5", "sid": "sid_5", "lastAccessTime": "2024-03-20T10:34:00Z"},
        # ]
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
    """시스템 통계 정보 조회 엔드포인트"""
    try:
        # Get statistics from DCM
        total_ids = dcm.get_total_registered_ids()
        active_connections = await dcm.get_total_websocket_connections()
        
        # Sample static values
        # total_ids = 100
        # active_connections = 100
        last_updated = datetime.datetime.now().isoformat()

        return {
            "status": "success",
            "stats": {
                "total_ids": total_ids,
                "active_connections": active_connections,
                "last_updated": last_updated
            }
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))