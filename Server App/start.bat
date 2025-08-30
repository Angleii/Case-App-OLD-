@echo off
if "%JWT_SECRET%"=="" (
  echo JWT_SECRET environment variable is required.
  exit /b 1
)
start cmd /k "node server.js"
start cmd /k "ngrok http --host-header=rewrite 3000"

