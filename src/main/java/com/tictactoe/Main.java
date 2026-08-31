package com.tictactoe;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.tictactoe.model.Board;
import com.tictactoe.model.Difficulty;
import com.tictactoe.model.GameResult;
import com.tictactoe.model.HintResult;
import com.tictactoe.service.AiService;
import com.tictactoe.service.GameService;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.concurrent.Executors;

/**
 * Server entry point providing REST API and serving modern static UI.
 */
public class Main {
    private static final int DEFAULT_PORT = 8080;
    private static final GameService gameService = new GameService();
    private static final AiService aiService = new AiService(gameService);

    public static void main(String[] args) throws IOException {
        int port = getPort();
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(10));

        // REST API Endpoints
        server.createContext("/api/rules", new RulesHandler());
        server.createContext("/api/ai-move", new AiMoveHandler());
        server.createContext("/api/hint", new HintHandler());
        server.createContext("/api/check-win", new CheckWinHandler());
        server.createContext("/api/health", new HealthHandler());

        // Static Web Files Handler
        server.createContext("/", new StaticFileHandler());

        server.start();
        System.out.println("=================================================");
        System.out.println(" [*] Tic-Tac-Toe Java Full-Stack App is running! ");
        System.out.println(" [*] Open in browser: http://localhost:" + port);
        System.out.println("=================================================");
    }

    private static int getPort() {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                return Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {}
        }
        String propPort = System.getProperty("server.port");
        if (propPort != null && !propPort.isBlank()) {
            try {
                return Integer.parseInt(propPort.trim());
            } catch (NumberFormatException ignored) {}
        }
        return DEFAULT_PORT;
    }

    // ==========================================
    // HTTP Handlers
    // ==========================================

    static class RulesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            String rulesJson = gameService.getRulesJson();
            sendJsonResponse(exchange, 200, rulesJson);
        }
    }

    static class AiMoveHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            String body = readRequestBody(exchange);
            String[] boardCells = parseBoardFromJson(body);
            String aiSymbol = parseStringField(body, "aiSymbol", "O");
            String diffStr = parseStringField(body, "difficulty", "HARD");
            Difficulty difficulty = Difficulty.fromString(diffStr);

            Board board = new Board(boardCells);
            int move = aiService.calculateAiMove(board, aiSymbol, difficulty);

            String jsonResponse = "{" +
                    "\"move\":" + move + "," +
                    "\"aiSymbol\":\"" + aiSymbol + "\"," +
                    "\"difficulty\":\"" + difficulty.name() + "\"" +
                    "}";

            sendJsonResponse(exchange, 200, jsonResponse);
        }
    }

    static class HintHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            String body = readRequestBody(exchange);
            String[] boardCells = parseBoardFromJson(body);
            String playerSymbol = parseStringField(body, "playerSymbol", "X");

            Board board = new Board(boardCells);
            HintResult hint = aiService.calculateHint(board, playerSymbol);

            sendJsonResponse(exchange, 200, hint.toJson());
        }
    }

    static class CheckWinHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            String body = readRequestBody(exchange);
            String[] boardCells = parseBoardFromJson(body);
            Board board = new Board(boardCells);
            GameResult result = gameService.evaluateBoard(board);

            sendJsonResponse(exchange, 200, result.toJson());
        }
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            sendJsonResponse(exchange, 200, "{\"status\":\"UP\",\"app\":\"Tic-Tac-Toe\",\"version\":\"1.0.0\"}");
        }
    }

    /**
     * Static file handler serving index.html, CSS, and JS files.
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isBlank()) {
                path = "/index.html";
            }

            // Prevent path traversal
            if (path.contains("..")) {
                sendError(exchange, 403, "Forbidden");
                return;
            }

            byte[] content = loadStaticResource(path);
            if (content == null) {
                // Fallback to index.html if single page app request
                content = loadStaticResource("/index.html");
                if (content == null) {
                    sendError(exchange, 404, "404 Not Found");
                    return;
                }
                path = "/index.html";
            }

            String contentType = getMimeType(path);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
            exchange.getResponseHeaders().set("Pragma", "no-cache");
            exchange.getResponseHeaders().set("Expires", "0");
            exchange.sendResponseHeaders(200, content.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        }
    }

    // ==========================================
    // Helper Utilities
    // ==========================================

    private static byte[] loadStaticResource(String resourcePath) {
        String normalizedPath = resourcePath.startsWith("/") ? resourcePath : "/" + resourcePath;

        // 1. Try classpath resource (inside JAR or built classes)
        try (InputStream is = Main.class.getResourceAsStream("/static" + normalizedPath)) {
            if (is != null) {
                return is.readAllBytes();
            }
        } catch (Exception ignored) {}

        // 2. Try file system relative paths (when developing / running via javac)
        Path[] searchPaths = new Path[]{
                Paths.get("src/main/resources/static" + normalizedPath),
                Paths.get("resources/static" + normalizedPath),
                Paths.get("static" + normalizedPath),
                Paths.get("." + normalizedPath)
        };

        for (Path p : searchPaths) {
            if (Files.exists(p) && !Files.isDirectory(p)) {
                try {
                    return Files.readAllBytes(p);
                } catch (IOException ignored) {}
            }
        }

        return null;
    }

    private static String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".txt")) return "text/plain; charset=UTF-8";
        return "application/octet-stream";
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        String json = "{\"error\":\"" + message + "\",\"status\":" + statusCode + "}";
        sendJsonResponse(exchange, statusCode, json);
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * Lightweight JSON parser for board array e.g. ["X","","O",...]
     */
    public static String[] parseBoardFromJson(String json) {
        String[] defaultBoard = new String[9];
        Arrays.fill(defaultBoard, "");
        if (json == null || json.isBlank()) return defaultBoard;

        int boardKeyIdx = json.indexOf("\"board\"");
        if (boardKeyIdx == -1) return defaultBoard;

        int startBracket = json.indexOf("[", boardKeyIdx);
        int endBracket = json.indexOf("]", startBracket);
        if (startBracket == -1 || endBracket == -1) return defaultBoard;

        String arrayContent = json.substring(startBracket + 1, endBracket);
        String[] items = arrayContent.split(",");
        String[] result = new String[9];
        Arrays.fill(result, "");

        for (int i = 0; i < Math.min(items.length, 9); i++) {
            String item = items[i].trim().replace("\"", "").replace("'", "");
            if (item.equalsIgnoreCase("X") || item.equalsIgnoreCase("O")) {
                result[i] = item.toUpperCase();
            } else {
                result[i] = "";
            }
        }
        return result;
    }

    /**
     * Lightweight JSON parser for string properties.
     */
    public static String parseStringField(String json, String fieldName, String defaultValue) {
        if (json == null || json.isBlank()) return defaultValue;
        String pattern = "\"" + fieldName + "\"";
        int keyIdx = json.indexOf(pattern);
        if (keyIdx == -1) return defaultValue;

        int colonIdx = json.indexOf(":", keyIdx + pattern.length());
        if (colonIdx == -1) return defaultValue;

        int quoteStart = json.indexOf("\"", colonIdx);
        if (quoteStart == -1) return defaultValue;

        int quoteEnd = json.indexOf("\"", quoteStart + 1);
        if (quoteEnd == -1) return defaultValue;

        return json.substring(quoteStart + 1, quoteEnd);
    }
}
