@echo off
start cmd /k "node server.js"
start cmd /k "ngrok http --host-header=rewrite 3000"