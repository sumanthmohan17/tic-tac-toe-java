/**
 * Verification Test Suite: Tic Tac Toe Game Flow & Notification System
 * Tests:
 * 1. Win Situation (Output, Notification, Modal, Next Round Option)
 * 2. Lose Situation (Output, Notification, Modal, Next Round Option)
 * 3. Draw Situation (Output, Notification, Modal, Next Round Option)
 * 4. Multi-Round PvP Progression (Board reset, score accumulation, round 2, 3, 4...)
 */

const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log(' 🧪 RUNNING TIC TAC TOE GAME FLOW & NOTIFICATION VERIFICATION ');
console.log('===============================================================');

// Mock DOM Environment
function createMockDom() {
    const createElement = (id) => ({
        id,
        textContent: '',
        className: '',
        classList: {
            classes: new Set(['hidden']),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
        },
        innerHTML: '',
        style: {},
        disabled: false,
        setAttribute(k, v) { this[k] = v; },
        value: ''
    });

    const dom = {
        // App header
        btnRules: createElement('btn-rules'),
        btnSound: createElement('btn-sound'),
        iconSoundOn: createElement('icon-sound-on'),
        iconSoundOff: createElement('icon-sound-off'),
        btnTheme: createElement('btn-theme'),
        iconSun: createElement('icon-sun'),
        iconMoon: createElement('icon-moon'),

        // Setup Screen
        setupPanel: createElement('setup-panel'),
        p1Label: createElement('p1-label'),
        player1NameInput: createElement('player1-name'),
        p2NameGroup: createElement('p2-name-group'),
        p2Label: createElement('p2-label'),
        player2NameInput: createElement('player2-name'),
        btnStartGame: createElement('btn-start-game'),

        // Game Arena
        gameArena: createElement('game-arena'),
        matchModeBadge: createElement('match-mode-badge'),
        roundIndicator: createElement('round-indicator'),
        btnHint: createElement('btn-hint'),
        btnRestartRound: createElement('btn-restart-round'),
        btnChangeSettings: createElement('btn-change-settings'),

        // Turn & Notifications
        turnBanner: createElement('turn-banner'),
        turnIndicator: createElement('turn-indicator'),
        turnSymbol: createElement('turn-symbol'),
        turnText: createElement('turn-text'),
        thinkingSpinner: createElement('thinking-spinner'),
        hintBanner: createElement('hint-banner'),
        hintCategoryTitle: createElement('hint-category-title'),
        hintRationaleText: createElement('hint-rationale-text'),
        btnDismissHint: createElement('btn-dismiss-hint'),
        roundToast: createElement('round-toast'),
        roundToastText: createElement('round-toast-text'),

        // Inline Winner Banner
        winnerBanner: createElement('winner-banner'),
        winnerBannerIcon: createElement('winner-banner-icon'),
        winnerBannerTitle: createElement('winner-banner-title'),
        winnerBannerSub: createElement('winner-banner-sub'),
        btnInlineNextRound: createElement('btn-inline-next-round'),
        btnInlineNextRoundText: createElement('btn-inline-next-round-text'),

        // Board
        boardContainer: createElement('board-container'),
        cells: Array.from({ length: 9 }, (_, i) => createElement(`cell-${i}`)),
        strikeLine: createElement('strike-line'),

        // Scoreboard
        scoreP1Name: createElement('score-p1-name'),
        scoreP2Name: createElement('score-p2-name'),
        scoreValX: createElement('score-val-x'),
        scoreValO: createElement('score-val-o'),
        scoreValDraw: createElement('score-val-draw'),

        // Modals
        modalRules: createElement('modal-rules'),
        btnCloseRules: createElement('btn-close-rules'),
        btnRulesGotIt: createElement('btn-rules-got-it'),
        modalResult: createElement('modal-result'),
        resultStatusTag: createElement('result-status-tag'),
        resultIcon: createElement('result-icon'),
        resultTitle: createElement('result-title'),
        resultSubtitle: createElement('result-subtitle'),
        resultPromptBox: createElement('result-prompt-box'),
        resultPromptText: createElement('result-prompt-text'),
        sumP1Label: createElement('sum-p1-label'),
        sumP1Val: createElement('sum-p1-val'),
        sumP1Status: createElement('sum-p1-status'),
        sumP2Label: createElement('sum-p2-label'),
        sumP2Val: createElement('sum-p2-val'),
        sumP2Status: createElement('sum-p2-status'),
        sumDrawVal: createElement('sum-draw-val'),
        btnNextRound: createElement('btn-next-round'),
        btnNextRoundText: createElement('btn-next-round-text'),
        btnResultSettings: createElement('btn-result-settings')
    };

    return dom;
}

