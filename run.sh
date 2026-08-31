#!/usr/bin/env bash

echo "==================================================="
echo "  Starting Tic Tac Toe Java Full-Stack App..."
echo "==================================================="

# Check Java
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed or not in PATH! Please install JDK 17 or higher."
    exit 1
fi

mkdir -p bin

echo "Compiling Java source files..."
javac -encoding UTF-8 -d bin -sourcepath src/main/java src/main/java/com/tictactoe/model/*.java src/main/java/com/tictactoe/service/*.java src/main/java/com/tictactoe/Main.java

if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed!"
    exit 1
fi

echo "Compilation successful!"
echo ""
echo "==================================================="
echo "  Server running at http://localhost:8080"
echo "==================================================="

# Open browser in background if xdg-open or open exists
if command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:8080) &
elif command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:8080) &
fi

java -cp bin com.tictactoe.Main
