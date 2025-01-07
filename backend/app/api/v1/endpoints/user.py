import os
from fastapi import APIRouter, HTTPException, Depends, Body

router = APIRouter()

# @inject

SUCCESS_CODE = 0
UNAUTHORIZED_CODE = 401

@router.get("/user/loginOut")
async def logout():
    """
    Endpoint for user logout
    Returns:
        dict: Response indicating successful logout
    """
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
async def login(username: str = Body(...), password: str = Body(...)):
    """
    Endpoint for user authentication
    Args:
        username: User's username
        password: User's password
    Returns:
        dict: User data if authentication successful, error message if not
    """
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
                'code': UNAUTHORIZED_CODE,
                'message': 'Invalid username or password',
            }
        
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))