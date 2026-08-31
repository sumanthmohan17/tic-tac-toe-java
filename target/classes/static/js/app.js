/**
 * TIC TAC TOE - JAVASCRIPT FULL-STACK CLIENT ENGINE
 * Handles game state, REST API communication with Java backend,
 * Web Audio sound synthesis, animations, and interactive hint system.
 */

(function () {
    'use strict';

    // =========================================================
    // GAME STATE
    // =========================================================
    const state = {
        board: Array(9).fill(''),
        mode: 'HUMAN_VS_AI', // 'HUMAN_VS_AI' | 'HUMAN_VS_HUMAN'
        difficulty: 'MEDIUM', // 'EASY' | 'MEDIUM' | 'HARD'
        player1Symbol: 'X',
        player2Symbol: 'O',
        player1Name: 'Player 1',
        player2Name: 'Computer (AI)',
        currentTurn: 'X', // 'X' always starts
        isGameOver: false,
        isAiThinking: false,
        activeHint: null,
        round: 1,
        scores: {
            X: 0,
            O: 0,
            DRAW: 0
        },
        soundEnabled: true,
        theme: 'dark' // 'dark' | 'light'
    };

    // Winning line coordinates for 300x300 SVG viewbox
    const SVG_COORDS = {
        '0,1,2': { x1: 20, y1: 50, x2: 280, y2: 50 },
        '3,4,5': { x1: 20, y1: 150, x2: 280, y2: 150 },
        '6,7,8': { x1: 20, y1: 250, x2: 280, y2: 250 },
        '0,3,6': { x1: 50, y1: 20, x2: 50, y2: 280 },
        '1,4,7': { x1: 150, y1: 20, x2: 150, y2: 280 },
        '2,5,8': { x1: 250, y1: 20, x2: 250, y2: 280 },
        '0,4,8': { x1: 30, y1: 30, x2: 270, y2: 270 },
        '2,4,6': { x1: 270, y1: 30, x2: 30, y2: 270 }
    };

    // =========================================================
    // DOM ELEMENTS
    // =========================================================
    const dom = {
        // App header
        btnRules: document.getElementById('btn-rules'),
        btnSound: document.getElementById('btn-sound'),
        iconSoundOn: document.getElementById('icon-sound-on'),
        iconSoundOff: document.getElementById('icon-sound-off'),
        btnTheme: document.getElementById('btn-theme'),
        iconSun: document.getElementById('icon-sun'),
        iconMoon: document.getElementById('icon-moon'),

        // Setup Screen
        setupPanel: document.getElementById('setup-panel'),
        modeButtons: document.querySelectorAll('.mode-selector .segment-btn'),
        aiDifficultyGroup: document.getElementById('ai-difficulty-group'),
        difficultyCards: document.querySelectorAll('.difficulty-card'),
        symbolButtons: document.querySelectorAll('.symbol-btn'),
        p1Label: document.getElementById('p1-label'),
        player1NameInput: document.getElementById('player1-name'),
        p2NameGroup: document.getElementById('p2-name-group'),
        p2Label: document.getElementById('p2-label'),
        player2NameInput: document.getElementById('player2-name'),
        btnStartGame: document.getElementById('btn-start-game'),

        // Game Arena
        gameArena: document.getElementById('game-arena'),
        matchModeBadge: document.getElementById('match-mode-badge'),
        roundIndicator: document.getElementById('round-indicator'),
        btnHint: document.getElementById('btn-hint'),
        btnRestartRound: document.getElementById('btn-restart-round'),
        btnChangeSettings: document.getElementById('btn-change-settings'),

        // Turn & Hint Banner
        turnIndicator: document.getElementById('turn-indicator'),
        turnSymbol: document.getElementById('turn-symbol'),
        turnText: document.getElementById('turn-text'),
        thinkingSpinner: document.getElementById('thinking-spinner'),
        hintBanner: document.getElementById('hint-banner'),
        hintCategoryTitle: document.getElementById('hint-category-title'),
        hintRationaleText: document.getElementById('hint-rationale-text'),
        btnDismissHint: document.getElementById('btn-dismiss-hint'),
        roundToast: document.getElementById('round-toast'),
        roundToastText: document.getElementById('round-toast-text'),

        // Inline Winner Banner
        winnerBanner: document.getElementById('winner-banner'),
        winnerBannerIcon: document.getElementById('winner-banner-icon'),
        winnerBannerTitle: document.getElementById('winner-banner-title'),
        winnerBannerSub: document.getElementById('winner-banner-sub'),
        btnInlineNextRound: document.getElementById('btn-inline-next-round'),
        btnInlineNextRoundText: document.getElementById('btn-inline-next-round-text'),

        // Board
        boardContainer: document.getElementById('board-container'),
        cells: document.querySelectorAll('.board-cell'),
        strikeLine: document.getElementById('strike-line'),

        // Scoreboard
        scoreP1Name: document.getElementById('score-p1-name'),
        scoreP2Name: document.getElementById('score-p2-name'),
        scoreValX: document.getElementById('score-val-x'),
        scoreValO: document.getElementById('score-val-o'),
        scoreValDraw: document.getElementById('score-val-draw'),

        // Modals
        modalRules: document.getElementById('modal-rules'),
        btnCloseRules: document.getElementById('btn-close-rules'),
        btnRulesGotIt: document.getElementById('btn-rules-got-it'),
        modalResult: document.getElementById('modal-result'),
        resultStatusTag: document.getElementById('result-status-tag'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultSubtitle: document.getElementById('result-subtitle'),
        resultPromptBox: document.getElementById('result-prompt-box'),
        resultPromptText: document.getElementById('result-prompt-text'),
        sumP1Label: document.getElementById('sum-p1-label'),
        sumP1Val: document.getElementById('sum-p1-val'),
        sumP1Status: document.getElementById('sum-p1-status'),
        sumP2Label: document.getElementById('sum-p2-label'),
        sumP2Val: document.getElementById('sum-p2-val'),
        sumP2Status: document.getElementById('sum-p2-status'),
        sumDrawVal: document.getElementById('sum-draw-val'),
        btnNextRound: document.getElementById('btn-next-round'),
        btnNextRoundText: document.getElementById('btn-next-round-text'),
        btnResultSettings: document.getElementById('btn-result-settings'),

        // Confetti
        confettiCanvas: document.getElementById('confetti-canvas')
    };

    // =========================================================
    // AUDIO SYNTHESIZER (Web Audio API - Zero External Files)
    // =========================================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    const sound = {
        playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
            if (!state.soundEnabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(gainVal, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {
                // Audio context error fallback
            }
        },

        moveX() {
            this.playTone(523.25, 'triangle', 0.12, 0.2); // C5
        },

        moveO() {
            this.playTone(659.25, 'sine', 0.12, 0.2); // E5
        },

        hint() {
            if (!state.soundEnabled) return;
            const ctx = getAudioContext();
            if (!ctx) return;
            [587.33, 739.99, 880.00].forEach((freq, idx) => {
                setTimeout(() => sound.playTone(freq, 'sine', 0.18, 0.15), idx * 70);
            });
        },

        win() {
            if (!state.soundEnabled) return;
            const ctx = getAudioContext();
            if (!ctx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - High C
            notes.forEach((freq, idx) => {
                setTimeout(() => sound.playTone(freq, 'triangle', 0.28, 0.22), idx * 110);
            });
        },

        loss() {
            if (!state.soundEnabled) return;
            const ctx = getAudioContext();
            if (!ctx) return;
            const notes = [440.00, 415.30, 392.00, 349.23]; // Descending minor tones
            notes.forEach((freq, idx) => {
                setTimeout(() => sound.playTone(freq, 'sawtooth', 0.26, 0.16), idx * 130);
            });
        },

        draw() {
            if (!state.soundEnabled) return;
            [392.00, 329.63].forEach((freq, idx) => {
                setTimeout(() => sound.playTone(freq, 'sawtooth', 0.25, 0.12), idx * 120);
            });
        },

        button() {
            this.playTone(440, 'sine', 0.06, 0.08);
        }
    };

    // =========================================================
    // CONFETTI CELEBRATION ENGINE
    // =========================================================
    const confetti = {
        ctx: null,
        particles: [],
        animId: null,

        init() {
            if (!dom.confettiCanvas) return;
            this.ctx = dom.confettiCanvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            if (!dom.confettiCanvas) return;
            dom.confettiCanvas.width = window.innerWidth;
            dom.confettiCanvas.height = window.innerHeight;
        },

        start() {
            this.resize();
            this.particles = [];
            const colors = ['#00f0ff', '#ff416c', '#ffd200', '#00e676', '#ffffff', '#b388ff'];
            const count = Math.min(120, Math.floor(window.innerWidth / 8));

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 100,
                    y: window.innerHeight * 0.45,
                    vx: (Math.random() - 0.5) * 16,
                    vy: (Math.random() - 1.2) * 14,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 12,
                    opacity: 1
                });
            }

            if (this.animId) cancelAnimationFrame(this.animId);
            this.render();
        },

        render() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
            let active = false;

            for (let p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35; // gravity
                p.vx *= 0.98; // friction
                p.rot += p.rotSpeed;
                p.opacity -= 0.007;

                if (p.opacity > 0 && p.y < window.innerHeight + 50) {
                    active = true;
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rot * Math.PI) / 180);
                    this.ctx.globalAlpha = Math.max(0, p.opacity);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    this.ctx.restore();
                }
            }

            if (active) {
                this.animId = requestAnimationFrame(() => this.render());
            } else {
                this.ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
            }
        },

        stop() {
            if (this.animId) cancelAnimationFrame(this.animId);
            if (this.ctx) {
                this.ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
            }
            this.particles = [];
        }
    };

    // =========================================================
    // INITIALIZATION & EVENT LISTENERS
    // =========================================================
    function init() {
        confetti.init();
        loadStoredPreferences();
        attachEventListeners();
        updateSetupUi();
    }

    function loadStoredPreferences() {
        const savedSound = localStorage.getItem('ttt_sound');
        if (savedSound !== null) {
            state.soundEnabled = savedSound === 'true';
            updateSoundIcon();
        }

        const savedTheme = localStorage.getItem('ttt_theme');
        if (savedTheme) {
            state.theme = savedTheme;
            applyTheme(savedTheme);
        }
    }

    function attachEventListeners() {
        // Theme & Sound toggles
        dom.btnSound.addEventListener('click', toggleSound);
        dom.btnTheme.addEventListener('click', toggleTheme);

        // Rules Modal
        dom.btnRules.addEventListener('click', openRulesModal);
        dom.btnCloseRules.addEventListener('click', closeRulesModal);
        dom.btnRulesGotIt.addEventListener('click', closeRulesModal);
        dom.modalRules.addEventListener('click', (e) => {
            if (e.target === dom.modalRules) closeRulesModal();
        });

        // Mode Selector Buttons
        dom.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sound.button();
                dom.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.mode = btn.dataset.mode;
                updateSetupUi();
            });
        });

        // Difficulty Cards
        dom.difficultyCards.forEach(card => {
            card.addEventListener('click', () => {
                sound.button();
                dom.difficultyCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                state.difficulty = card.dataset.diff;
            });
        });

        // Symbol Buttons
        dom.symbolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sound.button();
                dom.symbolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.player1Symbol = btn.dataset.symbol;
                state.player2Symbol = state.player1Symbol === 'X' ? 'O' : 'X';
                updateSetupUi();
            });
        });

        // Start Game
        dom.btnStartGame.addEventListener('click', startGame);

        // In-game actions
        dom.btnRestartRound.addEventListener('click', () => {
            sound.button();
            restartRound();
        });

        dom.btnChangeSettings.addEventListener('click', () => {
            sound.button();
            showSetupPanel();
        });

        dom.btnHint.addEventListener('click', requestHint);
        dom.btnDismissHint.addEventListener('click', dismissHint);

        // Board Cell clicks
        dom.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const idx = parseInt(cell.dataset.index, 10);
                handleCellClick(idx);
            });
        });

        // Result Modal & Inline Next Round Buttons
        const handleAdvanceNextRound = () => {
            sound.button();
            closeResultModal();
            state.round++;
            restartRound();
            if (state.mode === 'HUMAN_VS_HUMAN') {
                const pXName = state.player1Symbol === 'X' ? state.player1Name : state.player2Name;
                const pOName = state.player1Symbol === 'O' ? state.player1Name : state.player2Name;
                showRoundToast(`⚔️ Round ${state.round} Started! (Board Reset) | ${pXName}: ${state.scores.X} vs ${pOName}: ${state.scores.O}`);
            } else {
                showRoundToast(`⚔️ Round ${state.round} Started! (Board Reset) | Scores: ${state.scores.X} vs ${state.scores.O}`);
            }
        };

        if (dom.btnNextRound) {
            dom.btnNextRound.addEventListener('click', handleAdvanceNextRound);
        }
        if (dom.btnInlineNextRound) {
            dom.btnInlineNextRound.addEventListener('click', handleAdvanceNextRound);
        }

        dom.btnResultSettings.addEventListener('click', () => {
            sound.button();
            closeResultModal();
            showSetupPanel();
        });

        // Keyboard navigation escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeRulesModal();
                closeResultModal();
            }
        });
    }

    // =========================================================
    // THEME & SOUND HELPERS
    // =========================================================
    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem('ttt_sound', state.soundEnabled);
        updateSoundIcon();
        if (state.soundEnabled) sound.button();
    }

    function updateSoundIcon() {
        if (state.soundEnabled) {
            dom.iconSoundOn.classList.remove('hidden');
            dom.iconSoundOff.classList.add('hidden');
        } else {
            dom.iconSoundOn.classList.add('hidden');
            dom.iconSoundOff.classList.remove('hidden');
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('ttt_theme', state.theme);
        applyTheme(state.theme);
        sound.button();
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            dom.iconSun.classList.add('hidden');
            dom.iconMoon.classList.remove('hidden');
        } else {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            dom.iconSun.classList.remove('hidden');
            dom.iconMoon.classList.add('hidden');
        }
    }

    // =========================================================
    // SETUP & SCREEN SWITCHING
    // =========================================================
    function updateSetupUi() {
        if (state.mode === 'HUMAN_VS_AI') {
            dom.aiDifficultyGroup.classList.remove('hidden');
            dom.p1Label.textContent = 'Your Name';
            dom.p2Label.textContent = 'Opponent Name';
            dom.player2NameInput.value = 'Computer (AI)';
            dom.player2NameInput.disabled = true;
        } else {
            dom.aiDifficultyGroup.classList.add('hidden');
            dom.p1Label.textContent = 'Player 1 (You)';
            dom.p2Label.textContent = 'Player 2 (Friend)';
            if (dom.player2NameInput.value === 'Computer (AI)') {
                dom.player2NameInput.value = 'Player 2';
            }
            dom.player2NameInput.disabled = false;
        }
    }

    function startGame() {
        sound.button();

        // Get names
        state.player1Name = dom.player1NameInput.value.trim() || 'Player 1';
        state.player2Name = dom.player2NameInput.value.trim() || (state.mode === 'HUMAN_VS_AI' ? 'Computer (AI)' : 'Player 2');

        // Reset scores for new match
        state.scores = { X: 0, O: 0, DRAW: 0 };
        state.round = 1;

        // Switch screen
        dom.setupPanel.classList.add('hidden');
        dom.gameArena.classList.remove('hidden');

        // Update match labels
        updateMatchLabels();
        restartRound();
    }

    function showSetupPanel() {
        dismissHint();
        confetti.stop();
        dom.gameArena.classList.add('hidden');
        dom.setupPanel.classList.remove('hidden');
    }

    function updateMatchLabels() {
        if (state.mode === 'HUMAN_VS_AI') {
            const diffCapitalized = state.difficulty.charAt(0) + state.difficulty.slice(1).toLowerCase();
            dom.matchModeBadge.textContent = `vs AI (${diffCapitalized})`;
        } else {
            dom.matchModeBadge.textContent = '2 Players (PvP)';
        }

        // Setup scoreboard header names according to symbol assignment
        const pXName = state.player1Symbol === 'X' ? state.player1Name : state.player2Name;
        const pOName = state.player1Symbol === 'O' ? state.player1Name : state.player2Name;

        dom.scoreP1Name.textContent = pXName;
        dom.scoreP2Name.textContent = pOName;

        updateScoreboardDisplay();
    }

    function updateScoreboardDisplay() {
        dom.scoreValX.textContent = state.scores.X;
        dom.scoreValO.textContent = state.scores.O;
        dom.scoreValDraw.textContent = state.scores.DRAW;
        dom.roundIndicator.textContent = `Round ${state.round}`;
    }

    // =========================================================
    // GAMEPLAY & BOARD CONTROLS
    // =========================================================
    function restartRound() {
        state.board = Array(9).fill('');
        state.currentTurn = 'X'; // X always opens
        state.isGameOver = false;
        state.isAiThinking = false;
        dismissHint();
        confetti.stop();

        // Hide inline winner banner
        if (dom.winnerBanner) {
            dom.winnerBanner.classList.add('hidden');
        }

        // Clear board cells in DOM
        dom.cells.forEach(cell => {
            cell.innerHTML = '';
            cell.className = 'board-cell';
        });

        // Hide winning strike line
        if (dom.strikeLine) {
            dom.strikeLine.classList.add('hidden');
            dom.strikeLine.classList.remove('strike-animated', 'line-x', 'line-o');
        }

        updateTurnIndicator();
        updateHintButtonState();

        // If AI is Player X, it moves first!
        if (isAiTurn()) {
            triggerAiMove();
        }
    }

    function isAiTurn() {
        if (state.mode !== 'HUMAN_VS_AI') return false;
        const aiSymbol = state.player1Symbol === 'X' ? 'O' : 'X';
        return state.currentTurn === aiSymbol;
    }

    function updateTurnIndicator() {
        if (!dom.turnSymbol || !dom.turnIndicator || !dom.turnText) return;
        
        dom.turnSymbol.textContent = state.currentTurn;
        dom.turnIndicator.className = `turn-indicator turn-${state.currentTurn.toLowerCase()}`;

        const activePlayerName = state.player1Symbol === state.currentTurn ? state.player1Name : state.player2Name;

        if (state.isAiThinking) {
            dom.turnText.textContent = `${activePlayerName} is thinking...`;
            if (dom.thinkingSpinner) dom.thinkingSpinner.classList.remove('hidden');
        } else {
            dom.turnText.textContent = `${activePlayerName}'s Turn`;
            if (dom.thinkingSpinner) dom.thinkingSpinner.classList.add('hidden');
        }
    }

    function updateHintButtonState() {
        if (dom.btnHint) {
            dom.btnHint.disabled = state.isGameOver || state.isAiThinking || isAiTurn();
        }
    }

    function handleCellClick(index) {
        if (state.isGameOver || state.isAiThinking) return;
        if (state.board[index] !== '') return; // Cell occupied
        if (isAiTurn()) return; // Wait for AI

        makeMove(index, state.currentTurn);
    }

    function makeMove(index, symbol) {
        if (index < 0 || index >= 9 || state.board[index] !== '') return;

        // Dismiss any active hint
        dismissHint();

        // Update board model
        state.board[index] = symbol;

        // Render symbol on cell
        renderCellMark(index, symbol);

        // Play move sound
        if (symbol === 'X') sound.moveX();
        else sound.moveO();

        // 1. Immediate synchronous local win evaluation (zero latency)
        const localResult = evaluateBoardLocally(state.board);
        if (localResult && localResult.isGameOver) {
            handleGameOver(localResult);
            return;
        }

        // Switch turn
        state.currentTurn = state.currentTurn === 'X' ? 'O' : 'X';
        updateTurnIndicator();
        updateHintButtonState();

        if (isAiTurn()) {
            triggerAiMove();
        }
    }

    function renderCellMark(index, symbol) {
        const cell = dom.cells[index];
        if (!cell) return;

        cell.classList.add('occupied');
        if (symbol === 'X') {
            cell.innerHTML = `
                <div class="cell-mark cell-mark-x">
                    <svg viewBox="0 0 64 64" width="100%" height="100%">
                        <line x1="16" y1="16" x2="48" y2="48" stroke-width="9" stroke-linecap="round"/>
                        <line x1="48" y1="16" x2="16" y2="48" stroke-width="9" stroke-linecap="round"/>
                    </svg>
                </div>
            `;
        } else {
            cell.innerHTML = `
                <div class="cell-mark cell-mark-o">
                    <svg viewBox="0 0 64 64" width="100%" height="100%">
                        <circle cx="32" cy="32" r="18" stroke-width="9" fill="none"/>
                    </svg>
                </div>
            `;
        }
    }

    function handleGameOver(result) {
        state.isGameOver = true;
        state.isAiThinking = false;
        updateHintButtonState();

        const winner = result.winner;
        const nextRoundNum = state.round + 1;

        if (winner === 'DRAW') {
            state.scores.DRAW++;
            sound.draw();

            // Transform turn indicator into draw notification
            if (dom.turnIndicator && dom.turnSymbol && dom.turnText) {
                dom.turnIndicator.className = 'turn-indicator turn-draw';
                dom.turnSymbol.textContent = '🤝';
                dom.turnText.textContent = `Round ${state.round} Ended in a Draw!`;
                if (dom.thinkingSpinner) dom.thinkingSpinner.classList.add('hidden');
            }

            // Show inline banner immediately
            if (dom.winnerBanner) {
                if (dom.winnerBannerIcon) dom.winnerBannerIcon.textContent = '🤝';
                if (dom.winnerBannerTitle) dom.winnerBannerTitle.textContent = `Round ${state.round} Ended in a Draw!`;
                if (dom.winnerBannerSub) dom.winnerBannerSub.textContent = `Score points preserved. Would you like to continue to Round ${nextRoundNum}?`;
                if (dom.btnInlineNextRoundText) dom.btnInlineNextRoundText.textContent = `Continue to Round ${nextRoundNum} →`;
                dom.winnerBanner.className = 'winner-banner';
                dom.winnerBanner.classList.remove('hidden');
            }
        } else {
            // Winning line
            state.scores[winner]++;

            // Draw animated strike line
            if (result.winningLine) {
                drawWinningLine(result.winningLine, winner);
                highlightWinningCells(result.winningLine, winner);
            }

            const isPlayer1Win = (winner === state.player1Symbol);
            const winnerName = isPlayer1Win ? state.player1Name : state.player2Name;

            if (state.mode === 'HUMAN_VS_AI') {
                if (isPlayer1Win) {
                    sound.win();
                    confetti.start();
                    if (dom.turnIndicator && dom.turnSymbol && dom.turnText) {
                        dom.turnIndicator.className = 'turn-indicator turn-win';
                        dom.turnSymbol.textContent = '🏆';
                        dom.turnText.textContent = `VICTORY! You Won Round ${state.round}!`;
                        if (dom.thinkingSpinner) dom.thinkingSpinner.classList.add('hidden');
                    }
                } else {
                    sound.loss();
                    if (dom.turnIndicator && dom.turnSymbol && dom.turnText) {
                        dom.turnIndicator.className = 'turn-indicator turn-lost';
                        dom.turnSymbol.textContent = '🤖';
                        dom.turnText.textContent = `DEFEAT! Computer Won Round ${state.round}!`;
                        if (dom.thinkingSpinner) dom.thinkingSpinner.classList.add('hidden');
                    }
                }
            } else {
                sound.win();
                confetti.start();
                if (dom.turnIndicator && dom.turnSymbol && dom.turnText) {
                    dom.turnIndicator.className = 'turn-indicator turn-win';
                    dom.turnSymbol.textContent = '🏆';
                    dom.turnText.textContent = `VICTORY! ${winnerName} Won Round ${state.round}!`;
                    if (dom.thinkingSpinner) dom.thinkingSpinner.classList.add('hidden');
                }
            }

            // Show inline banner immediately
            if (dom.winnerBanner) {
                if (dom.winnerBannerIcon) dom.winnerBannerIcon.textContent = isPlayer1Win ? '🏆' : '🤖';
                if (dom.winnerBannerTitle) {
                    dom.winnerBannerTitle.textContent = isPlayer1Win 
                        ? `🎉 VICTORY! You Won Round ${state.round}!` 
                        : (state.mode === 'HUMAN_VS_AI' ? `❌ DEFEAT! Computer Won Round ${state.round}!` : `🎉 ${winnerName} Won Round ${state.round}!`);
                }
                if (dom.winnerBannerSub) dom.winnerBannerSub.textContent = `Would you like to continue to Round ${nextRoundNum}?`;
                if (dom.btnInlineNextRoundText) dom.btnInlineNextRoundText.textContent = `Continue to Round ${nextRoundNum} →`;
                dom.winnerBanner.className = isPlayer1Win ? 'winner-banner' : 'winner-banner lost';
                dom.winnerBanner.classList.remove('hidden');
            }
        }

        updateScoreboardDisplay();

        // Pop up result celebration modal
        setTimeout(() => {
            showResultModal(winner, result.winningLine);
        }, 350);
    }

    function drawWinningLine(lineIndices, winner) {
        const key = lineIndices.join(',');
        const coords = SVG_COORDS[key];
        if (!coords || !dom.strikeLine) return;

        dom.strikeLine.setAttribute('x1', coords.x1);
        dom.strikeLine.setAttribute('y1', coords.y1);
        dom.strikeLine.setAttribute('x2', coords.x2);
        dom.strikeLine.setAttribute('y2', coords.y2);

        dom.strikeLine.classList.remove('hidden', 'line-x', 'line-o');
        dom.strikeLine.classList.add('strike-animated', `line-${winner.toLowerCase()}`);
    }

    function highlightWinningCells(lineIndices, winner) {
        lineIndices.forEach(idx => {
            const cell = dom.cells[idx];
            if (cell) {
                cell.classList.add(`cell-winner-${winner.toLowerCase()}`);
            }
        });
    }

    // =========================================================
    // AI MOVE TRIGGER
    // =========================================================
    async function triggerAiMove() {
        state.isAiThinking = true;
        updateTurnIndicator();
        updateHintButtonState();

        const aiSymbol = state.player1Symbol === 'X' ? 'O' : 'X';
        const minThinkingTime = Math.random() * 250 + 250; // realistic humanized delay 250-500ms

        const startTime = Date.now();
        let move = -1;

        try {
            const response = await fetch('/api/ai-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board: state.board,
                    aiSymbol: aiSymbol,
                    difficulty: state.difficulty
                })
            });

            if (response.ok) {
                const data = await response.json();
                move = data.move;
            }
        } catch (e) {
            // Local AI fallback
        }

        if (move === -1 || move === undefined) {
            move = getLocalAiMove(state.board, aiSymbol, state.difficulty);
        }

        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minThinkingTime - elapsed);

        setTimeout(() => {
            state.isAiThinking = false;
            if (!state.isGameOver && move !== -1) {
                makeMove(move, aiSymbol);
            }
        }, remainingDelay);
    }

    // =========================================================
    // HINT SYSTEM
    // =========================================================
    async function requestHint() {
        if (state.isGameOver || state.isAiThinking || isAiTurn()) return;

        sound.hint();
        const playerSymbol = state.currentTurn;
        let hintData = null;

        try {
            const res = await fetch('/api/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board: state.board,
                    playerSymbol: playerSymbol
                })
            });

            if (res.ok) {
                hintData = await res.json();
            }
        } catch (e) {
            // Local fallback
        }

        if (!hintData) {
            hintData = getLocalHint(state.board, playerSymbol);
        }

        if (hintData && hintData.move !== -1) {
            applyHint(hintData);
        }
    }

    function applyHint(hintData) {
        dismissHint(); // clear previous

        state.activeHint = hintData;

        // Highlight recommended board cell
        const cell = dom.cells[hintData.move];
        if (cell) {
            cell.classList.add('cell-hinted');
        }

        // Show rationale banner
        const titles = {
            'WIN': 'Winning Move!',
            'BLOCK': 'Critical Defense!',
            'CENTER': 'Center Control!',
            'CORNER': 'Tactical Corner!',
            'STRATEGIC': 'Smart Strategic Move!'
        };

        if (dom.hintCategoryTitle) dom.hintCategoryTitle.textContent = titles[hintData.category] || 'Recommended Move:';
        if (dom.hintRationaleText) dom.hintRationaleText.textContent = hintData.rationale;
        if (dom.hintBanner) dom.hintBanner.classList.remove('hidden');
    }

    function dismissHint() {
        state.activeHint = null;
        dom.cells.forEach(cell => cell.classList.remove('cell-hinted'));
        if (dom.hintBanner) dom.hintBanner.classList.add('hidden');
    }

    let toastTimer = null;
    function showRoundToast(text, icon = '⚔️') {
        if (!dom.roundToast) return;
        if (toastTimer) clearTimeout(toastTimer);

        const toastIcon = document.getElementById('round-toast-icon');
        if (toastIcon) toastIcon.textContent = icon;
        if (dom.roundToastText) dom.roundToastText.textContent = text;

        dom.roundToast.classList.remove('hidden');
        toastTimer = setTimeout(() => {
            if (dom.roundToast) dom.roundToast.classList.add('hidden');
        }, 3000);
    }

    // =========================================================
    // MODALS HANDLING
    // =========================================================
    function openRulesModal() {
        sound.button();
        if (dom.modalRules) dom.modalRules.classList.remove('hidden');
    }

    function closeRulesModal() {
        sound.button();
        if (dom.modalRules) dom.modalRules.classList.add('hidden');
    }

    function showResultModal(winner, winningLine) {
        const pXName = state.player1Symbol === 'X' ? state.player1Name : state.player2Name;
        const pOName = state.player1Symbol === 'O' ? state.player1Name : state.player2Name;

        if (dom.sumP1Label) dom.sumP1Label.textContent = `${pXName} (X)`;
        if (dom.sumP1Val) dom.sumP1Val.textContent = state.scores.X;
        if (dom.sumP2Label) dom.sumP2Label.textContent = `${pOName} (O)`;
        if (dom.sumP2Val) dom.sumP2Val.textContent = state.scores.O;
        if (dom.sumDrawVal) dom.sumDrawVal.textContent = state.scores.DRAW;

        const nextRoundNum = state.round + 1;

        if (dom.resultPromptText) {
            dom.resultPromptText.textContent = `Would you like to continue to Round ${nextRoundNum}?`;
        }

        if (winner === 'DRAW') {
            if (dom.resultStatusTag) {
                dom.resultStatusTag.textContent = 'ROUND DRAW — NO WINNER';
                dom.resultStatusTag.className = 'result-status-tag status-draw';
            }
            if (dom.resultIcon) dom.resultIcon.textContent = '🤝';
            if (dom.resultTitle) dom.resultTitle.textContent = `Round ${state.round} Draw!`;
            if (dom.resultSubtitle) dom.resultSubtitle.textContent = `Both players held equal ground. Score remains tied!`;
            
            if (dom.sumP1Status) { dom.sumP1Status.textContent = 'TIED'; dom.sumP1Status.className = 'pill-status'; }
            if (dom.sumP2Status) { dom.sumP2Status.textContent = 'TIED'; dom.sumP2Status.className = 'pill-status'; }

            if (dom.btnNextRoundText) dom.btnNextRoundText.textContent = `▶ Continue to Round ${nextRoundNum} (Reset Board)`;
        } else {
            const isHumanP1 = (winner === state.player1Symbol);
            const winnerName = isHumanP1 ? state.player1Name : state.player2Name;
            const loserName = isHumanP1 ? state.player2Name : state.player1Name;
            const winnerScore = state.scores[winner];

            if (state.mode === 'HUMAN_VS_AI') {
                if (isHumanP1) {
                    if (dom.resultStatusTag) {
                        dom.resultStatusTag.textContent = 'VICTORY — YOU WON!';
                        dom.resultStatusTag.className = 'result-status-tag status-won';
                    }
                    if (dom.resultIcon) dom.resultIcon.textContent = '🏆';
                    if (dom.resultTitle) dom.resultTitle.textContent = `You Won Round ${state.round}!`;
                    if (dom.resultSubtitle) dom.resultSubtitle.textContent = `Masterful victory over AI (${state.difficulty} mode)! Total Wins: ${winnerScore}.`;
                    
                    if (dom.sumP1Status) { dom.sumP1Status.textContent = 'WON'; dom.sumP1Status.className = 'pill-status win'; }
                    if (dom.sumP2Status) { dom.sumP2Status.textContent = 'LOST'; dom.sumP2Status.className = 'pill-status loss'; }
                } else {
                    if (dom.resultStatusTag) {
                        dom.resultStatusTag.textContent = 'DEFEAT — YOU LOST!';
                        dom.resultStatusTag.className = 'result-status-tag status-lost';
                    }
                    if (dom.resultIcon) dom.resultIcon.textContent = '🤖';
                    if (dom.resultTitle) dom.resultTitle.textContent = `Computer Won Round ${state.round}!`;
                    if (dom.resultSubtitle) dom.resultSubtitle.textContent = `AI seized the victory. Reset the board and try Round ${nextRoundNum}!`;
                    
                    if (dom.sumP1Status) { dom.sumP1Status.textContent = 'LOST'; dom.sumP1Status.className = 'pill-status loss'; }
                    if (dom.sumP2Status) { dom.sumP2Status.textContent = 'WON'; dom.sumP2Status.className = 'pill-status win'; }
                }
                if (dom.btnNextRoundText) dom.btnNextRoundText.textContent = `▶ Continue to Round ${nextRoundNum} (Reset Board)`;
            } else {
                // PvP Mode
                if (dom.resultStatusTag) {
                    dom.resultStatusTag.textContent = `${winnerName} WON! (${loserName} LOST)`;
                    dom.resultStatusTag.className = 'result-status-tag status-won';
                }
                if (dom.resultIcon) dom.resultIcon.textContent = '🏆';
                if (dom.resultTitle) dom.resultTitle.textContent = `${winnerName} Wins Round ${state.round}!`;
                if (dom.resultSubtitle) dom.resultSubtitle.textContent = `${winnerName}'s total score increases to ${winnerScore}! Continue to Round ${nextRoundNum} to keep playing.`;

                const isP1Winner = (winner === 'X' ? state.player1Symbol === 'X' : state.player1Symbol === 'O');
                if (dom.sumP1Status) { dom.sumP1Status.textContent = isP1Winner ? 'WON' : 'LOST'; dom.sumP1Status.className = isP1Winner ? 'pill-status win' : 'pill-status loss'; }
                if (dom.sumP2Status) { dom.sumP2Status.textContent = !isP1Winner ? 'WON' : 'LOST'; dom.sumP2Status.className = !isP1Winner ? 'pill-status win' : 'pill-status loss'; }

                if (dom.btnNextRoundText) dom.btnNextRoundText.textContent = `▶ Continue to Round ${nextRoundNum} (Reset Board)`;
            }
        }

        if (dom.modalResult) dom.modalResult.classList.remove('hidden');
    }

    function closeResultModal() {
        dom.modalResult.classList.add('hidden');
    }

    // =========================================================
    // CLIENT FALLBACK ENGINE (Guarantees 100% Offline / Direct Operation)
    // =========================================================
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

    function getLocalAiMove(board, aiSymbol, difficulty) {
        const available = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (available.length === 0) return -1;
        if (available.length === 1) return available[0];

        const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

        if (difficulty === 'EASY') {
            return available[Math.floor(Math.random() * available.length)];
        }

        // Check immediate win
        for (let move of available) {
            const test = [...board];
            test[move] = aiSymbol;
            if (evaluateBoardLocally(test).winner === aiSymbol) return move;
        }

        // Check immediate block
        for (let move of available) {
            const test = [...board];
            test[move] = humanSymbol;
            if (evaluateBoardLocally(test).winner === humanSymbol) return move;
        }

        if (difficulty === 'MEDIUM') {
            if (board[4] === '' && Math.random() < 0.7) return 4;
            const corners = [0, 2, 6, 8].filter(c => board[c] === '');
            if (corners.length > 0 && Math.random() < 0.5) {
                return corners[Math.floor(Math.random() * corners.length)];
            }
            return available[Math.floor(Math.random() * available.length)];
        }

        // HARD: Minimax
        let bestScore = -Infinity;
        let bestMove = available[0];

        for (let move of available) {
            const test = [...board];
            test[move] = aiSymbol;
            const score = localMinimax(test, 0, false, aiSymbol, humanSymbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    function localMinimax(board, depth, isMaximizing, aiSymbol, humanSymbol) {
        const res = evaluateBoardLocally(board);
        if (res.isGameOver) {
            if (res.winner === aiSymbol) return 10 - depth;
            if (res.winner === humanSymbol) return depth - 10;
            return 0;
        }

        const available = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of available) {
                const test = [...board];
                test[move] = aiSymbol;
                const ev = localMinimax(test, depth + 1, false, aiSymbol, humanSymbol);
                maxEval = Math.max(maxEval, ev);
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of available) {
                const test = [...board];
                test[move] = humanSymbol;
                const ev = localMinimax(test, depth + 1, true, aiSymbol, humanSymbol);
                minEval = Math.min(minEval, ev);
            }
            return minEval;
        }
    }

    function getLocalHint(board, playerSymbol) {
        const available = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (available.length === 0) return { move: -1, rationale: 'Board is full', category: 'NONE' };

        const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';

        // 1. Immediate Win
        for (let move of available) {
            const test = [...board];
            test[move] = playerSymbol;
            if (evaluateBoardLocally(test).winner === playerSymbol) {
                return { move, rationale: 'Winning Move! Play here to complete 3 in a row now.', category: 'WIN' };
            }
        }

        // 2. Immediate Block
        for (let move of available) {
            const test = [...board];
            test[move] = opponentSymbol;
            if (evaluateBoardLocally(test).winner === opponentSymbol) {
                return { move, rationale: 'Critical Block! Prevent your opponent from completing 3 in a row.', category: 'BLOCK' };
            }
        }

        // 3. Center
        if (board[4] === '') {
            return { move: 4, rationale: 'Center Control! Dominating the center gives maximum winning vectors.', category: 'CENTER' };
        }

        // 4. Strategic Corner / Minimax
        let bestScore = -Infinity;
        let bestMove = available[0];

        for (let move of available) {
            const test = [...board];
            test[move] = playerSymbol;
            const score = localMinimax(test, 0, false, playerSymbol, opponentSymbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        const isCorner = [0, 2, 6, 8].includes(bestMove);
        return {
            move: bestMove,
            rationale: isCorner ? 'Corner Advantage! Secures a powerful vantage point for tactical forks.' : 'Optimal Strategic Move to maximize your board control.',
            category: isCorner ? 'CORNER' : 'STRATEGIC'
        };
    }

    // Run on page ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
