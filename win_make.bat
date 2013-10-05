@echo off
echo $ loading popush path for windows...
set /p POPUSH_PATH=<win_path.txt
echo $ popush path loaded.
echo $ set popush path as system path.
set path==;%POPUSH_PATH%
echo $ done.
echo $ make tmp
mkdir tmp
echo $ make log
mkdir log
echo $ make static/faces
mkdir .\static\faces
echo $ make bin
mkdir bin
gcc -o bin\rm.exe lib\win_rm.c
echo $ make npm
npm install
echo $ done!
pause