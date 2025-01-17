#!/usr/bin/env bash    

echo "build frontend"
VITE_OUT_DIR=../dist-pro pnpm run build:pro
