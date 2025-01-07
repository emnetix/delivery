from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pathlib import Path

import os
import uvicorn
import threading
import logging

from api.v1.routes import routers as v1_routers
from api.v1.ws.ent02delivery import socket_app as v1_ws_ent02delivery
from api.v1.ws.ent02delivery import WEBSOCKET_PATH

from ent.log_manager import LogManager as LM
from ent.log_manager import LogInfo
lm = LM()

app = FastAPI()

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:8080", "https://yourfrontend.com"],  # 프론트엔드 도메인
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
    # allow_websockets=True,  # 웹소켓 허용 추가
)

env = os.environ.get('ENV', 'dev')
if env == 'dev':
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_DIR = BASE_DIR / "delivery_frontend/dist-pro"
elif env == 'test':
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_DIR = BASE_DIR / "delivery_frontend/dist-pro"
elif env == 'prod':
    BASE_DIR = Path('/work')
    STATIC_DIR = BASE_DIR / "delivery_frontend/dist-pro"

print(f"env: {env}")
print(f"BASE_DIR: {BASE_DIR}")
print(f"STATIC_DIR: {STATIC_DIR}")
logging.info(f"BASE_DIR: {BASE_DIR}")
logging.info(f"STATIC_DIR: {STATIC_DIR}")

app.mount(WEBSOCKET_PATH, v1_ws_ent02delivery)
# WebSocket catch-all route 추가
@app.websocket("/{path:path}")
async def catch_all_websocket(websocket: WebSocket, path: str):
    await websocket.close(code=1000)  # 정상적으로 연결 종료

app.include_router(v1_routers, prefix='/api/v1')
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

server = None

def run_server():
    global server

    config_settings = {
        "app": app,
        "host": "0.0.0.0",
        "port": 8000,
        "log_level": "info"
    }

    # 개발 환경일 경우 리로드 설정을 추가합니다.
    if env.lower() == "dev":
        # config_settings.update({
        #     "reload": True,
        #     # "reload_dirs": ["./backend/"]
        #     "reload_dirs": ["/home/frog/emnetix/apps/backend"]
        # })
        # print("개발 모드: 리로드 활성화")
        pass
    else:
        print(f"현재 환경: {env}, 리로드 비활성화")

    print(f"현재 실행 위치: {os.getcwd()}")
    logging.info(f"현재 실행 위치: {os.getcwd()}")

    print(f"config_settings: {config_settings}")

    config = uvicorn.Config(**config_settings)
    server = uvicorn.Server(config)

    server.run()

def start_server():
    global server
    logging.info("Starting FastAPI server...")
    if server is None:
        thread = threading.Thread(target=run_server)
        thread.start()
        logging.info("FastAPI server started")
        lm.로그_추가(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="FastAPI server started",
        ))

def stop_server():
    global server
    if server:
        server.should_exit = True
        server = None
        logging.info("FastAPI server stopped")

        lm.로그_추가(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="FastAPI server stopped",
        ))
