/**
 * ResourceMinigameSystem - Manages the timing minigame for lumber mill and brick factory
 * Players click when the bar is in the green zone to earn bonus resources
 */
export class ResourceMinigameSystem {
    constructor(scene) {
        this.scene = scene;
        this.minigameActive = false;
        this.minigameContainer = null;
        this.bar = null;
        this.targetZone = null;
        this.indicator = null;
        this.indicatorPosition = 0;
        this.indicatorDirection = 1; // 1 for right, -1 for left
        this.indicatorSpeed = 200; // pixels per second
        this.resourceType = null; // 'wood' or 'bricks'
        this.cooldowns = {
            wood: 0,
            bricks: 0
        };
    }

    /**
     * Check if minigame is available (not on cooldown)
     */
    canPlayMinigame(resourceType) {
        return this.scene.gameTime >= this.cooldowns[resourceType];
    }

    /**
     * Get remaining cooldown time in seconds
     */
    getRemainingCooldown(resourceType) {
        const remaining = this.cooldowns[resourceType] - this.scene.gameTime;
        return Math.max(0, Math.ceil(remaining / 60)); // Convert to game minutes
    }

    /**
     * Start the timing minigame
     */
    startMinigame(resourceType) {
        console.log('startMinigame called with:', resourceType);

        if (this.minigameActive) {
            console.log('Minigame already active');
            return;
        }

        if (!this.canPlayMinigame(resourceType)) {
            const remaining = this.getRemainingCooldown(resourceType);
            console.log('Minigame on cooldown:', remaining, 'minutes');
            this.scene.uiManager.addNotification(`⏰ Minigame cooldown: ${remaining} min remaining`);
            return;
        }

        console.log('Starting minigame - setting active');
        this.minigameActive = true;
        this.resourceType = resourceType;

        // Create minigame UI
        this.createMinigameUI();
    }

    /**
     * Create the minigame UI
     */
    createMinigameUI() {
        this.minigameContainer = this.scene.add.container(this.scene.gameWidth / 2, this.scene.gameHeight / 2);
        this.minigameContainer.setScrollFactor(0).setDepth(99999);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-300, -150, 600, 300, 10);
        bg.lineStyle(3, 0xFFD700, 1);
        bg.strokeRoundedRect(-300, -150, 600, 300, 10);
        this.minigameContainer.add(bg);

        // Title
        const icon = this.resourceType === 'wood' ? '🪵' : '🧱';
        const title = this.scene.add.text(0, -110, `${icon} RESOURCE COLLECTION MINIGAME ${icon}`, {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FFD700'
        });
        title.setOrigin(0.5);
        this.minigameContainer.add(title);

        // Instructions
        const instructions = this.scene.add.text(0, -70, 'Click when the indicator is in the GREEN zone!', {
            fontSize: '16px',
            color: '#ffffff'
        });
        instructions.setOrigin(0.5);
        this.minigameContainer.add(instructions);

        // Bar background
        const barBg = this.scene.add.graphics();
        barBg.fillStyle(0x424242, 1);
        barBg.fillRect(-250, -20, 500, 40);
        barBg.lineStyle(2, 0x757575, 1);
        barBg.strokeRect(-250, -20, 500, 40);
        this.minigameContainer.add(barBg);

        // Target zone (green)
        const zoneX = -250 + Math.random() * 350; // Random position, leaving room for the zone
        const zoneWidth = 100;
        this.targetZone = {
            x: zoneX,
            width: zoneWidth
        };

        const zone = this.scene.add.graphics();
        zone.fillStyle(0x4CAF50, 0.7);
        zone.fillRect(zoneX, -20, zoneWidth, 40);
        zone.lineStyle(2, 0x2E7D32, 1);
        zone.strokeRect(zoneX, -20, zoneWidth, 40);
        this.minigameContainer.add(zone);

        // Moving indicator
        this.indicator = this.scene.add.graphics();
        this.indicator.fillStyle(0xFFD700, 1);
        this.indicator.fillRect(-5, -25, 10, 50);
        this.indicator.x = -250;
        this.indicatorPosition = 0;
        this.indicatorDirection = 1;
        this.minigameContainer.add(this.indicator);

