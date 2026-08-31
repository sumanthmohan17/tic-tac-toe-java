package com.tictactoe.service;

import com.tictactoe.model.Board;
import com.tictactoe.model.GameResult;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for core game rules and win validation.
 */
public class GameService {

    /**
     * Checks whether the current board state has a winner, is a draw, or is ongoing.
     */
    public GameResult evaluateBoard(Board board) {
        String[] cells = board.getCells();

        // Check all 8 winning combinations
        for (int[] combo : Board.WINNING_COMBINATIONS) {
            String c0 = cells[combo[0]];
            String c1 = cells[combo[1]];
            String c2 = cells[combo[2]];

            if (!Board.EMPTY.equals(c0) && c0.equals(c1) && c1.equals(c2)) {
                return GameResult.win(c0, combo);
            }
        }

        // Check for Draw (board is full and no winner)
        if (board.isFull()) {
            return GameResult.draw();
        }

        // Otherwise game continues
        return GameResult.ongoing();
    }

    /**
     * Returns structured rules and guidelines for the game.
     */
    public String getRulesJson() {
        return "{\n" +
                "  \"title\": \"Tic-Tac-Toe Rules & Guidelines\",\n" +
                "  \"summary\": \"Tic-Tac-Toe is a classic two-player turn-based strategy game played on a 3x3 grid.\",\n" +
                "  \"rules\": [\n" +
                "    \"Players take turns placing their chosen mark (X or O) in an empty cell on the 3x3 grid.\",\n" +
                "    \"The first player to align 3 of their marks horizontally, vertically, or diagonally wins the round.\",\n" +
                "    \"If all 9 cells are filled without any player achieving 3-in-a-row, the game ends in a Draw (Tie).\",\n" +
                "    \"Players can choose to play as Cross (X) or Circle (O), and configure who moves first.\"\n" +
                "  ],\n" +
                "  \"modes\": [\n" +
                "    {\"name\": \"Human vs Human\", \"desc\": \"Pass and play locally on the same device with a friend.\"},\n" +
                "    {\"name\": \"Human vs Computer (AI)\", \"desc\": \"Challenge the built-in AI with 3 distinct difficulty settings.\"}\n" +
                "  ],\n" +
                "  \"difficulties\": [\n" +
                "    {\"level\": \"Easy\", \"desc\": \"AI plays relaxed, random moves. Ideal for beginners or casual fun.\"},\n" +
                "    {\"level\": \"Medium\", \"desc\": \"Tactical AI: Blocks opponent winning moves and captures immediate winning opportunities.\"},\n" +
                "    {\"level\": \"Hard\", \"desc\": \"Master AI powered by the Minimax algorithm. Calculates every future branch — mathematically unbeatable!\"}\n" +
                "  ],\n" +
                "  \"hintSystem\": \"Need guidance? Click '💡 Get Hint' during your turn to highlight the optimal strategic cell with an explanation of why it works!\"\n" +
                "}";
    }
}
