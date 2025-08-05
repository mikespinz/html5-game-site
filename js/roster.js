// Roster management system for Wrestling RPG

import { GameUtils } from './utils.js';

export class RosterManager {
    constructor() {
        this.maxRosterSize = 6;
        this.roster = this.loadRoster();
        this.playerWrestler = this.loadPlayerWrestler();
    }

    // Load roster from localStorage
    loadRoster() {
        return GameUtils.loadData('wrestlingRoster', []);
    }

    // Load player wrestler from localStorage
    loadPlayerWrestler() {
        const player = GameUtils.loadData('playerWrestler');
        if (!player) {
            // Create default player wrestler
            const defaultPlayer = GameUtils.createWrestlerTemplate("Your Custom Wrestler", 5);
            defaultPlayer.hp = 150;
            defaultPlayer.maxHp = 150;
            defaultPlayer.power = 25;
            defaultPlayer.speed = 20;
            defaultPlayer.charisma = 18;
            this.savePlayerWrestler(defaultPlayer);
            return defaultPlayer;
        }
        return player;
    }

    // Save roster to localStorage
    saveRoster() {
        GameUtils.saveData('wrestlingRoster', this.roster);
    }

    // Save player wrestler to localStorage
    savePlayerWrestler(wrestler) {
        this.playerWrestler = wrestler;
        GameUtils.saveData('playerWrestler', wrestler);
    }

    // Add wrestler to roster
    addWrestler(wrestler) {
        if (this.roster.length >= this.maxRosterSize) {
            GameUtils.showNotification('Roster is full! Max 6 wrestlers allowed.');
            return false;
        }

        // Check if wrestler already exists
        const exists = this.roster.find(w => w.name === wrestler.name);
        if (exists) {
            GameUtils.showNotification(`${wrestler.name} is already in your roster!`);
            return false;
        }

        this.roster.push(wrestler);
        this.saveRoster();
        GameUtils.showNotification(`${wrestler.name} joined your roster!`);
        return true;
    }

    // Remove wrestler from roster
    removeWrestler(wrestlerId) {
        const index = this.roster.findIndex(w => w.id === wrestlerId);
        if (index !== -1) {
            const removed = this.roster.splice(index, 1)[0];
            this.saveRoster();
            GameUtils.showNotification(`${removed.name} left your roster.`);
            return true;
        }
        return false;
    }

    // Get wrestler by ID
    getWrestlerById(wrestlerId) {
        return this.roster.find(w => w.id === wrestlerId);
    }

    // Get active wrestler for battle
    getActiveWrestler() {
        return this.playerWrestler;
    }

    // Update wrestler stats
    updateWrestler(wrestlerId, updates) {
        const wrestler = this.getWrestlerById(wrestlerId);
        if (wrestler) {
            Object.assign(wrestler, updates);
            this.saveRoster();
            return true;
        }
        return false;
    }

    // Get roster count
    getRosterCount() {
        return this.roster.length;
    }

    // Display roster in modal
    displayRoster() {
        const modal = document.getElementById('rosterModal');
        const rosterList = document.getElementById('rosterList');
        
        rosterList.innerHTML = '';

        if (this.roster.length === 0) {
            rosterList.innerHTML = '<p style="text-align: center; color: #aaa;">No wrestlers in roster yet. Battle some wrestlers to add them!</p>';
        } else {
            this.roster.forEach(wrestler => {
                const card = document.createElement('div');
                card.className = 'wrestler-card';
                card.innerHTML = `
                    <h4>${wrestler.name}</h4>
                    <div class="wrestler-stats">
                        Level: ${wrestler.level} | 
                        HP: ${wrestler.hp}/${wrestler.maxHp} | 
                        Power: ${wrestler.power} | 
                        Speed: ${wrestler.speed} | 
                        Charisma: ${wrestler.charisma}
                    </div>
                `;
                rosterList.appendChild(card);
            });
        }

        modal.classList.remove('hidden');
    }

    // Initialize roster UI
    initializeRosterUI() {
        const closeRosterBtn = document.getElementById('closeRoster');
        if (closeRosterBtn) {
            closeRosterBtn.addEventListener('click', () => {
                document.getElementById('rosterModal').classList.add('hidden');
            });
        }

        this.updateRosterDisplay();
    }

