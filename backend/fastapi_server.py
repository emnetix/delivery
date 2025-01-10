from fastapi import FastAPI, WebSocket, HTTPException
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
import mimetypes
from fastapi.responses import FileResponse


app = FastAPI()

# CORS middleware settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

env = os.environ.get('ENV', 'dev')
if env == 'dev':
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_DIR = BASE_DIR / "frontend/dist-pro"
elif env == 'test':
    BASE_DIR = Path(__file__).resolve().parent.parent
    STATIC_DIR = BASE_DIR / "frontend/dist-pro"
elif env == 'prod':
    BASE_DIR = Path('/work')
    STATIC_DIR = BASE_DIR / "frontend/dist-pro"

print(f"env: {env}")
print(f"BASE_DIR: {BASE_DIR}")
print(f"STATIC_DIR: {STATIC_DIR}")
logging.info(f"BASE_DIR: {BASE_DIR}")
logging.info(f"STATIC_DIR: {STATIC_DIR}")

app.mount(WEBSOCKET_PATH, v1_ws_ent02delivery)
# Add WebSocket catch-all route
@app.websocket("/{path:path}")
async def catch_all_websocket(websocket: WebSocket, path: str):
    await websocket.close(code=1000)  # Normal connection closure

app.include_router(v1_routers, prefix='/api/v1')


# MIME 타입 추가
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')

def get_file_response(file_path: str):
    """파일 종류에 따른 응답 생성"""
    if os.path.exists(file_path):
        # MIME 타입 결정
        content_type, _ = mimetypes.guess_type(file_path)
        
        # 이미지 파일 처리
        if content_type and content_type.startswith('image/'):
            return FileResponse(file_path, media_type=content_type)
            
        # 폰트 파일 처리
        if file_path.endswith(('.woff2', '.woff', '.ttf', '.eot')):
            font_types = {
                '.woff2': 'font/woff2',
                '.woff': 'font/woff',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject'
            }
            extension = os.path.splitext(file_path)[1]
            return FileResponse(file_path, media_type=font_types.get(extension))
            
        # 기타 정적 파일 처리
        return FileResponse(file_path, media_type=content_type)
    
    return None

# assets 폴더 마운트 (js, css, 폰트 등이 포함됨)
app.mount("/assets", StaticFiles(directory=f"{STATIC_DIR}/assets"), name="assets")

# SPA 라우팅을 위한 폴백 라우트
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # 실제 파일 경로 확인
    file_path = os.path.join(STATIC_DIR, full_path)
    print(f"Requested path: {file_path}")
    
    # 파일이 존재하는 경우 파일 응답 생성
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        response = get_file_response(file_path)
        if response:
            return response
    
    # SPA 라우팅을 위한 index.html 반환
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="File not found")

# dist 루트의 정적 파일들을 위한 마운트 (이미지 등)
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

    if env.lower() == "dev":
        # Development mode settings
        pass
    else:
        print(f"Current environment: {env}, reload disabled")

    print(f"Current working directory: {os.getcwd()}")
    logging.info(f"Current working directory: {os.getcwd()}")

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
        lm.add_log(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="FastAPI server started",
        ))

def stop_server():
    global server
    if server:
        server.should_exit = True
        server = None
        logging.info("FastAPI server stopped")

        lm.add_log(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="FastAPI server stopped",
        ))