from fastapi import APIRouter

from api.v1.endpoints.appinfo import router as appinfo_router
from api.v1.endpoints.user import router as user_router
from api.v1.endpoints.role import router as role_router

from api.v1.endpoints.delivery_admin import router as delivery_admin_router

routers = APIRouter()
router_list = [
    appinfo_router,
    user_router,
    role_router,    
    delivery_admin_router,
]

for router in router_list:
    if not router.tags:
        router.tags = []
    router.tags.append("v1")
    routers.include_router(router)

