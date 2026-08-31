package com.tictactoe.model;

import java.util.Arrays;

/**
 * Result evaluation of a Tic Tac Toe board state.
 */
public class GameResult {
    private final boolean isGameOver;
    private final String winner; // "X", "O", "DRAW", or null (ongoing)
    private final int[] winningLine; // indices e.g. [0, 1, 2], or null
    private final String message;

    public GameResult(boolean isGameOver, String winner, int[] winningLine, String message) {
        this.isGameOver = isGameOver;
        this.winner = winner;
        this.winningLine = winningLine != null ? winningLine.clone() : null;
        this.message = message;
    }

    public static GameResult ongoing() {
        return new GameResult(false, null, null, "Game is in progress");
    }

    public static GameResult win(String winner, int[] line) {
        return new GameResult(true, winner, line, "Player " + winner + " wins!");
    }

    public static GameResult draw() {
        return new GameResult(true, "DRAW", null, "It's a draw!");
    }

    public boolean isGameOver() {
        return isGameOver;
    }

    public String getWinner() {
        return winner;
    }

    public int[] getWinningLine() {
        return winningLine != null ? winningLine.clone() : null;
    }

    public String getMessage() {
        return message;
    }

    public String toJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"isGameOver\":").append(isGameOver).append(",");
        sb.append("\"winner\":").append(winner != null ? "\"" + winner + "\"" : "null").append(",");
        sb.append("\"winningLine\":");
        if (winningLine != null) {
            sb.append("[").append(winningLine[0]).append(",").append(winningLine[1]).append(",").append(winningLine[2]).append("]");
        } else {
            sb.append("null");
        }
        sb.append(",");
        sb.append("\"message\":\"").append(message != null ? message.replace("\"", "\\\"") : "").append("\"");
        sb.append("}");
        return sb.toString();
    }

    @Override
    public String toString() {
        return "GameResult{" +
                "isGameOver=" + isGameOver +
                ", winner='" + winner + '\'' +
                ", winningLine=" + Arrays.toString(winningLine) +
                ", message='" + message + '\'' +
                '}';
    }
}
