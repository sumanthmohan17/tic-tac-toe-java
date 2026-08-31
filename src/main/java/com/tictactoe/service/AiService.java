package com.tictactoe.service;

import com.tictactoe.model.Board;
import com.tictactoe.model.Difficulty;
import com.tictactoe.model.GameResult;
import com.tictactoe.model.HintResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Service for calculating AI moves and player move hints.
 */
public class AiService {

    private final GameService gameService;
    private final Random random;

    public AiService(GameService gameService) {
        this.gameService = gameService;
        this.random = new Random();
    }

    /**
     * Determines the AI move based on chosen difficulty.
     *
     * @param board      current board state
     * @param aiSymbol   "X" or "O"
     * @param difficulty EASY, MEDIUM, or HARD
     * @return 0-8 cell index
     */
    public int calculateAiMove(Board board, String aiSymbol, Difficulty difficulty) {
        List<Integer> availableMoves = board.getAvailableMoves();
        if (availableMoves.isEmpty()) {
            return -1;
        }
        if (availableMoves.size() == 1) {
            return availableMoves.get(0);
        }

        String humanSymbol = Board.PLAYER_X.equalsIgnoreCase(aiSymbol) ? Board.PLAYER_O : Board.PLAYER_X;

        return switch (difficulty) {
            case EASY -> getEasyMove(availableMoves);
            case MEDIUM -> getMediumMove(board, availableMoves, aiSymbol, humanSymbol);
            case HARD -> getHardMove(board, aiSymbol, humanSymbol);
        };
    }

    /**
     * Easy: Random selection among empty cells.
     */
    private int getEasyMove(List<Integer> availableMoves) {
        return availableMoves.get(random.nextInt(availableMoves.size()));
    }

