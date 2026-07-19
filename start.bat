@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)

echo Iniciando la aplicacion...
start "Netflix-style app" http://localhost:3000
npm start
