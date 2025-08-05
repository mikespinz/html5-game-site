// Utility functions for the Wrestling RPG game

export class GameUtils {
    // Save data to localStorage
    static saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Load data from localStorage
    static loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading data:', error);
            return defaultValue;
        }
    }

    // Generate random number between min and max
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Calculate damage based on attacker power and defender stats
    static calculateDamage(attackerPower, defenderSpeed, baseDamage) {
        const speedReduction = defenderSpeed * 0.1;
        const finalDamage = Math.max(1, baseDamage + attackerPower - speedReduction);
        return this.random(finalDamage * 0.8, finalDamage * 1.2);
    }

    // Show notification message
    static showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(233, 69, 96, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Courier New', monospace;
            border: 2px solid #fff;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    // Check if two rectangles collide
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Get distance between two points
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Format number with commas
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Create wrestler template
    static createWrestlerTemplate(name, level = 1) {
        return {
            id: Date.now() + Math.random(),
            name: name,
            level: level,
            hp: 100 + (level - 1) * 20,
            maxHp: 100 + (level - 1) * 20,
            power: 10 + (level - 1) * 2,
            speed: 8 + (level - 1) * 1,
            charisma: 7 + (level - 1) * 1,
            experience: 0,
            moves: {
                bigMove: { name: "Big Move", damage: [15, 25], type: "power" },
                signature: { name: "Signature", damage: [20, 30], type: "signature" },
                taunt: { name: "Taunt", damage: [5, 10], type: "charisma" },
                finisher: { name: "Finisher", damage: [30, 40], type: "finisher" }
            }
        };
    }

    // Add CSS animations dynamically
    static addAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize animations when the script loads
GameUtils.addAnimations();