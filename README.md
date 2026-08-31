# 🎮 Tic Tac Toe - Modern Java Full-Stack Web Application

A clean, modern, and high-performance **Java Full-Stack Tic-Tac-Toe** game featuring an unbeatable Minimax AI, smart tactical hint engine, Pass & Play two-player mode, rules & regulations modal, animated victory strike line, and Web Audio API synthesized sound effects with zero heavy external dependencies.

---

## 🌐 Live Demo

👉 **[https://tic-tac-toe-java-au8d.onrender.com](https://tic-tac-toe-java-au8d.onrender.com)**

*Hosted as a free-tier Docker web service on [Render](https://render.com). Note: the free instance spins down after periods of inactivity, so the first request after idling may take up to ~50 seconds to wake up.*

---

## ✨ Features

1. **📖 Interactive Rules & Regulations Modal**:
   - Easily accessible from the top bar at any point in the game.
   - Explains core objectives, turn order, winning alignment patterns (horizontal, vertical, diagonal), AI difficulty levels, and hint mechanics with illustrated mini-grid diagrams.

2. **🤖 AI with 3 Difficulty Levels**:
   - **🟢 Easy**: Plays relaxed, randomized moves (great for beginners).
   - **🟡 Medium**: Tactical heuristics — seizes immediate winning moves, blocks 2-in-a-row threats, and claims center/corner advantages.
   - **🔴 Hard (Minimax Engine)**: Unbeatable recursive game-tree search with depth weighting and alpha-beta pruning.

3. **👥 Pass & Play 2-Player (PvP) Mode**:
   - Allows choosing **Cross (X)** or **Circle (O)** symbols.
   - Customizable player names for Player 1 and Player 2.
   - Automatic turn indicator and scoreboard tracking.

4. **💡 Smart Move Hint System**:
   - Press **"💡 Get Hint"** during your turn to highlight the mathematically best cell.
   - Distinctive **pulsing golden border**, glowing bulb badge, and rationale callout banner explaining the strategic reasoning (e.g., *"Critical Block!"*, *"Center Control!"*, *"Winning Move!"*).
   - Automatically dismisses once the move is played.

5. **🏆 Proper Winner Detection & Visual Feedback**:
   - Detects all 8 winning 3-in-a-row lines (3 rows, 3 columns, 2 diagonals) and full-board ties/draws.
   - **Animated SVG Glowing Strike-Through Line** drawn across the winning cells.
   - Victory celebration with full-screen **HTML5 Canvas Confetti**.
   - Result modal with match summary and round-by-round scoreboard (X wins, O wins, Draws).

6. **🎨 Modern Glassmorphic UI/UX**:
   - Neon glow accents (Cyan for X, Coral for O, Gold for Hints).
   - Dark mode & Light mode toggle.
   - **Web Audio API sound synthesis** (custom oscillator tones for moves, hints, victory fanfare, and ties — no audio assets required).
   - Fully responsive for mobile devices, tablets, and desktops.

---

## 🛠️ Technology Stack

- **Backend**: Pure **Java 17 (OpenJDK)** using `com.sun.net.httpserver.HttpServer` (zero external jar dependencies required to build and run!).
- **REST Endpoints**:
  - `GET  /api/rules` - Returns game rules and instructions JSON.
  - `POST /api/ai-move` - Evaluates board state and returns optimal AI move.
  - `POST /api/hint` - Evaluates board state and returns optimal hint recommendation + rationale.
  - `POST /api/check-win` - Validates board state and returns winner/draw + winning cell line indices.
  - `GET  /api/health` - Server health check.
- **Frontend**: Semantic HTML5, Glassmorphism CSS3 with CSS variables & keyframe animations, Vanilla JavaScript (ES6+), Web Audio API, and Canvas API.
- **Build System**: Standard Maven `pom.xml` + Standalone batch/bash scripts.
- **Containerization**: Multi-stage **Dockerfile** (Maven build stage → lightweight Eclipse Temurin JRE runtime stage).
- **Deployment**: Hosted on **Render** as a Dockerized web service, reading the `PORT` environment variable at runtime for platform compatibility.

---

## 🚀 How to Run

### Option 1: One-Click Run (Windows)
Double-click `run.bat` or run in terminal:
```bat
run.bat
```
*This compiles the Java files and automatically launches `http://localhost:8080` in your default browser.*

---

### Option 2: Linux / macOS
```bash
chmod +x run.sh
./run.sh
```

---

### Option 3: Standard `javac` & `java` Commands
```bash
# 1. Create output directory
mkdir bin

# 2. Compile source files
javac -d bin -sourcepath src/main/java src/main/java/com/tictactoe/model/*.java src/main/java/com/tictactoe/service/*.java src/main/java/com/tictactoe/Main.java

# 3. Start server
java -cp bin com.tictactoe.Main
```
Then open your browser and navigate to:
👉 **`http://localhost:8080`**

---

### Option 4: 🐳 Run with Docker

The project ships with a multi-stage `Dockerfile` (Maven build → Eclipse Temurin JRE runtime), the same setup used for the live deployment above.

```bash
# 1. Build the image
docker build -t tic-tac-toe .

# 2. Run the container
docker run -p 8080:8080 -e PORT=8080 tic-tac-toe
```
Then open your browser and navigate to:
👉 **`http://localhost:8080`**

*The app reads the `PORT` environment variable at startup (falling back to `8080` if unset), making it compatible with cloud platforms like Render, Railway, or Fly.io that inject their own port at runtime.*

---

## 📦 Deploying Your Own Instance

This project is ready to deploy as-is on any Docker-friendly platform (Render, Railway, Fly.io, etc.):

1. Fork/clone this repository and push it to your own GitHub account.
2. Create a new **Web Service** on your platform of choice, selecting **Docker** as the runtime/language.
3. Point it at the repo root — no custom build/start commands needed, the `Dockerfile` handles everything.
4. Deploy. The app will automatically bind to whatever port the platform provides via the `PORT` environment variable.

---

## 📁 Project Structure

```
Tic tac toe/
├── Dockerfile                            # Multi-stage build: Maven build → JRE runtime
├── pom.xml                               # Standard Maven project configuration
├── run.bat                               # Windows 1-click compile & launch script
├── run.sh                                # Linux/macOS compile & launch script
├── README.md                             # Documentation & user guide
├── .gitignore                            # Excludes build output (bin/, target/) from version control
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── tictactoe/
        │           ├── Main.java         # HTTP Server, REST API Routing, Static Asset Handler
        │           ├── model/
        │           │   ├── Board.java        # 3x3 Board representation & winning combinations
        │           │   ├── Difficulty.java   # EASY, MEDIUM, HARD enum
        │           │   ├── GameMode.java     # HUMAN_VS_AI, HUMAN_VS_HUMAN enum
        │           │   ├── GameResult.java   # Game outcome evaluation & winning line
        │           │   └── HintResult.java   # Move recommendation model & rationale
        │           └── service/
        │               ├── AiService.java    # Easy, Medium, Hard (Minimax) & Hint Engine
        │               └── GameService.java  # Rules provider & Win evaluation service
        └── resources/
            └── static/
                ├── index.html            # Modern HTML5 responsive layout & modals
                ├── css/
                │   └── style.css         # Glassmorphic cyber/neon styling & animations
                └── js/
                    └── app.js            # Client-side engine, REST API client & audio synth
```

> **Note:** `bin/` and `target/` are compiled build artifacts and are intentionally excluded from version control via `.gitignore`. They are regenerated automatically whenever you build or run the project.
