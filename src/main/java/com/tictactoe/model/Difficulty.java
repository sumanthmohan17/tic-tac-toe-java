package com.tictactoe.model;

/**
 * Difficulty levels for AI opponent.
 */
public enum Difficulty {
    EASY("Easy", "Makes casual and random moves"),
    MEDIUM("Medium", "Tactical: blocks wins and grabs immediate advantages"),
    HARD("Hard", "Unbeatable: Powered by the Minimax algorithm");

    private final String displayName;
    private final String description;

    Difficulty(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public static Difficulty fromString(String text) {
        if (text == null) return MEDIUM;
        for (Difficulty d : Difficulty.values()) {
            if (d.name().equalsIgnoreCase(text.trim()) || d.displayName.equalsIgnoreCase(text.trim())) {
                return d;
            }
        }
        return MEDIUM;
    }
}
