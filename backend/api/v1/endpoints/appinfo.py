import os
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()

@router.get("/appinfo")
async def appinfo():
    try:
        env = os.environ.get('ENV', 'dev')
        return { 
            "app_name": "emnetix", 
            "app_version": "0.0.1",
            "environment": env,
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))