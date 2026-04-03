@echo off
setlocal

cd /d "%~dp0"
"C:\Program Files\Java\jdk-17\bin\java.exe" -jar "%~dp0target\sritha-oils-backend-0.0.1-SNAPSHOT.jar" 1>>"%~dp0run-device-backend.log" 2>>"%~dp0run-device-backend.err"
