/**
 * ResourceBuildingSystem - Manages entering lumber mills and brick factories
 * Allows players to collect resources directly
 */

export class ResourceBuildingSystem {
    constructor(scene) {
        this.scene = scene;
        this.insideBuilding = false;
        this.currentBuilding = null;
        this.cooldowns = {
            wood: 0,
            bricks: 0
        };
    }

    /**
     * Enter a resource building (lumber mill or brick factory)
     */
    enterBuilding(building) {
        console.log('🏗️ Entering resource building:', building.type);
        console.log('Building data:', building);

        this.insideBuilding = true;
        this.currentBuilding = building;

        // Create interior UI
        this.createInteriorUI();

        console.log('Interior UI created, container visible:', this.interiorContainer?.visible);

        // Disable player movement
        this.scene.player.setVelocityX(0);
        this.scene.player.setVelocityY(0);
    }

    /**
     * Exit the resource building
     */
    exitBuilding() {
        console.log('Exiting resource building');

        this.insideBuilding = false;
        this.currentBuilding = null;

        // Hide interior UI and buttons
        if (this.interiorContainer) {
            this.interiorContainer.setVisible(false);
        }
        if (this.collectButton) this.collectButton.setVisible(false);
        if (this.exitButton) this.exitButton.setVisible(false);
    }

    /**
     * Create the interior UI for resource buildings
     */
    createInteriorUI() {
        // Create container if it doesn't exist
        if (!this.interiorContainer) {
            this.interiorContainer = this.scene.add.container(0, 0);
            this.interiorContainer.setScrollFactor(0).setDepth(15000);

            // Background - use rectangle instead of graphics for better input handling
            this.interiorBg = this.scene.add.rectangle(
                this.scene.gameWidth / 2,
                this.scene.gameHeight / 2,
                this.scene.gameWidth,
                this.scene.gameHeight,
                0x2C2416,
                0.95
            );
            // Make background interactive to catch clicks but don't block children
            this.interiorBg.setInteractive();
            this.interiorBg.on('pointerdown', (pointer, localX, localY, event) => {
                // Stop propagation so clicks don't go through to game behind
                event.stopPropagation();
                console.log('Background clicked - event stopped');
            });

            this.interiorContainer.add(this.interiorBg);

            // Title
            this.buildingNameLabel = this.scene.add.text(this.scene.gameWidth / 2, 60, '', {
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);
            this.interiorContainer.add(this.buildingNameLabel);

            // Description text
            this.descriptionText = this.scene.add.text(this.scene.gameWidth / 2, 120, '', {
                fontSize: '18px',
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: 500 }
            }).setOrigin(0.5);
            this.interiorContainer.add(this.descriptionText);

            // Cooldown status text
            this.cooldownText = this.scene.add.text(this.scene.gameWidth / 2, 180, '', {
                fontSize: '16px',
                color: '#FFA726',
                align: 'center'
            }).setOrigin(0.5);
            this.interiorContainer.add(this.cooldownText);

            // Collect Resources Button
            this.collectButton = this.scene.add.text(this.scene.gameWidth / 2, 250, '📦 COLLECT RESOURCES (10 Resources) 📦', {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5);

            this.collectButton.setScrollFactor(0);
            this.collectButton.setDepth(16000);
            this.collectButton.setInteractive();

            this.collectButton.on('pointerdown', () => {
                console.log('📦 Collect button clicked!');
                this.collectResources();
            });

            this.collectButton.on('pointerover', () => {
                console.log('Hover over collect button');
                this.collectButton.setStyle({ backgroundColor: '#66BB6A' });
            });

            this.collectButton.on('pointerout', () => {
                this.collectButton.setStyle({ backgroundColor: '#4CAF50' });
            });

            this.collectButton.setVisible(false);

            // Exit button
            this.exitButton = this.scene.add.text(this.scene.gameWidth / 2, 330, 'EXIT (Press E)', {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#757575',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);

            this.exitButton.setScrollFactor(0);
            this.exitButton.setDepth(16000);
            this.exitButton.setInteractive();

            this.exitButton.on('pointerdown', () => {
                console.log('Exit button clicked!');
                this.exitBuilding();
            });
            this.exitButton.on('pointerover', () => {
                console.log('Hover over exit button');
                this.exitButton.setStyle({ backgroundColor: '#9E9E9E' });
            });
            this.exitButton.on('pointerout', () => this.exitButton.setStyle({ backgroundColor: '#757575' }));

            this.exitButton.setVisible(false);
        }

        // Update labels based on building type
        const isLumberMill = this.currentBuilding.type === 'lumbermill';
        const icon = isLumberMill ? '🪵' : '🧱';
        const name = isLumberMill ? 'LUMBER MILL' : 'BRICK FACTORY';
        const resourceType = isLumberMill ? 'wood' : 'bricks';

        this.buildingNameLabel.setText(`${icon} ${name} ${icon}`);
        this.descriptionText.setText(`Collect resources from the ${name.toLowerCase()}.`);

        // Update button state and cooldown text
        this.updateCooldownDisplay();

        // Show the container and buttons
        this.interiorContainer.setVisible(true);
        if (this.collectButton) this.collectButton.setVisible(true);
        if (this.exitButton) this.exitButton.setVisible(true);
    }

    /**
     * Check if resource collection is available (not on cooldown)
     */
    canCollectResources(resourceType) {
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
     * Update cooldown display
     */
    updateCooldownDisplay() {
        if (!this.currentBuilding) return;

        const resourceType = this.currentBuilding.type === 'lumbermill' ? 'wood' : 'bricks';
        const canCollect = this.canCollectResources(resourceType);

        if (canCollect) {
            this.cooldownText.setText('✓ Resources Ready!');
            this.cooldownText.setStyle({ color: '#4CAF50' });
            this.collectButton.setStyle({ backgroundColor: '#4CAF50' });
            this.collectButton.setInteractive();
        } else {
            const remaining = this.getRemainingCooldown(resourceType);
            this.cooldownText.setText(`⏰ Cooldown: ${remaining} minute${remaining !== 1 ? 's' : ''} remaining`);
            this.cooldownText.setStyle({ color: '#F44336' });
            this.collectButton.setStyle({ backgroundColor: '#9E9E9E' });
            this.collectButton.disableInteractive();
        }
    }

    /**
     * Collect resources from the building
     */
    collectResources() {
        if (!this.currentBuilding) {
            console.log('No current building');
            return;
        }

        const resourceType = this.currentBuilding.type === 'lumbermill' ? 'wood' : 'bricks';

        if (!this.canCollectResources(resourceType)) {
            const remaining = this.getRemainingCooldown(resourceType);
            this.scene.uiManager.addNotification(`⏰ Cooldown: ${remaining} min remaining`);
            return;
        }

        // Award resources
        const reward = 10;
        if (resourceType === 'wood') {
            this.scene.wood += reward;
            this.scene.uiManager.addNotification(`🪵 +${reward} wood collected!`);
        } else {
            this.scene.bricks += reward;
            this.scene.uiManager.addNotification(`🧱 +${reward} bricks collected!`);
        }

        // Set cooldown (5 minutes = 300 game seconds)
        this.cooldowns[resourceType] = this.scene.gameTime + 300;

        // Update UI
        this.scene.uiManager.updateMoneyUI();
        this.updateCooldownDisplay();
    }

    /**
     * Update method called from main game loop
     */
    update(deltaTime) {
        // Update cooldown display if inside building
        if (this.insideBuilding) {
            this.updateCooldownDisplay();
        }
    }
}