    /**
     * Medium: Smart heuristics.
     * 1. Check for immediate winning move.
     * 2. Check for immediate opponent winning move to block.
     * 3. Favor center square (cell 4).
     * 4. Favor corner squares (0, 2, 6, 8).
     * 5. Otherwise random move.
     */
    private int getMediumMove(Board board, List<Integer> availableMoves, String aiSymbol, String humanSymbol) {
        // 1. Can AI win right now?
        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, aiSymbol);
            GameResult res = gameService.evaluateBoard(testBoard);
            if (res.isGameOver() && aiSymbol.equals(res.getWinner())) {
                return move;
            }
        }

        // 2. Can opponent win right now? Block them!
        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, humanSymbol);
            GameResult res = gameService.evaluateBoard(testBoard);
            if (res.isGameOver() && humanSymbol.equals(res.getWinner())) {
                return move;
            }
        }

        // 3. Take center with 70% probability if open
        if (board.isCellEmpty(4) && random.nextDouble() < 0.70) {
            return 4;
        }

        // 4. Take a corner with 50% probability
        int[] corners = {0, 2, 6, 8};
        List<Integer> openCorners = new ArrayList<>();
        for (int corner : corners) {
            if (board.isCellEmpty(corner)) {
                openCorners.add(corner);
            }
        }
        if (!openCorners.isEmpty() && random.nextDouble() < 0.50) {
            return openCorners.get(random.nextInt(openCorners.size()));
        }

        // 5. Fallback to random available move
        return availableMoves.get(random.nextInt(availableMoves.size()));
    }

    /**
     * Hard: Unbeatable Minimax algorithm.
     */
    private int getHardMove(Board board, String aiSymbol, String humanSymbol) {
        int bestScore = Integer.MIN_VALUE;
        int bestMove = -1;

        List<Integer> availableMoves = board.getAvailableMoves();
        // If board is empty, picking a corner or center is optimal
        if (availableMoves.size() == 9) {
            int[] strategicStarts = {0, 2, 4, 6, 8};
            return strategicStarts[random.nextInt(strategicStarts.length)];
        }

        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, aiSymbol);

            int score = minimax(testBoard, 0, false, aiSymbol, humanSymbol, Integer.MIN_VALUE, Integer.MAX_VALUE);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove != -1 ? bestMove : availableMoves.get(0);
    }

    /**
     * Minimax recursive evaluation with depth scoring and alpha-beta pruning.
     */
    private int minimax(Board board, int depth, boolean isMaximizing, String aiSymbol, String humanSymbol, int alpha, int beta) {
        GameResult result = gameService.evaluateBoard(board);

        if (result.isGameOver()) {
            if (aiSymbol.equals(result.getWinner())) {
                return 10 - depth; // Prefer faster wins
            } else if (humanSymbol.equals(result.getWinner())) {
                return depth - 10; // Prefer slower losses
            } else {
                return 0; // Draw
            }
        }

        List<Integer> availableMoves = board.getAvailableMoves();

        if (isMaximizing) {
            int maxEval = Integer.MIN_VALUE;
            for (int move : availableMoves) {
                Board testBoard = board.copy();
                testBoard.setCell(move, aiSymbol);
                int eval = minimax(testBoard, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break; // Pruning
                }
            }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            for (int move : availableMoves) {
                Board testBoard = board.copy();
                testBoard.setCell(move, humanSymbol);
                int eval = minimax(testBoard, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break; // Pruning
                }
            }
            return minEval;
        }
    }

    /**
     * Generates the best move hint and clear rationale for the requesting player.
     *
     * @param board        current board state
     * @param playerSymbol "X" or "O"
     * @return HintResult with move index, explanation rationale, and category
     */
    public HintResult calculateHint(Board board, String playerSymbol) {
        List<Integer> availableMoves = board.getAvailableMoves();
        if (availableMoves.isEmpty()) {
            return new HintResult(-1, "No moves remaining on the board.", "NONE", playerSymbol);
        }

        String opponentSymbol = Board.PLAYER_X.equalsIgnoreCase(playerSymbol) ? Board.PLAYER_O : Board.PLAYER_X;

        // 1. Can player win immediately?
        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, playerSymbol);
            GameResult res = gameService.evaluateBoard(testBoard);
            if (res.isGameOver() && playerSymbol.equals(res.getWinner())) {
                return new HintResult(move, "Winning Move! Play here to complete 3 in a row and win immediately!", "WIN", playerSymbol);
            }
        }

        // 2. Can opponent win immediately? Block them!
        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, opponentSymbol);
            GameResult res = gameService.evaluateBoard(testBoard);
            if (res.isGameOver() && opponentSymbol.equals(res.getWinner())) {
                return new HintResult(move, "Critical Block! Prevent your opponent from completing 3 in a row.", "BLOCK", playerSymbol);
            }
        }

        // 3. Is center open early?
        if (board.isCellEmpty(4) && availableMoves.size() >= 7) {
            return new HintResult(4, "Center Control! Dominating the center gives you 4 potential winning lines.", "CENTER", playerSymbol);
        }

        // 4. Run Minimax to find highest scoring move
        int bestMove = -1;
        int bestScore = Integer.MIN_VALUE;

        for (int move : availableMoves) {
            Board testBoard = board.copy();
            testBoard.setCell(move, playerSymbol);
            int score = minimax(testBoard, 0, false, playerSymbol, opponentSymbol, Integer.MIN_VALUE, Integer.MAX_VALUE);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (bestMove == -1) {
            bestMove = availableMoves.get(0);
        }

        // Categorize rationale based on position
        if (bestMove == 4) {
            return new HintResult(bestMove, "Center Square: Best position to control multiple winning vectors.", "CENTER", playerSymbol);
        } else if (bestMove == 0 || bestMove == 2 || bestMove == 6 || bestMove == 8) {
            return new HintResult(bestMove, "Corner Advantage: Secures a strategic anchor to set up fork attacks.", "CORNER", playerSymbol);
        } else {
            return new HintResult(bestMove, "Strategic Position: Optimal move calculated to maintain board pressure.", "STRATEGIC", playerSymbol);
        }
    }
}
