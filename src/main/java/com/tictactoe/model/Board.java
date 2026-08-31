package com.tictactoe.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 3x3 Tic Tac Toe board representation.
 * Cell indices:
 *  0 | 1 | 2
 * ---+---+---
 *  3 | 4 | 5
 * ---+---+---
 *  6 | 7 | 8
 */
public class Board {
    public static final int SIZE = 9;
    public static final String EMPTY = "";
    public static final String PLAYER_X = "X";
    public static final String PLAYER_O = "O";

    // 8 winning combinations: 3 horizontal, 3 vertical, 2 diagonal
    public static final int[][] WINNING_COMBINATIONS = {
        {0, 1, 2}, // Row 1
        {3, 4, 5}, // Row 2
        {6, 7, 8}, // Row 3
        {0, 3, 6}, // Col 1
        {1, 4, 7}, // Col 2
        {2, 5, 8}, // Col 3
        {0, 4, 8}, // Diagonal top-left to bottom-right
        {2, 4, 6}  // Diagonal top-right to bottom-left
    };

    private final String[] cells;

    public Board() {
        this.cells = new String[SIZE];
        Arrays.fill(this.cells, EMPTY);
    }

    public Board(String[] initialCells) {
        this.cells = new String[SIZE];
        if (initialCells != null) {
            for (int i = 0; i < Math.min(initialCells.length, SIZE); i++) {
                String val = initialCells[i];
                if (val != null && (val.equalsIgnoreCase(PLAYER_X) || val.equalsIgnoreCase(PLAYER_O))) {
                    this.cells[i] = val.toUpperCase();
                } else {
                    this.cells[i] = EMPTY;
                }
            }
            for (int i = initialCells.length; i < SIZE; i++) {
                this.cells[i] = EMPTY;
            }
        } else {
            Arrays.fill(this.cells, EMPTY);
        }
    }

    public String[] getCells() {
        return cells.clone();
    }

    public String getCell(int index) {
        if (index >= 0 && index < SIZE) {
            return cells[index];
        }
        return EMPTY;
    }

    public boolean isCellEmpty(int index) {
        return index >= 0 && index < SIZE && EMPTY.equals(cells[index]);
    }

    public boolean setCell(int index, String player) {
        if (isCellEmpty(index)) {
            cells[index] = player;
            return true;
        }
        return false;
    }

    public List<Integer> getAvailableMoves() {
        List<Integer> available = new ArrayList<>();
        for (int i = 0; i < SIZE; i++) {
            if (isCellEmpty(i)) {
                available.add(i);
            }
        }
        return available;
    }

    public boolean isFull() {
        for (String cell : cells) {
            if (EMPTY.equals(cell)) {
                return false;
            }
        }
        return true;
    }

    public Board copy() {
        return new Board(this.cells);
    }
}