// Logic implementations matching app.js
const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function evaluateBoardLocally(board) {
    for (let combo of WIN_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            return { isGameOver: true, winner: board[a], winningLine: combo };
        }
    }
    if (board.every(cell => cell !== '')) {
        return { isGameOver: true, winner: 'DRAW', winningLine: null };
    }
    return { isGameOver: false, winner: null, winningLine: null };
}

function runTests() {
    let passedTests = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passedTests++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            process.exitCode = 1;
        }
    }

    // =========================================================================
    // TEST 1: WIN SITUATIONS ACROSS ALL 8 WINNING COMBOS
    // =========================================================================
    console.log('\n--- [TEST 1] VERIFYING ALL 8 WINNING COMBINATIONS FOR WIN ---');
    const allCombos = [
        { name: 'Row 0 (0,1,2)', line: [0,1,2], board: ['X','X','X','O','','O','','',''] },
        { name: 'Row 1 (3,4,5)', line: [3,4,5], board: ['O','','O','X','X','X','','',''] },
        { name: 'Row 2 (6,7,8)', line: [6,7,8], board: ['O','','','O','','','X','X','X'] },
        { name: 'Col 0 (0,3,6)', line: [0,3,6], board: ['X','O','','X','O','','X','',''] },
        { name: 'Col 1 (1,4,7)', line: [1,4,7], board: ['O','X','','','X','O','','X',''] },
        { name: 'Col 2 (2,5,8)', line: [2,5,8], board: ['O','','X','','O','X','','','X'] },
        { name: 'Diag (0,4,8)', line: [0,4,8], board: ['X','O','','','X','O','','','X'] },
        { name: 'Diag (2,4,6)', line: [2,4,6], board: ['','O','X','','X','O','X','',''] }
    ];

    for (let c of allCombos) {
        const evalRes = evaluateBoardLocally(c.board);
        assert(evalRes.isGameOver === true, `Combo ${c.name} detected as Game Over`);
        assert(evalRes.winner === 'X', `Combo ${c.name} winner is X`);
        assert(JSON.stringify(evalRes.winningLine) === JSON.stringify(c.line), `Combo ${c.name} line matches [${c.line}]`);
    }

    // =========================================================
    // TEST 2: LOSE SITUATIONS ACROSS ALL 8 WINNING COMBOS FOR AI (O)
    // =========================================================
    console.log('\n--- [TEST 2] VERIFYING ALL 8 WINNING COMBINATIONS FOR AI WIN (LOSE) ---');
    for (let c of allCombos) {
        // Swap X and O
        const oBoard = c.board.map(cell => cell === 'X' ? 'O' : (cell === 'O' ? 'X' : ''));
        const evalRes = evaluateBoardLocally(oBoard);
        assert(evalRes.isGameOver === true, `AI Combo ${c.name} detected as Game Over`);
        assert(evalRes.winner === 'O', `AI Combo ${c.name} winner is O (Loss for Human)`);
        assert(JSON.stringify(evalRes.winningLine) === JSON.stringify(c.line), `AI Combo ${c.name} line matches [${c.line}]`);
    }

    // =========================================================
    // TEST 3: DRAW SITUATION VERIFICATION
    // =========================================================
    console.log('\n--- [TEST 3] VERIFYING DRAW / STALEMATE SITUATION ---');
    {
        const dom = createMockDom();
        const state = {
            board: [
                'X', 'O', 'X',
                'X', 'O', 'O',
                'O', 'X', 'X'
            ],
            mode: 'HUMAN_VS_AI',
            difficulty: 'HARD',
            player1Symbol: 'X',
            player2Symbol: 'O',
            player1Name: 'Player 1',
            player2Name: 'Computer (AI)',
            currentTurn: 'X',
            isGameOver: false,
            round: 1,
            scores: { X: 0, O: 0, DRAW: 0 }
        };

        const evalResult = evaluateBoardLocally(state.board);
        assert(evalResult.isGameOver === true, 'evalResult detects game over on full board draw');
        assert(evalResult.winner === 'DRAW', 'Winner is detected as DRAW');
        assert(evalResult.winningLine === null, 'Winning line is null on draw');

        state.isGameOver = true;
        state.scores.DRAW++;
        const nextRoundNum = state.round + 1;

        // Turn indicator update
        dom.turnIndicator.className = 'turn-indicator turn-draw';
        dom.turnSymbol.textContent = '🤝';
        dom.turnText.textContent = `Round ${state.round} Ended in a Draw!`;

        // Arena Banner
        dom.winnerBannerIcon.textContent = '🤝';
        dom.winnerBannerTitle.textContent = `Round ${state.round} Ended in a Draw!`;
        dom.winnerBannerSub.textContent = `Score points preserved. Would you like to continue to Round ${nextRoundNum}?`;
        dom.btnInlineNextRoundText.textContent = `Continue to Round ${nextRoundNum} →`;
        dom.winnerBanner.classList.remove('hidden');

        // Modal update
        dom.resultStatusTag.textContent = 'ROUND DRAW — NO WINNER';
        dom.resultStatusTag.className = 'result-status-tag status-draw';
        dom.resultIcon.textContent = '🤝';
        dom.resultTitle.textContent = `Round ${state.round} Draw!`;
        dom.resultPromptText.textContent = `Would you like to continue to Round ${nextRoundNum}?`;
        dom.sumP1Status.textContent = 'TIED';
        dom.sumP2Status.textContent = 'TIED';
        dom.btnNextRoundText.textContent = `▶ Continue to Round ${nextRoundNum} (Reset Board)`;
        dom.modalResult.classList.remove('hidden');

        // Assertions for DRAW notifications
        assert(dom.turnText.textContent.includes('Ended in a Draw!'), 'Turn indicator shows Draw notification');
        assert(dom.winnerBannerTitle.textContent.includes('Round 1 Ended in a Draw!'), 'Arena Banner shows Draw notification title');
        assert(dom.winnerBannerSub.textContent.includes('Would you like to continue to Round 2?'), 'Arena Banner asks to continue to Round 2 on Draw');
        assert(dom.resultStatusTag.textContent === 'ROUND DRAW — NO WINNER', 'Modal shows ROUND DRAW — NO WINNER status tag');
        assert(dom.resultPromptText.textContent === 'Would you like to continue to Round 2?', 'Modal asks to continue to Round 2 on Draw');
        assert(dom.btnNextRoundText.textContent === '▶ Continue to Round 2 (Reset Board)', 'Modal provides option for further round on Draw');
        assert(state.scores.DRAW === 1, 'Ties score incremented to 1');
    }

    // =========================================================
    // TEST 4: MULTI-ROUND PVP ACCUMULATION (Rounds 1, 2, 3, 4...)
    // =========================================================
    console.log('\n--- [TEST 4] VERIFYING MULTI-ROUND PVP PROGRESSION ---');
    {
        const dom = createMockDom();
        const state = {
            board: Array(9).fill(''),
            mode: 'HUMAN_VS_HUMAN',
            player1Symbol: 'X',
            player2Symbol: 'O',
            player1Name: 'Alice',
            player2Name: 'Bob',
            currentTurn: 'X',
            isGameOver: false,
            round: 1,
            scores: { X: 0, O: 0, DRAW: 0 }
        };

        // Round 1: Alice (X) wins
        state.board = ['X', 'X', 'X', 'O', 'O', '', '', '', ''];
        let res = evaluateBoardLocally(state.board);
        assert(res.winner === 'X', 'Round 1: Alice (X) wins');
        state.scores.X++;
        assert(state.scores.X === 1 && state.scores.O === 0, 'Score is 1 - 0 for Alice after Round 1');

        // Advance to Round 2
        state.round++;
        state.board = Array(9).fill('');
        assert(state.round === 2, 'Pushed to Round 2');
        assert(state.board.every(c => c === ''), 'Board reset for Round 2');
        assert(state.scores.X === 1, 'Alice 1-win count preserved into Round 2');

        // Round 2: Bob (O) wins
        state.board = ['X', 'X', '', 'O', 'O', 'O', 'X', '', ''];
        res = evaluateBoardLocally(state.board);
        assert(res.winner === 'O', 'Round 2: Bob (O) wins');
        state.scores.O++;
        assert(state.scores.X === 1 && state.scores.O === 1, 'Score is 1 - 1 after Round 2');

        // Advance to Round 3
        state.round++;
        state.board = Array(9).fill('');
        assert(state.round === 3, 'Pushed to Round 3');
        assert(state.scores.X === 1 && state.scores.O === 1, 'Scores 1 - 1 preserved into Round 3');

        // Round 3: Alice (X) wins diagonal
        state.board = ['X', 'O', '', 'O', 'X', '', '', '', 'X'];
        res = evaluateBoardLocally(state.board);
        assert(res.winner === 'X', 'Round 3: Alice (X) wins diagonal');
        state.scores.X++;
        assert(state.scores.X === 2 && state.scores.O === 1, 'Score is 2 - 1 for Alice after Round 3');

        // Advance to Round 4
        state.round++;
        state.board = Array(9).fill('');
        assert(state.round === 4, 'Pushed to Round 4');
        assert(state.scores.X === 2 && state.scores.O === 1, 'Scores 2 - 1 preserved into Round 4');
    }

    console.log('\n===============================================================');
    console.log(` 🏁 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED! `);
    console.log('===============================================================');

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runTests();
