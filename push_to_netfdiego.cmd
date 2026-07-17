@echo off
cd /d %~dp0
git add -A
git commit -m "Deploy project to NETFDIEGO"
git push origin main
echo Push complete or authentication required.
pause
