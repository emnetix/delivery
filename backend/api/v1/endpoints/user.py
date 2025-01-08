import os
from fastapi import APIRouter, HTTPException, Depends, Body

router = APIRouter()

# @inject

SUCCESS_CODE = 0

@router.get("/user/loginOut")
async def user_logout():
    try:
        env = os.environ.get('ENV', 'dev')
        return { 
            'code': SUCCESS_CODE,
            'data': None
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/login")
async def user_login(username: str = Body(...), password: str = Body(...)):
    try:
        env = os.environ.get('ENV', 'dev')
        if username == 'admin' and password == 'ehsqjfwk9414two':
            return { 
                'code': SUCCESS_CODE,
                'data': {
                    'username': 'admin',
                    'password': 'ehsqjfwk9414two',
                    'role': 'admin',
                    'roleId': '1',
                    'permissions': ['*.*.*']
                },
            }
        else:
            return { 
                'code': 401,
                'message': 'Invalid username or password',
            }
        
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))