    // Update roster display
    updateRosterDisplay() {
        const rosterCount = document.getElementById('rosterCount');
        if (rosterCount) {
            rosterCount.textContent = `${this.getRosterCount()}/${this.maxRosterSize}`;
        }
    }

    // Generate random opponent wrestler
    generateOpponent() {
        const wrestlers = [
            // WWE Superstars
            "John Cena", "Roman Reigns", "Seth Rollins", "Kevin Owens", "Sami Zayn",
            "AJ Styles", "Randy Orton", "Drew McIntyre", "Bobby Lashley", "Big E",
            "Kofi Kingston", "Xavier Woods", "The Miz", "Damian Priest", "Finn Bálor",
            
            // WWE Legends
            "Hulk Hogan", "Stone Cold Steve Austin", "The Rock", "The Undertaker", "Triple H",
            "Shawn Michaels", "Bret Hart", "Chris Jericho", "Eddie Guerrero", "Rey Mysterio",
            "Kurt Angle", "Chris Benoit", "Rob Van Dam", "Booker T", "Goldberg",
            
            // WCW Stars
            "Sting", "Diamond Dallas Page", "Ric Flair", "Arn Anderson", "Lex Luger",
            "Scott Hall", "Kevin Nash", "Hollywood Hogan", "Buff Bagwell", "Scott Steiner",
            
            // TNA/Impact Wrestling
            "AJ Styles", "Samoa Joe", "Bobby Roode", "James Storm", "Eric Young",
            "Austin Aries", "Bobby Lashley", "Ethan Carter III", "Matt Hardy", "Jeff Hardy",
            
            // AEW Superstars
            "CM Punk", "Bryan Danielson", "Adam Cole", "Kenny Omega", "Chris Jericho",
            "MJF", "Darby Allin", "Jungle Boy", "Sammy Guevara", "Orange Cassidy",
            "The Young Bucks", "FTR", "Jon Moxley", "Hangman Adam Page", "PAC",
            
            // ROH Stars
            "Bryan Danielson", "Seth Rollins", "Kevin Owens", "Cesaro", "Samoa Joe",
            "Austin Aries", "Adam Cole", "The Briscoes", "Christopher Daniels", "Frankie Kazarian",
            
            // Future/Indie Stars
            "Walter", "Ilja Dragunov", "Jordan Devlin", "Travis Banks", "David Starr",
            "Zack Sabre Jr.", "Will Ospreay", "Marty Scurll", "KUSHIDA", "Taiji Ishimori"
        ];
        
        const randomWrestler = wrestlers[Math.floor(Math.random() * wrestlers.length)];
        const level = Math.floor(Math.random() * 5) + 1; // Level 1-5
        
        return GameUtils.createWrestlerTemplate(randomWrestler, level);
    }

    // Heal wrestler
    healWrestler(wrestlerId, amount) {
        const wrestler = this.getWrestlerById(wrestlerId);
        if (wrestler) {
            wrestler.hp = Math.min(wrestler.hp + amount, wrestler.maxHp);
            this.saveRoster();
            return true;
        }
        return false;
    }

    // Level up wrestler
    levelUpWrestler(wrestlerId) {
        const wrestler = this.getWrestlerById(wrestlerId);
        if (wrestler) {
            wrestler.level++;
            wrestler.maxHp += 20;
            wrestler.hp = wrestler.maxHp; // Full heal on level up
            wrestler.power += 2;
            wrestler.speed += 1;
            wrestler.charisma += 1;
            
            // Increase move damage
            Object.keys(wrestler.moves).forEach(moveKey => {
                const move = wrestler.moves[moveKey];
                move.damage[0] += 2;
                move.damage[1] += 3;
            });
            
            this.saveRoster();
            GameUtils.showNotification(`${wrestler.name} leveled up to ${wrestler.level}!`);
            return true;
        }
        return false;
    }

    // Get roster summary
    getRosterSummary() {
        return {
            totalWrestlers: this.roster.length,
            averageLevel: this.roster.length > 0 ? 
                Math.round(this.roster.reduce((sum, w) => sum + w.level, 0) / this.roster.length) : 0,
            highestLevel: this.roster.length > 0 ? 
                Math.max(...this.roster.map(w => w.level)) : 0
        };
    }
}

// Global roster manager instance
export const rosterManager = new RosterManager();