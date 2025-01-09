FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9-2024-07-08

WORKDIR /work

COPY ./backend /work/backend
COPY ./frontend/dist-pro /work/frontend/dist-pro

WORKDIR /work/backend

# 가상환경 생성 및 사용
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade -r /work/backend/requirements.txt

ENV ENV=prod

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]