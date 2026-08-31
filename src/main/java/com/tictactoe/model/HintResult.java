package com.tictactoe.model;

/**
 * Encapsulates a strategic move hint for the player.
 */
public class HintResult {
    private final int move; // 0-8 cell index
    private final String rationale; // Clear explanation why this move is recommended
    private final String category; // "WIN", "BLOCK", "CENTER", "CORNER", "STRATEGIC"
    private final String playerSymbol;

    public HintResult(int move, String rationale, String category, String playerSymbol) {
        this.move = move;
        this.rationale = rationale;
        this.category = category;
        this.playerSymbol = playerSymbol;
    }

    public int getMove() {
        return move;
    }

    public String getRationale() {
        return rationale;
    }

    public String getCategory() {
        return category;
    }

    public String getPlayerSymbol() {
        return playerSymbol;
    }

    public String toJson() {
        return "{" +
                "\"move\":" + move + "," +
                "\"rationale\":\"" + (rationale != null ? rationale.replace("\"", "\\\"") : "") + "\"," +
                "\"category\":\"" + (category != null ? category : "STRATEGIC") + "\"," +
                "\"playerSymbol\":\"" + (playerSymbol != null ? playerSymbol : "X") + "\"" +
                "}";
    }
}
