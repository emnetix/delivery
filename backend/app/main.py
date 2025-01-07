from fastapi import FastAPI
import uvicorn
import threading
import signal
import time
import logging
from contextlib import contextmanager

from fastapi_server import start_server, stop_server

from ent.log_manager import LogManager as LM
from ent.log_manager import LogInfo
lm = LM()

# Logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@contextmanager
def server_lifecycle():
    try:
        logger.info("Starting delivery server...")
        lm.add_log(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="Starting delivery server...",
        ))
        start_server()
        yield
    finally:
        logger.info("Shutting down delivery server...")
        lm.add_log(LogInfo(
            level="INFO", service=LM.SERVICE_APP,
            message="Shutting down delivery server...",
        ))
        stop_server()
        time.sleep(1)

def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}. Shutting down delivery server...")
    lm.add_log(LogInfo(
        level="INFO", service=LM.SERVICE_APP,
        message=f"Received signal {signum}. Shutting down delivery server...",
    ))
    raise KeyboardInterrupt

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    
    with server_lifecycle():
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Program terminated normally due to keyboard interrupt.")
            lm.add_log(LogInfo(
                level="INFO", service=LM.SERVICE_APP,
                message="Delivery server shutting down normally due to keyboard interrupt...",
            ))