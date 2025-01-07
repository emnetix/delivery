import os
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter()

# @inject

admin_list = [
    {
        "path": "/dashboard",
        "component": "#",
        "redirect": "/dashboard/analysis",
        "name": "Dashboard",
        "meta": {
            "title": "router.dashboard",
            "icon": "vi-ant-design:dashboard-filled",
            "alwaysShow": True
        },
        "children": [
            {
                "path": "analysis",
                "component": "views/Dashboard/Analysis",
                "name": "Analysis",
                "meta": {
                    "title": "router.analysis",
                    "noCache": True,
                    "affix": True
                }
            },
            {
                "path": "workplace",
                "component": "views/Dashboard/Workplace",
                "name": "Workplace",
                "meta": {
                    "title": "router.workplace",
                    "noCache": True,
                    "affix": True
                }
            },
        ]
    }
]


SUCCESS_CODE = 0

@router.get("/role/list")
async def roleList():
    try:
        env = os.environ.get('ENV', 'dev')
        return { 
            'code': SUCCESS_CODE,
            'data': admin_list
        }
    
    except Exception as e:
        print("Error: ", str(e))
        raise HTTPException(status_code=500, detail=str(e))
