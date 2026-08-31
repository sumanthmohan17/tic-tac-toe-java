@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Starting Tic Tac Toe Java Full-Stack App...
echo ===================================================

:: Check Java Installation
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH! Please install JDK 17 or higher.
    pause
    exit /b 1
)

:: Create bin directory
if not exist "bin" mkdir bin

echo Compiling Java source files...
javac -encoding UTF-8 -d bin -sourcepath src/main/java src/main/java/com/tictactoe/model/*.java src/main/java/com/tictactoe/service/*.java src/main/java/com/tictactoe/Main.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo Compilation successful!
echo.
echo ===================================================
echo   Server is starting at http://localhost:8080
echo   Opening browser in 2 seconds...
echo ===================================================

:: Open browser automatically after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"

:: Run Java HTTP Server
java -cp bin com.tictactoe.Main

pause
