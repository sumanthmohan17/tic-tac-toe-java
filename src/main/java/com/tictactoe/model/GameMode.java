package com.tictactoe.model;

/**
 * Supported game modes.
 */
public enum GameMode {
    HUMAN_VS_HUMAN("Pass & Play (2 Players)"),
    HUMAN_VS_AI("Player vs AI");

    private final String label;

    GameMode(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static GameMode fromString(String text) {
        if (text == null) return HUMAN_VS_AI;
        for (GameMode m : GameMode.values()) {
            if (m.name().equalsIgnoreCase(text.trim())) {
                return m;
            }
        }
        return HUMAN_VS_AI;
    }
}
