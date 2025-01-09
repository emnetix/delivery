# delivery
Data transfer via WebSocket

# 프로젝트 구조
```
├── LICENSE
├── README.md
├── apps
│   ├── go-client
│   └── python-client
├── backend
│   └── api
├── docs
└── frontend
    ├── react
    │   └── src
    └── vue
        └── src

```

# 시작하기
## 백엔드
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
ENV=dev python main.py

```
## 클라이언트
```bash
cd apps
cd python-client
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd example_simple
ENV=dev python main.py

```

```bash
cd apps
cd go-client
go mod init delivery
go mod tidy

```
## 프론트엔드
``` bash
cd frontend/react # OR frontend/vue
npm install
npm run dev
```


# 기술
## 백엔드
## 클라이언트
## 프론트엔드
### 공통
- SocketIO - Socket

### React
- Mui - UI

### Vue
- Element-plus - UI
