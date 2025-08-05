// Tilemap and world management for Wrestling RPG

import { rosterManager } from './roster.js';
import { GameUtils } from './utils.js';

export class TilemapManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.world = document.getElementById('world');
        this.player = document.getElementById('player');
        
        // Game settings
        this.tileSize = 32;
        this.worldWidth = 25; // tiles
        this.worldHeight = 18; // tiles
        
        // Player state
        this.playerPos = { x: 12, y: 9 }; // Center of world
        this.isMoving = false;
        
        // NPCs
        this.npcs = [];
        this.npcElements = [];
        
        // Game state
        this.gameStarted = false;
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupWorld();
        this.createNPCs();
        this.setupEventListeners();
        this.updatePlayerPosition();
        rosterManager.initializeRosterUI();
        this.gameStarted = true;
        
        GameUtils.showNotification('Welcome to Wrestling RPG! Find wrestlers to battle!', 4000);
    }

    setupWorld() {
        // Set world dimensions
        this.world.style.width = `${this.worldWidth * this.tileSize}px`;
        this.world.style.height = `${this.worldHeight * this.tileSize}px`;
        
        // Add some decorative elements to the world
        this.addWorldDecorations();
    }

    addWorldDecorations() {
        // Add wrestling ring in the center
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            left: ${this.worldWidth * this.tileSize / 2 - 64}px;
            top: ${this.worldHeight * this.tileSize / 2 - 64}px;
            width: 128px;
            height: 128px;
            border: 3px solid #e94560;
            border-radius: 8px;
            background: rgba(233, 69, 96, 0.1);
        `;
        this.world.appendChild(ring);

        // Add ropes
        const ropes = ['top', 'right', 'bottom', 'left'];
        ropes.forEach(side => {
            const rope = document.createElement('div');
            rope.style.cssText = `
                position: absolute;
                ${side}: 0;
                ${side === 'top' || side === 'bottom' ? 'left: 10px; right: 10px; height: 3px;' : 'top: 10px; bottom: 10px; width: 3px;'}
                background: #4cc9f0;
            `;
            ring.appendChild(rope);
        });
    }

    createNPCs() {
        // Create initial NPCs with real wrestler names
        const npcPositions = [
            { x: 5, y: 5, name: "Hulk Hogan" },
            { x: 18, y: 8, name: "Stone Cold Steve Austin" },
            { x: 10, y: 15, name: "The Rock" },
            { x: 20, y: 3, name: "John Cena" }
        ];

        npcPositions.forEach((pos, index) => {
            this.createNPC(pos.x, pos.y, pos.name, index);
        });
    }

    createNPC(x, y, name, id) {
        const npc = {
            id: id,
            x: x,
            y: y,
            name: name,
            element: null,
            wrestler: rosterManager.generateOpponent()
        };

        const npcElement = document.createElement('div');
        npcElement.className = 'npc';
        npcElement.style.left = `${x * this.tileSize}px`;
        npcElement.style.top = `${y * this.tileSize}px`;
        npcElement.title = name;
        
        // Add click event for battle
        npcElement.addEventListener('click', () => {
            this.initiateBattle(npc);
        });

        npc.element = npcElement;
        this.world.appendChild(npcElement);
        this.npcs.push(npc);
        this.npcElements.push(npcElement);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isMoving) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    rosterManager.displayRoster();
                    break;
            }
        });
    }

    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        // Check boundaries
        if (newX < 0 || newX >= this.worldWidth || newY < 0 || newY >= this.worldHeight) {
            return;
        }

        // Check for NPC collision
        const npcAtPosition = this.npcs.find(npc => npc.x === newX && npc.y === newY);
        if (npcAtPosition) {
            this.initiateBattle(npcAtPosition);
            return;
        }

        // Move player
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this.updatePlayerPosition();
        this.checkNearbyNPCs();
    }

    updatePlayerPosition() {
        this.player.style.left = `${this.playerPos.x * this.tileSize}px`;
        this.player.style.top = `${this.playerPos.y * this.tileSize}px`;
    }

    checkNearbyNPCs() {
        // Check if player is adjacent to any NPC
        this.npcs.forEach(npc => {
            const distance = Math.abs(npc.x - this.playerPos.x) + Math.abs(npc.y - this.playerPos.y);
            if (distance === 1) {
                // Highlight nearby NPC
                npc.element.style.boxShadow = '0 0 15px rgba(233, 69, 96, 0.8)';
                npc.element.style.transform = 'scale(1.1)';
            } else {
                // Remove highlight
                npc.element.style.boxShadow = '';
                npc.element.style.transform = '';
            }
        });
    }

    initiateBattle(npc) {
        if (this.isMoving) return;
        
        this.isMoving = true;
        
        // Show battle transition
        const transition = document.getElementById('battleTransition');
        transition.classList.remove('hidden');
        
        // Store battle data in sessionStorage
        const battleData = {
            opponent: npc.wrestler,
            playerWrestler: rosterManager.getActiveWrestler(),
            npcId: npc.id
        };
        sessionStorage.setItem('currentBattle', JSON.stringify(battleData));
        
        // Navigate to battle screen after transition
        setTimeout(() => {
            window.location.href = 'battle.html';
        }, 1500);
    }

    // Add new NPC to the world
    addNPC(x, y, name) {
        const id = this.npcs.length;
        this.createNPC(x, y, name, id);
    }

    // Remove NPC from world
    removeNPC(npcId) {
        const index = this.npcs.findIndex(npc => npc.id === npcId);
        if (index !== -1) {
            const npc = this.npcs[index];
            this.world.removeChild(npc.element);
            this.npcs.splice(index, 1);
            this.npcElements.splice(index, 1);
        }
    }

    // Get player position
    getPlayerPosition() {
        return { ...this.playerPos };
    }

    // Set player position
    setPlayerPosition(x, y) {
        this.playerPos.x = x;
        this.playerPos.y = y;
        this.updatePlayerPosition();
    }

    // Get all NPCs
    getNPCs() {
        return [...this.npcs];
    }

    // Find NPC at position
    getNPCAtPosition(x, y) {
        return this.npcs.find(npc => npc.x === x && npc.y === y);
    }

    // Check if position is walkable
    isWalkable(x, y) {
        if (x < 0 || x >= this.worldWidth || y < 0 || y >= this.worldHeight) {
            return false;
        }
        
        // Check if there's an NPC at this position
        return !this.npcs.some(npc => npc.x === x && npc.y === y);
    }

    // Get world dimensions
    getWorldDimensions() {
        return {
            width: this.worldWidth,
            height: this.worldHeight,
            tileSize: this.tileSize
        };
    }

    // Reset game state
    reset() {
        this.playerPos = { x: 12, y: 9 };
        this.updatePlayerPosition();
        this.isMoving = false;
        
        // Clear NPCs
        this.npcs.forEach(npc => {
            this.world.removeChild(npc.element);
        });
        this.npcs = [];
        this.npcElements = [];
        
        // Recreate NPCs
        this.createNPCs();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tilemapManager = new TilemapManager();
});