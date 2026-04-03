@echo off
setlocal

cd /d "%~dp0frontend"
set "PATH=C:\Program Files\nodejs;%PATH%"
call "C:\Program Files\nodejs\npm.cmd" run dev