        // Result text (hidden initially)
        this.resultText = this.scene.add.text(0, 60, '', {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFD700'
        });
        this.resultText.setOrigin(0.5);
        this.resultText.setVisible(false);
        this.minigameContainer.add(this.resultText);

        // Click instruction
        const clickText = this.scene.add.text(0, 100, 'Click anywhere or press SPACE', {
            fontSize: '14px',
            color: '#AAAAAA'
        });
        clickText.setOrigin(0.5);
        this.minigameContainer.add(clickText);

        // Make the container clickable
        const clickZone = this.scene.add.rectangle(0, 0, 600, 300, 0x000000, 0);
        clickZone.setInteractive();
        clickZone.on('pointerdown', () => {
            console.log('Click detected in minigame');
            this.checkResult();
        });
        this.minigameContainer.add(clickZone);
    }

    /**
     * Update indicator position
     */
    update(deltaTime) {
        if (!this.minigameActive || !this.indicator) return;

        // Move indicator
        this.indicatorPosition += this.indicatorSpeed * deltaTime * this.indicatorDirection;

        // Bounce at edges
        if (this.indicatorPosition >= 500) {
            this.indicatorPosition = 500;
            this.indicatorDirection = -1;
        } else if (this.indicatorPosition <= 0) {
            this.indicatorPosition = 0;
            this.indicatorDirection = 1;
        }

        // Update indicator visual position
        this.indicator.x = -250 + this.indicatorPosition;
    }

    /**
     * Check if player clicked in the target zone
     */
    checkResult() {
        if (!this.minigameActive) {
            console.log('Minigame not active');
            return;
        }

        const indicatorX = -250 + this.indicatorPosition;
        const inZone = indicatorX >= this.targetZone.x &&
                      indicatorX <= (this.targetZone.x + this.targetZone.width);

        console.log('Check result:', { indicatorX, targetZone: this.targetZone, inZone });

        if (inZone) {
            // Success!
            this.handleSuccess();
        } else {
            // Miss!
            this.handleMiss();
        }
    }

    /**
     * Handle successful click
     */
    handleSuccess() {
        // Stop the indicator
        this.minigameActive = false;

        // Show success message
        this.resultText.setText('✓ PERFECT!');
        this.resultText.setStyle({ color: '#4CAF50' });
        this.resultText.setVisible(true);

        // Award resources
        const reward = 10;
        if (this.resourceType === 'wood') {
            this.scene.wood += reward;
            this.scene.uiManager.addNotification(`🪵 +${reward} wood from minigame!`);
        } else {
            this.scene.bricks += reward;
            this.scene.uiManager.addNotification(`🧱 +${reward} bricks from minigame!`);
        }

        // Set cooldown (5 minutes = 300 game seconds)
        this.cooldowns[this.resourceType] = this.scene.gameTime + 300;

        // Update UI
        this.scene.uiManager.updateMoneyUI();

        // Close after delay
        this.scene.time.delayedCall(1500, () => {
            this.closeMinigame();
        });
    }

    /**
     * Handle missed click
     */
    handleMiss() {
        // Stop the indicator
        this.minigameActive = false;

        // Show miss message
        this.resultText.setText('✗ MISSED!');
        this.resultText.setStyle({ color: '#F44336' });
        this.resultText.setVisible(true);

        // No reward, but no cooldown either (can try again immediately)
        this.scene.uiManager.addNotification(`❌ Missed! Try again.`);

        // Close after delay
        this.scene.time.delayedCall(1500, () => {
            this.closeMinigame();
        });
    }

    /**
     * Close the minigame
     */
    closeMinigame() {
        if (this.minigameContainer) {
            this.minigameContainer.destroy();
            this.minigameContainer = null;
        }
        this.indicator = null;
        this.resultText = null;
        this.minigameActive = false;
    }

    /**
     * Handle spacebar press for clicking
     */
    handleSpacePress() {
        if (this.minigameActive) {
            this.checkResult();
        }
    }
}
