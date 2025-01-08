import time
from datetime import datetime

class LogInfo:
    def __init__(self, level, service, message):
        # "timestamp": "2024-03-20T10:30:00Z",
        # "level": "ERROR",
        # "service": "delivery-api",
        # "message": "Order creation failed",
        self.timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f%z")
        self.level = level
        self.service = service
        self.message = message


class LogManager:
    _instance = None
    MAX_LOGS = 1000  # Maximum number of logs to store

    SERVICE_APP = "app"
    SERVICE_DELIVERY = "delivery"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LogManager, cls).__new__(cls)
            cls._instance.logs = []
        return cls._instance

    def __init__(self):
        # Nothing to initialize here as it's done in __new__
        pass

    def initialize_logs(self):
        self.logs = []
        return
    
    def add_log(self, log_info: LogInfo):
        self.logs.append(log_info)
        # Remove oldest log if maximum log count is exceeded
        if len(self.logs) > self.MAX_LOGS:
            self.logs.pop(0)  # Remove first (oldest) log

    def get_log_info(self):
        return {
            "first_log_timestamp": self.logs[0].timestamp if self.logs else None,
            "last_log_timestamp": self.logs[-1].timestamp if self.logs else None,
            "total_logs": len(self.logs)
        }
    
    def get_logs(self, after=None, limit=None):
        # If after parameter is not provided, target all logs
        filtered_logs = self.logs if after is None else [log for log in self.logs if log.timestamp > after]
        
        # If limit is set, return only that many logs
        if limit is not None:
            filtered_logs = filtered_logs[:limit]
        
        return filtered_logs