import os
from fastapi import APIRouter, HTTPException, Depends
# from dependency_injector.wiring import inject, Provide
# from app.core.config import configs

router = APIRouter()

# @inject
@router.get("/appinfo")
async def appinfo():
    """
    Endpoint to retrieve basic application information including name, version, and environment.
    
    Returns:
        dict: A dictionary containing application information
    
    Raises:
        HTTPException: 500 error if there's an issue retrieving the information
    """
    try:
        env = os.environ.get('ENV', 'dev')
        return {
            "app_name": "emnetix",
            "app_version": "0.0.1",
            "running_mode": env,
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))