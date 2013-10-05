@echo off
echo loading popush path for windows...
set /p POPUSH_PATH=<win_path.txt
echo popush path loaded.
echo set popush path as system path.
set path==%path%;%cd%\bin;%POPUSH_PATH%
echo done.
echo start popush and log to log/popush.log
node app.js > log\popush.log
echo you have just stopped popush.
pause
