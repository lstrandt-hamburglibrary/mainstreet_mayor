/**
 * ResourceBuildingSystem - Manages entering lumber mills and brick factories
 * Allows players to enter and play minigames to earn resources
 */
import { ResourceMinigameSystem } from './ResourceMinigameSystem.js';

export class ResourceBuildingSystem {
    constructor(scene) {
        this.scene = scene;
        this.minigameSystem = new ResourceMinigameSystem(scene);
        this.insideBuilding = false;
        this.currentBuilding = null;
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
        if (this.playButton) this.playButton.setVisible(false);
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

            // Play Minigame Button - NOT in container, separate object with high depth
            this.playButton = this.scene.add.text(this.scene.gameWidth / 2, 250, '▶ PLAY MINIGAME (Earn 10 Resources!) ◀', {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 30, y: 15 }
            }).setOrigin(0.5);

            this.playButton.setScrollFactor(0);
            this.playButton.setDepth(16000); // Higher than container
            this.playButton.setInteractive();

            this.playButton.on('pointerdown', () => {
                console.log('🎮 Play button clicked!');
                this.startMinigame();
            });

            this.playButton.on('pointerover', () => {
                console.log('Hover over play button');
                this.playButton.setStyle({ backgroundColor: '#66BB6A' });
            });

            this.playButton.on('pointerout', () => {
                this.playButton.setStyle({ backgroundColor: '#4CAF50' });
            });

            // Don't add to container - keep separate
            this.playButton.setVisible(false);

            // Exit button - NOT in container, separate object with high depth
            this.exitButton = this.scene.add.text(this.scene.gameWidth / 2, 330, 'EXIT (Press E)', {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#757575',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);

            this.exitButton.setScrollFactor(0);
            this.exitButton.setDepth(16000); // Higher than container
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

            // Don't add to container - keep separate
            this.exitButton.setVisible(false);
        }

        // Update labels based on building type
        const isLumberMill = this.currentBuilding.type === 'lumbermill';
        const icon = isLumberMill ? '🪵' : '🧱';
        const name = isLumberMill ? 'LUMBER MILL' : 'BRICK FACTORY';
        const resourceType = isLumberMill ? 'wood' : 'bricks';

        this.buildingNameLabel.setText(`${icon} ${name} ${icon}`);
        this.descriptionText.setText(`Test your timing to collect resources!\nClick when the indicator is in the green zone.`);

        // Update button state and cooldown text
        this.updateCooldownDisplay();

        // Show the container and buttons
        this.interiorContainer.setVisible(true);
        if (this.playButton) this.playButton.setVisible(true);
        if (this.exitButton) this.exitButton.setVisible(true);
    }

    /**
     * Update cooldown display
     */
    updateCooldownDisplay() {
        if (!this.currentBuilding) return;

        const resourceType = this.currentBuilding.type === 'lumbermill' ? 'wood' : 'bricks';
        const canPlay = this.minigameSystem.canPlayMinigame(resourceType);

        if (canPlay) {
            this.cooldownText.setText('✓ Minigame Ready!');
            this.cooldownText.setStyle({ color: '#4CAF50' });
            this.playButton.setStyle({ backgroundColor: '#4CAF50' });
            this.playButton.setInteractive();
        } else {
            const remaining = this.minigameSystem.getRemainingCooldown(resourceType);
            this.cooldownText.setText(`⏰ Cooldown: ${remaining} minute${remaining !== 1 ? 's' : ''} remaining`);
            this.cooldownText.setStyle({ color: '#F44336' });
            this.playButton.setStyle({ backgroundColor: '#9E9E9E' });
            this.playButton.disableInteractive();
        }
    }

    /**
     * Start the minigame
     */
    startMinigame() {
        if (!this.currentBuilding) {
            console.log('No current building');
            return;
        }

        const resourceType = this.currentBuilding.type === 'lumbermill' ? 'wood' : 'bricks';
        console.log('Starting minigame for:', resourceType);
        this.minigameSystem.startMinigame(resourceType);
    }

    /**
     * Update method called from main game loop
     */
    update(deltaTime) {
        // Update minigame if active
        this.minigameSystem.update(deltaTime);

        // Update cooldown display if inside building
        if (this.insideBuilding && !this.minigameSystem.minigameActive) {
            this.updateCooldownDisplay();
        }
    }

    /**
     * Handle spacebar press
     */
    handleSpacePress() {
        this.minigameSystem.handleSpacePress();
    }
}
