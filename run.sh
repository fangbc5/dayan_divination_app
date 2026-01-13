#!/bin/bash
# 启动脚本 - 使用虚拟环境运行应用

cd "$(dirname "$0")"
source venv/bin/activate
cd backend
python app.py

