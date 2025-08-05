// Battle system for Wrestling RPG

import { rosterManager } from './roster.js';
import { GameUtils } from './utils.js';

export class BattleManager {
    constructor() {
        this.battleData = null;
        this.playerWrestler = null;
        this.opponentWrestler = null;
        this.battleActive = false;
        this.playerTurn = true;
        this.selectedMove = null;
        
        this.initializeBattle();
    }

    initializeBattle() {
        // Load battle data from sessionStorage
        const battleDataJson = sessionStorage.getItem('currentBattle');
        if (!battleDataJson) {
            // No battle data, redirect to main game
            window.location.href = 'index.html';
            return;
        }

        this.battleData = JSON.parse(battleDataJson);
        this.playerWrestler = this.battleData.playerWrestler;
        this.opponentWrestler = this.battleData.opponent;
        
        this.setupBattleUI();
        this.startBattle();
    }

    setupBattleUI() {
        // Setup wrestler sprites and stats
        this.updateWrestlerDisplay('player', this.playerWrestler);
        this.updateWrestlerDisplay('opponent', this.opponentWrestler);
        
        // Setup move buttons
        const moveButtons = document.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.playerTurn && this.battleActive) {
                    this.selectMove(btn.dataset.move);
                }
            });
        });

        // Setup continue button for victory
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.endBattle();
            });
        }
    }

    updateWrestlerDisplay(side, wrestler) {
        const prefix = side === 'player' ? 'player' : 'opponent';
        const nameElement = document.getElementById(`${prefix}Name`);
        const hpFillElement = document.getElementById(`${prefix}HpFill`);
        const hpTextElement = document.getElementById(`${prefix}HpText`);

        if (nameElement) nameElement.textContent = wrestler.name;
        if (hpFillElement) {
            const hpPercentage = (wrestler.hp / wrestler.maxHp) * 100;
            hpFillElement.style.width = `${hpPercentage}%`;
            
            // Change color based on HP percentage
            if (hpPercentage > 60) {
                hpFillElement.style.background = 'linear-gradient(90deg, #4cc9f0 0%, #7209b7 100%)';
            } else if (hpPercentage > 30) {
                hpFillElement.style.background = 'linear-gradient(90deg, #f72585 0%, #b5179e 100%)';
            } else {
                hpFillElement.style.background = 'linear-gradient(90deg, #e63946 0%, #d62828 100%)';
            }
        }
        if (hpTextElement) hpTextElement.textContent = `${wrestler.hp}/${wrestler.maxHp}`;
    }

    startBattle() {
        this.battleActive = true;
        this.playerTurn = true;
        this.addBattleLogEntry(`Battle started! ${this.opponentWrestler.name} challenges you!`);
        this.addBattleLogEntry('Select your move!');
    }

    selectMove(moveType) {
        if (!this.playerTurn || !this.battleActive) return;

        this.selectedMove = moveType;
        this.executePlayerMove();
    }

    executePlayerMove() {
        if (!this.selectedMove) return;

        const move = this.playerWrestler.moves[this.selectedMove];
        const damage = GameUtils.calculateDamage(
            this.playerWrestler.power,
            this.opponentWrestler.speed,
            GameUtils.random(move.damage[0], move.damage[1])
        );

        // Apply damage to opponent
        this.opponentWrestler.hp = Math.max(0, this.opponentWrestler.hp - damage);
        
        // Add battle log entry
        this.addBattleLogEntry(`${this.playerWrestler.name} used ${move.name}!`);
        this.addBattleLogEntry(`Dealt ${damage} damage to ${this.opponentWrestler.name}!`);
        
        // Update display
        this.updateWrestlerDisplay('opponent', this.opponentWrestler);
        
        // Animate opponent damage
        this.animateDamage('opponent');
        
        // Check if opponent is defeated
        if (this.opponentWrestler.hp <= 0) {
            this.endBattleVictory();
            return;
        }

        // Switch to opponent turn
        this.playerTurn = false;
        this.disableMoveButtons();
        
        // Opponent turn after delay
        setTimeout(() => {
            this.executeOpponentMove();
        }, 1500);
    }

    executeOpponentMove() {
        if (!this.battleActive) return;

        // Select random move for opponent
        const moveTypes = Object.keys(this.opponentWrestler.moves);
        const randomMoveType = moveTypes[Math.floor(Math.random() * moveTypes.length)];
        const move = this.opponentWrestler.moves[randomMoveType];

        const damage = GameUtils.calculateDamage(
            this.opponentWrestler.power,
            this.playerWrestler.speed,
            GameUtils.random(move.damage[0], move.damage[1])
        );

        // Apply damage to player
        this.playerWrestler.hp = Math.max(0, this.playerWrestler.hp - damage);
        
        // Add battle log entry
        this.addBattleLogEntry(`${this.opponentWrestler.name} used ${move.name}!`);
        this.addBattleLogEntry(`Dealt ${damage} damage to ${this.playerWrestler.name}!`);
        
        // Update display
        this.updateWrestlerDisplay('player', this.playerWrestler);
        
        // Animate player damage
        this.animateDamage('player');
        
        // Check if player is defeated
        if (this.playerWrestler.hp <= 0) {
            this.endBattleDefeat();
            return;
        }

        // Switch back to player turn
        this.playerTurn = true;
        this.enableMoveButtons();
        this.addBattleLogEntry('Select your move!');
    }

    animateDamage(side) {
        const prefix = side === 'player' ? 'player' : 'opponent';
        const wrestlerElement = document.getElementById(`${prefix}Wrestler`);
        
        if (wrestlerElement) {
            wrestlerElement.classList.add('shake');
            setTimeout(() => {
                wrestlerElement.classList.remove('shake');
            }, 500);
        }
    }

    disableMoveButtons() {
        const moveButtons = document.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }

    enableMoveButtons() {
        const moveButtons = document.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }

    addBattleLogEntry(message) {
        const battleLog = document.getElementById('battleLog');
        if (!battleLog) return;

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        battleLog.appendChild(logEntry);
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    endBattleVictory() {
        this.battleActive = false;
        this.addBattleLogEntry(`🏆 ${this.playerWrestler.name} wins the match! 🏆`);
        
        // Add opponent to roster
        const added = rosterManager.addWrestler(this.opponentWrestler);
        
        // Show victory modal
        const victoryModal = document.getElementById('victoryModal');
        const victoryMessage = document.getElementById('victoryMessage');
        
        if (victoryMessage) {
            victoryMessage.innerHTML = `
                <p>You defeated ${this.opponentWrestler.name}!</p>
                ${added ? '<p>' + this.opponentWrestler.name + ' joined your roster!</p>' : '<p>Roster is full!</p>'}
                <p>Experience gained: ${this.opponentWrestler.level * 50}</p>
            `;
        }
        
        if (victoryModal) {
            victoryModal.classList.remove('hidden');
        }
        
        // Save player wrestler data
        rosterManager.savePlayerWrestler(this.playerWrestler);
        
        // Remove NPC from world
        this.removeNPCFromWorld();
    }

    endBattleDefeat() {
        this.battleActive = false;
        this.addBattleLogEntry(`💀 ${this.playerWrestler.name} was defeated! 💀`);
        
        // Show defeat message
        setTimeout(() => {
            if (confirm('You were defeated! Try again?')) {
                this.endBattle();
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    }

    endBattle() {
        // Clear battle data
        sessionStorage.removeItem('currentBattle');
        
        // Return to main game
        window.location.href = 'index.html';
    }

    removeNPCFromWorld() {
        // This would normally communicate with the main game
        // For now, we'll store the defeated NPC in localStorage
        const defeatedNPCs = GameUtils.loadData('defeatedNPCs', []);
        if (!defeatedNPCs.includes(this.battleData.npcId)) {
            defeatedNPCs.push(this.battleData.npcId);
            GameUtils.saveData('defeatedNPCs', defeatedNPCs);
        }
    }

    // Calculate experience gain
    calculateExperienceGain(opponentLevel) {
        return opponentLevel * 50;
    }

    // Check for level up
    checkLevelUp(wrestler, experienceGained) {
        wrestler.experience += experienceGained;
        const experienceNeeded = wrestler.level * 100;
        
        if (wrestler.experience >= experienceNeeded) {
            wrestler.experience -= experienceNeeded;
            return true;
        }
        return false;
    }
}

// Initialize battle when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.battleManager = new BattleManager();
});