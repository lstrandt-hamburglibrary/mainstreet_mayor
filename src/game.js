class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 3000, 600);

        // Track stairs and climbing state
        this.stairZones = [];
        this.isClimbing = false;

        // Resources
        this.money = 1000;
        this.wood = 50;
        this.bricks = 30;

        // Building system
        this.buildMode = false;
        this.selectedBuilding = null;
        this.buildingPreview = null;
        this.buildings = [];
        this.buildingTypes = {
            house: { name: 'House', cost: 100, wood: 10, bricks: 5, width: 160, height: 200, color: 0xFF6B6B },
            shop: { name: 'Shop', cost: 200, wood: 15, bricks: 10, width: 200, height: 240, color: 0x4ECDC4 },
            restaurant: { name: 'Restaurant', cost: 300, wood: 20, bricks: 15, width: 240, height: 220, color: 0xFFE66D }
        };

        // Sky
        this.add.rectangle(1500, 300, 3000, 600, 0x87CEEB).setScrollFactor(0.5);

        // Ground
        const ground = this.add.rectangle(1500, 550, 3000, 100, 0x555555);

        // Ground platform for physics
        const groundPlatform = this.physics.add.staticGroup();
        groundPlatform.create(1500, 500, null).setSize(3000, 20).setVisible(false).refreshBody();

        // Add some platforms
        const platform1 = this.physics.add.staticGroup();
        platform1.create(375, 400, null).setSize(150, 20).setVisible(false).refreshBody();
        this.add.rectangle(375, 400, 150, 20, 0x8B4513);

        const platform2 = this.physics.add.staticGroup();
        platform2.create(625, 350, null).setSize(150, 20).setVisible(false).refreshBody();
        this.add.rectangle(625, 350, 150, 20, 0x8B4513);

        // Create stairs
        this.createStairs(500, 450, 6);
        this.createStairs(800, 400, 8);

        // Create player as a simple colored rectangle first
        this.player = this.physics.add.sprite(100, 400);
        const playerBox = this.add.rectangle(0, 0, 30, 60, 0x2196F3);
        this.player.setSize(30, 60);
        this.player.setCollideWorldBounds(true);

        // Attach visual to player
        this.playerVisual = this.add.container(100, 400);

        // Shadow
        const shadow = this.add.ellipse(0, 28, 35, 10, 0x000000, 0.3);
        this.playerVisual.add(shadow);

        // Legs
        const leftLeg = this.add.graphics();
        leftLeg.fillStyle(0x1565C0, 1);
        leftLeg.fillRoundedRect(-8, 8, 8, 18, 2);
        this.playerVisual.add(leftLeg);

        const rightLeg = this.add.graphics();
        rightLeg.fillStyle(0x1565C0, 1);
        rightLeg.fillRoundedRect(0, 8, 8, 18, 2);
        this.playerVisual.add(rightLeg);

        // Shoes
        const leftShoe = this.add.ellipse(-4, 28, 12, 6, 0x000000);
        const rightShoe = this.add.ellipse(4, 28, 12, 6, 0x000000);
        this.playerVisual.add(leftShoe);
        this.playerVisual.add(rightShoe);

        // Body (suit)
        const body = this.add.graphics();
        body.fillStyle(0x2196F3, 1);
        body.fillRoundedRect(-10, -15, 20, 24, 3);
        this.playerVisual.add(body);

        // Tie
        const tie = this.add.graphics();
        tie.fillStyle(0xC62828, 1);
        tie.beginPath();
        tie.moveTo(0, -10);
        tie.lineTo(-3, -5);
        tie.lineTo(-4, 5);
        tie.lineTo(0, 8);
        tie.lineTo(4, 5);
        tie.lineTo(3, -5);
        tie.closePath();
        tie.fillPath();
        this.playerVisual.add(tie);

        // Collar
        const collar = this.add.graphics();
        collar.fillStyle(0xFFFFFF, 1);
        collar.fillTriangle(-6, -12, 0, -8, -3, -6);
        collar.fillTriangle(6, -12, 0, -8, 3, -6);
        this.playerVisual.add(collar);

        // Arms
        const leftArm = this.add.graphics();
        leftArm.fillStyle(0x2196F3, 1);
        leftArm.fillRoundedRect(-14, -8, 5, 14, 2);
        this.playerVisual.add(leftArm);

        const rightArm = this.add.graphics();
        rightArm.fillStyle(0x2196F3, 1);
        rightArm.fillRoundedRect(9, -8, 5, 14, 2);
        this.playerVisual.add(rightArm);

        // Hands
        const leftHand = this.add.circle(-11, 8, 4, 0xFFDBAC);
        const rightHand = this.add.circle(11, 8, 4, 0xFFDBAC);
        this.playerVisual.add(leftHand);
        this.playerVisual.add(rightHand);

        // Neck
        const neck = this.add.rectangle(0, -16, 6, 4, 0xFFDBAC);
        this.playerVisual.add(neck);

        // Head
        const head = this.add.circle(0, -25, 11, 0xFFDBAC);
        this.playerVisual.add(head);

        // Ears
        const leftEar = this.add.circle(-10, -25, 3, 0xFFDBAC);
        const rightEar = this.add.circle(10, -25, 3, 0xFFDBAC);
        this.playerVisual.add(leftEar);
        this.playerVisual.add(rightEar);

        // Eyes
        const leftEye = this.add.graphics();
        leftEye.fillStyle(0xFFFFFF, 1);
        leftEye.fillCircle(-4, -27, 3);
        leftEye.fillStyle(0x000000, 1);
        leftEye.fillCircle(-3, -27, 2);
        this.playerVisual.add(leftEye);

        const rightEye = this.add.graphics();
        rightEye.fillStyle(0xFFFFFF, 1);
        rightEye.fillCircle(4, -27, 3);
        rightEye.fillStyle(0x000000, 1);
        rightEye.fillCircle(5, -27, 2);
        this.playerVisual.add(rightEye);

        // Eyebrows
        const leftBrow = this.add.graphics();
        leftBrow.lineStyle(2, 0x654321, 1);
        leftBrow.lineBetween(-7, -31, -2, -30);
        this.playerVisual.add(leftBrow);

        const rightBrow = this.add.graphics();
        rightBrow.lineStyle(2, 0x654321, 1);
        rightBrow.lineBetween(2, -30, 7, -31);
        this.playerVisual.add(rightBrow);

        // Smile
        const smile = this.add.graphics();
        smile.lineStyle(2, 0x000000, 1);
        smile.arc(0, -23, 5, 0.2, Math.PI - 0.2, false);
        smile.strokePath();
        this.playerVisual.add(smile);

        // Nose
        const nose = this.add.circle(0, -24, 2, 0xFFAA88);
        this.playerVisual.add(nose);

        // Mayor's hat
        const hatBrim = this.add.graphics();
        hatBrim.fillStyle(0x1976D2, 1);
        hatBrim.fillRoundedRect(-12, -36, 24, 3, 1);
        this.playerVisual.add(hatBrim);

        const hatTop = this.add.graphics();
        hatTop.fillStyle(0x1976D2, 1);
        hatTop.fillRoundedRect(-8, -44, 16, 8, 2);
        this.playerVisual.add(hatTop);

        // Hat badge
        const badge = this.add.graphics();
        badge.fillStyle(0xFFD700, 1);
        badge.fillCircle(0, -40, 3);
        badge.fillStyle(0xFFA500, 1);
        badge.fillCircle(0, -40, 2);
        this.playerVisual.add(badge);

        // Add collisions
        this.physics.add.collider(this.player, groundPlatform);
        this.physics.add.collider(this.player, platform1);
        this.physics.add.collider(this.player, platform2);

        // Camera follow
        this.cameras.main.setBounds(0, 0, 3000, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey('W');
        this.aKey = this.input.keyboard.addKey('A');
        this.sKey = this.input.keyboard.addKey('S');
        this.dKey = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.bKey = this.input.keyboard.addKey('B');
        this.key1 = this.input.keyboard.addKey('ONE');
        this.key2 = this.input.keyboard.addKey('TWO');
        this.key3 = this.input.keyboard.addKey('THREE');
        this.enterKey = this.input.keyboard.addKey('ENTER');

        // Mouse input for building placement
        this.input.on('pointerdown', (pointer) => {
            if (this.buildMode && this.buildingPreview) {
                this.placeBuilding();
            }
        });

        // UI
        const title = this.add.text(20, 20, 'Main Street Mayor', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0);

        const controls = this.add.text(20, 60, 'Arrow Keys/WASD: Move\nSpace: Jump\nW/S on stairs: Climb\nB: Build Mode', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0);

        // Resource UI
        this.resourceUI = this.add.text(20, 140, '', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 8 }
        }).setScrollFactor(0);

        // Build menu UI
        this.buildMenuUI = this.add.text(400, 20, '', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 8 }
        }).setScrollFactor(0);
        this.buildMenuUI.setVisible(false);
    }

    createStairs(x, y, numSteps) {
        const stepWidth = 80;
        const stepHeight = 20;

        for (let i = 0; i < numSteps; i++) {
            // Visual step
            const step = this.add.rectangle(x + stepWidth/2, y - (i * stepHeight) + stepHeight/2,
                                           stepWidth, stepHeight, 0xA0522D);
            step.setStrokeStyle(2, 0x654321);

            // Create a zone for this step for climbing detection
            const zone = this.add.zone(x + stepWidth/2, y - (i * stepHeight) + stepHeight/2,
                                      stepWidth, stepHeight);
            this.physics.add.existing(zone);
            zone.body.setAllowGravity(false);
            this.stairZones.push(zone);
        }
    }

    update() {
        // Update resource UI
        this.resourceUI.setText(`💰 $${this.money}  🪵 ${this.wood}  🧱 ${this.bricks}`);

        // Toggle build mode
        if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
            this.buildMode = !this.buildMode;
            if (this.buildMode) {
                this.selectedBuilding = 'house'; // Default selection
            } else {
                this.selectedBuilding = null;
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
            }
        }

        // Update build menu
        if (this.buildMode) {
            let menuText = '=== BUILD MODE ===\n';
            menuText += '1: House ($100, 🪵10, 🧱5)\n';
            menuText += '2: Shop ($200, 🪵15, 🧱10)\n';
            menuText += '3: Restaurant ($300, 🪵20, 🧱15)\n';
            menuText += 'Click to place | B to exit';
            this.buildMenuUI.setText(menuText);
            this.buildMenuUI.setVisible(true);

            // Select building type
            if (Phaser.Input.Keyboard.JustDown(this.key1)) this.selectedBuilding = 'house';
            if (Phaser.Input.Keyboard.JustDown(this.key2)) this.selectedBuilding = 'shop';
            if (Phaser.Input.Keyboard.JustDown(this.key3)) this.selectedBuilding = 'restaurant';

            // Update building preview
            this.updateBuildingPreview();
        } else {
            this.buildMenuUI.setVisible(false);
        }

        // Sync visual with player
        this.playerVisual.x = this.player.x;
        this.playerVisual.y = this.player.y;

        // Check if player is on stairs
        let onStairs = false;
        for (let zone of this.stairZones) {
            const bounds = zone.getBounds();
            if (this.player.x >= bounds.left && this.player.x <= bounds.right &&
                this.player.y >= bounds.top && this.player.y <= bounds.bottom) {
                onStairs = true;
                break;
            }
        }

        // Movement
        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.player.setVelocityX(-200);
            this.playerVisual.scaleX = -1;
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.player.setVelocityX(200);
            this.playerVisual.scaleX = 1;
        } else {
            this.player.setVelocityX(0);
        }

        // Climbing mode when on stairs
        if (onStairs && ((this.cursors.up.isDown || this.wKey.isDown) ||
                        (this.cursors.down.isDown || this.sKey.isDown))) {
            this.player.body.setAllowGravity(false);
            this.isClimbing = true;

            if (this.cursors.up.isDown || this.wKey.isDown) {
                this.player.setVelocityY(-150);
            } else if (this.cursors.down.isDown || this.sKey.isDown) {
                this.player.setVelocityY(150);
            } else {
                this.player.setVelocityY(0);
            }
        } else {
            // Normal physics
            this.player.body.setAllowGravity(true);
            this.isClimbing = false;

            // Jump - check if on ground or platform
            const onGround = this.player.body.touching.down ||
                            this.player.body.blocked.down ||
                            Math.abs(this.player.body.velocity.y) < 0.5;

            if ((this.cursors.up.isDown || this.wKey.isDown || this.spaceKey.isDown) && onGround) {
                this.player.setVelocityY(-550);
            }
        }
    }

    updateBuildingPreview() {
        if (!this.buildMode || !this.selectedBuilding) return;

        const building = this.buildingTypes[this.selectedBuilding];
        const mouseWorldX = this.input.activePointer.x + this.cameras.main.scrollX;

        // Snap to grid (every 240 pixels along the street for bigger buildings)
        const snappedX = Math.round(mouseWorldX / 240) * 240;
        const buildingY = 500; // Ground level (matches the gray street)

        // Remove old preview
        if (this.buildingPreview) {
            this.buildingPreview.destroy();
        }

        // Create new preview
        const previewGraphics = this.add.graphics();
        previewGraphics.fillStyle(building.color, 0.5);
        previewGraphics.fillRect(snappedX - building.width/2, buildingY - building.height,
                                building.width, building.height);
        previewGraphics.lineStyle(3, 0xFFFFFF, 0.8);
        previewGraphics.strokeRect(snappedX - building.width/2, buildingY - building.height,
                                  building.width, building.height);

        this.buildingPreview = previewGraphics;
        this.buildingPreview.snappedX = snappedX;
        this.buildingPreview.buildingY = buildingY;
    }

    placeBuilding() {
        if (!this.selectedBuilding || !this.buildingPreview) return;

        const building = this.buildingTypes[this.selectedBuilding];

        // Check if player has enough resources
        if (this.money < building.cost || this.wood < building.wood || this.bricks < building.bricks) {
            console.log('Not enough resources!');
            return;
        }

        // Deduct resources
        this.money -= building.cost;
        this.wood -= building.wood;
        this.bricks -= building.bricks;

        // Create permanent building
        const x = this.buildingPreview.snappedX;
        const y = this.buildingPreview.buildingY;

        const newBuilding = this.add.graphics();
        newBuilding.fillStyle(building.color, 1);
        newBuilding.fillRect(x - building.width/2, y - building.height, building.width, building.height);
        newBuilding.lineStyle(3, 0x000000, 1);
        newBuilding.strokeRect(x - building.width/2, y - building.height, building.width, building.height);

        // Add windows (scaled for bigger buildings)
        const windowColor = 0xFFFF99;
        const windowsPerRow = Math.floor(building.width / 50);
        const windowRows = Math.floor(building.height / 80);

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowsPerRow; col++) {
                newBuilding.fillStyle(windowColor, 1);
                const wx = x - building.width/2 + 20 + col * 50;
                const wy = y - building.height + 30 + row * 50;
                newBuilding.fillRect(wx, wy, 30, 30);
                // Window frame
                newBuilding.lineStyle(2, 0x000000, 1);
                newBuilding.strokeRect(wx, wy, 30, 30);
            }
        }

        // Add door (bigger)
        newBuilding.fillStyle(0x654321, 1);
        newBuilding.fillRect(x - 30, y - 60, 60, 60);
        // Door knob
        newBuilding.fillStyle(0xFFD700, 1);
        newBuilding.fillCircle(x + 15, y - 30, 5);

        // Add roof (bigger)
        newBuilding.fillStyle(0x8B4513, 1);
        newBuilding.fillTriangle(
            x - building.width/2 - 10, y - building.height,
            x, y - building.height - 40,
            x + building.width/2 + 10, y - building.height
        );

        // Add label (bigger text for bigger buildings)
        const label = this.add.text(x, y - building.height - 55, building.name, {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 5 }
        }).setOrigin(0.5);

        this.buildings.push({ graphics: newBuilding, label: label, type: this.selectedBuilding });

        console.log(`Built ${building.name}! Resources: $${this.money}, Wood: ${this.wood}, Bricks: ${this.bricks}`);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);
