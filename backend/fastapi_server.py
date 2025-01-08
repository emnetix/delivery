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