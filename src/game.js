class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Set world bounds (use window height for dynamic sizing)
        this.gameHeight = window.innerHeight;
        this.gameWidth = window.innerWidth;
        this.physics.world.setBounds(0, 0, 12000, this.gameHeight);

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        // Resources (default starting values)
        this.money = 5000;
        this.wood = 200;
        this.bricks = 150;

        // Rental application system
        this.pendingApplications = []; // Applications waiting in mailbox
        this.mailboxes = []; // Track all mailboxes on the street
        this.nearMailbox = null; // Track which mailbox player is near

        // Bank system
        this.bankBalance = 0;  // Money stored in bank
        this.loanAmount = 0;   // Money owed to bank
        this.loanInterestRate = 0.1; // 10% interest
        this.savingsInterestRate = 0.05; // 5% interest on savings

        // Time system
        this.gameTime = 0; // Time in game minutes (0 = Day 1, 00:00)
        this.timeSpeed = 1; // 1x, 2x, or 3x speed
        this.lastRealTime = Date.now();

        // Creative mode (unlimited resources for building preview)
        this.creativeMode = false;

        // Pause system
        this.isPaused = false;

        // Building system
        this.buildMode = false;
        this.deleteMode = false;  // Delete building mode
        this.selectedBuilding = null;
        this.buildingPreview = null;
        this.buildings = [];

        // Transit system
        this.buses = [];
        this.citizens = [];
        this.busStops = []; // Will be populated in createStreetFurniture()

        // Shop interior system
        this.insideShop = false;
        this.currentShop = null;
        this.nearShop = null;

        this.buildingTypes = {
            house: { name: 'House', cost: 100, wood: 10, bricks: 5, width: 160, height: 260, color: 0xFF6B6B,
                    incomeRate: 5, maxIncome: 50, district: 'residential' },  // Two-story house, $5/min, max $50
            apartment: { name: 'Apartment', cost: 400, wood: 30, bricks: 35, width: 200, height: 360, color: 0xFF8C94,
                    units: 8, incomePerUnit: 8, maxIncomePerUnit: 80, district: 'residential' },  // 4 stories, 2 units per floor
            hotel: { name: 'Hotel', cost: 600, wood: 40, bricks: 45, width: 240, height: 400, color: 0x9C27B0,
                    rooms: 10, nightlyRate: 50, cleaningCost: 15, district: 'residential' },  // 5 stories, 2 rooms per floor, $50/night per room, $15 to clean
            clothingShop: { name: 'Clothing Shop', cost: 200, wood: 15, bricks: 10, width: 200, height: 240, color: 0xFF69B4,
                    incomeRate: 10, maxIncome: 100, district: 'downtown', shopType: 'clothing' },  // Pink
            electronicsShop: { name: 'Electronics Shop', cost: 250, wood: 15, bricks: 15, width: 200, height: 240, color: 0x2196F3,
                    incomeRate: 15, maxIncome: 150, district: 'downtown', shopType: 'electronics' },  // Blue
            groceryStore: { name: 'Grocery Store', cost: 180, wood: 12, bricks: 8, width: 200, height: 240, color: 0x8BC34A,
                    incomeRate: 8, maxIncome: 80, district: 'downtown', shopType: 'grocery' },  // Green
            bookstore: { name: 'Bookstore', cost: 150, wood: 10, bricks: 8, width: 200, height: 240, color: 0x9C27B0,
                    incomeRate: 7, maxIncome: 70, district: 'downtown', shopType: 'bookstore' },  // Purple
            restaurant: { name: 'Restaurant', cost: 300, wood: 20, bricks: 15, width: 240, height: 220, color: 0xFFE66D,
                    incomeRate: 15, maxIncome: 150, district: 'downtown' },  // $15/min, max $150
            bank: { name: 'Bank', cost: 500, wood: 25, bricks: 30, width: 220, height: 260, color: 0x2E7D32, district: 'downtown' },
            market: { name: 'Market', cost: 150, wood: 12, bricks: 8, width: 180, height: 180, color: 0xFF9800, district: 'industrial' },
            lumbermill: { name: 'Lumber Mill', cost: 250, wood: 5, bricks: 20, width: 200, height: 200, color: 0x8D6E63,
                    resourceType: 'wood', regenRate: 1, maxStorage: 15, district: 'industrial' },  // 1 wood/min, max 15
            brickfactory: { name: 'Brick Factory', cost: 250, wood: 20, bricks: 5, width: 200, height: 200, color: 0xD84315,
                    resourceType: 'bricks', regenRate: 1, maxStorage: 15, district: 'industrial' }  // 1 brick/min, max 15
        };

        // District system
        this.districts = {
            residential: {
                name: 'Residential District',
                startX: 0,
                endX: 4000,
                centerX: 2000,
                color: 0xFF6B6B,
                description: 'Houses, Apartments, Hotels'
            },
            downtown: {
                name: 'Downtown',
                startX: 4000,
                endX: 8000,
                centerX: 6000,
                color: 0x4ECDC4,
                description: 'Shops, Restaurants, Banks'
            },
            industrial: {
                name: 'Industrial District',
                startX: 8000,
                endX: 12000,
                centerX: 10000,
                color: 0x8D6E63,
                description: 'Markets, Lumber Mills, Brick Factories'
            }
        };
        this.districtTravelMenuOpen = false;

        // Settings menu state
        this.settingsMenuOpen = false;

        // === BACKGROUND LAYERS (Parallax) ===

        // Sky - gradient background (fixed, doesn't scroll) - will update dynamically
        this.skyGraphics = this.add.graphics();
        this.skyGraphics.setScrollFactor(0);
        this.skyGraphics.setDepth(-100); // Far background
        // Initial sky (will be updated in update loop)
        this.updateSky();

        // Sun/Moon (changes based on time of day) - very slow parallax
        this.celestialBody = this.add.graphics();
        this.celestialBody.setScrollFactor(0.05);
        this.celestialBody.setDepth(-90); // Behind mountains
        this.updateCelestialBody(); // Will be called in update loop

        // Distant mountains (far background) - slowest parallax
        this.createMountains();

        // Distant city skyline - medium parallax
        this.createDistantCity();

        // Clouds - slow parallax
        this.createClouds();

        // Stars - appear at night
        this.createStars();

        // Ground (positioned at bottom of screen)
        this.groundY = this.gameHeight - 50;
        this.ground = this.add.rectangle(6000, this.groundY, 12000, 100, 0x555555);
        this.ground.setDepth(-10); // Above background, below buildings

        // Ground platform for physics
        this.groundPlatform = this.physics.add.staticGroup();
        this.platformY = this.gameHeight - 100;
        this.groundPlatformBody = this.groundPlatform.create(6000, this.platformY, null).setSize(12000, 20).setVisible(false);
        this.groundPlatformBody.refreshBody();

        // Add street furniture (benches, lamp posts, trash cans, mailboxes)
        this.lampPosts = []; // Track lamp posts for day/night lighting
        this.createStreetFurniture();

        // Create district markers
        this.createDistrictMarkers();

        // Create player as a simple colored rectangle first
        this.player = this.physics.add.sprite(100, this.gameHeight - 200);
        const playerBox = this.add.rectangle(0, 0, 30, 60, 0x2196F3);
        this.player.setSize(30, 60);
        this.player.setCollideWorldBounds(true);

        // Attach visual to player
        this.playerVisual = this.add.container(100, this.gameHeight - 200);
        this.playerVisual.setDepth(100); // Player on top of everything

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
        this.physics.add.collider(this.player, this.groundPlatform);

        // Camera follow
        this.cameras.main.setBounds(0, 0, 12000, this.gameHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey('W');
        this.aKey = this.input.keyboard.addKey('A');
        this.sKey = this.input.keyboard.addKey('S');
        this.dKey = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.bKey = this.input.keyboard.addKey('B');
        this.xKey = this.input.keyboard.addKey('X');  // Delete mode
        this.key1 = this.input.keyboard.addKey('ONE');
        this.key2 = this.input.keyboard.addKey('TWO');
        this.key3 = this.input.keyboard.addKey('THREE');
        this.key4 = this.input.keyboard.addKey('FOUR');
        this.key5 = this.input.keyboard.addKey('FIVE');
        this.key6 = this.input.keyboard.addKey('SIX');
        this.key7 = this.input.keyboard.addKey('SEVEN');
        this.key8 = this.input.keyboard.addKey('EIGHT');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.eKey = this.input.keyboard.addKey('E');
        this.rKey = this.input.keyboard.addKey('R');
        this.tKey = this.input.keyboard.addKey('T');
        this.cKey = this.input.keyboard.addKey('C');
        this.pKey = this.input.keyboard.addKey('P');

        // Mouse input for building placement
        this.input.on('pointerdown', (pointer) => {
            if (this.buildMode && this.buildingPreview && !this.buildConfirmShowing) {
                // Save the position where user clicked
                this.pendingBuildingX = this.buildingPreview.snappedX;
                this.pendingBuildingY = this.buildingPreview.buildingY;

                // Show confirmation dialog instead of placing immediately
                const buildingType = this.buildingTypes[this.selectedBuilding];
                const cost = buildingType.cost;
                const wood = buildingType.wood;
                const bricks = buildingType.bricks;

                this.buildConfirmUI.setText(`Place ${buildingType.name}?\n\nCost: $${cost}, 🪵${wood}, 🧱${bricks}`);
                this.buildConfirmContainer.setVisible(true);
                this.buildConfirmShowing = true;
            }
        });

        // UI - Controls (top left - simplified)
        const controls = this.add.text(20, 20, 'WASD/Arrows: Move | Space: Jump | E: Interact', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setScrollFactor(0);

        // Resource UI (top left, below controls)
        this.resourceUI = this.add.text(20, 45, '', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 6 }
        }).setScrollFactor(0);

        // Settings button (top right)
        this.settingsButton = this.add.text(this.gameWidth - 130, 20, '⚙️ MENU', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#424242',
            padding: { x: 12, y: 6 }
        }).setScrollFactor(0).setDepth(99999).setInteractive();

        this.settingsButton.on('pointerdown', () => {
            this.settingsMenuOpen = !this.settingsMenuOpen;
            this.settingsDropdown.setVisible(this.settingsMenuOpen);
        });

        this.settingsButton.on('pointerover', () => {
            this.settingsButton.setStyle({ backgroundColor: '#616161' });
        });

        this.settingsButton.on('pointerout', () => {
            this.settingsButton.setStyle({ backgroundColor: '#424242' });
        });

        // Settings dropdown menu
        this.settingsDropdown = this.add.container(this.gameWidth - 200, 55);
        this.settingsDropdown.setScrollFactor(0).setDepth(100000).setVisible(false);

        const dropdownBg = this.add.rectangle(0, 0, 200, 240, 0x424242, 1);
        dropdownBg.setOrigin(0, 0);
        this.settingsDropdown.add(dropdownBg);

        // Pause button
        this.pauseButton = this.add.text(10, 10, '⏸️ Pause', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.pauseButton);

        // Restart button
        this.restartButton = this.add.text(10, 40, '🔄 Restart', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.restartButton);

        // Speed button
        this.speedButton = this.add.text(10, 70, '⏩ Speed: 1x', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.speedButton);

        // Creative mode button
        this.creativeButton = this.add.text(10, 100, '🎨 Creative: OFF', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.creativeButton);

        // Travel button
        this.travelButton = this.add.text(10, 130, '🚌 Fast Travel', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.travelButton);

        // Build button
        this.buildButton = this.add.text(10, 160, '🏗️ Build Mode', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.buildButton);

        // Demolish button
        this.demolishButton = this.add.text(10, 190, '💥 Demolish Mode', {
            fontSize: '14px',
            color: '#ffffff'
        }).setInteractive();
        this.settingsDropdown.add(this.demolishButton);

        // Add hover effects to all dropdown buttons
        [this.pauseButton, this.restartButton, this.speedButton, this.creativeButton, this.travelButton, this.buildButton, this.demolishButton].forEach(btn => {
            btn.on('pointerover', () => btn.setStyle({ color: '#FFD700' }));
            btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
        });

        // Add click handlers for dropdown buttons
        this.pauseButton.on('pointerdown', () => {
            this.isPaused = !this.isPaused;
            this.pauseButton.setText(this.isPaused ? '▶️ Resume' : '⏸️ Pause');
            // No overlay - just pause time, allow building/interaction
        });

        this.restartButton.on('pointerdown', () => {
            this.settingsMenuOpen = false;
            this.settingsDropdown.setVisible(false);
            this.restartConfirmShowing = true;
            this.restartConfirmUI.setText('⚠️ RESTART GAME? ⚠️\nAll progress will be lost!');
            this.restartConfirmContainer.setVisible(true);
        });

        this.speedButton.on('pointerdown', () => {
            this.timeSpeed = this.timeSpeed === 1 ? 2 : this.timeSpeed === 2 ? 3 : 1;
            this.speedButton.setText(`⏩ Speed: ${this.timeSpeed}x`);
        });

        this.creativeButton.on('pointerdown', () => {
            this.creativeMode = !this.creativeMode;
            this.creativeButton.setText(this.creativeMode ? '🎨 Creative: ON' : '🎨 Creative: OFF');
        });

        this.travelButton.on('pointerdown', () => {
            this.settingsMenuOpen = false;
            this.settingsDropdown.setVisible(false);
            this.districtTravelMenuOpen = true;
            this.districtTravelContainer.setVisible(true);
        });

        this.buildButton.on('pointerdown', () => {
            this.settingsMenuOpen = false;
            this.settingsDropdown.setVisible(false);
            this.buildMode = !this.buildMode;
            this.deleteMode = false;
            this.buildMenuContainer.setVisible(this.buildMode);
            if (this.buildMode) {
                // Don't auto-select a building - let user choose
                this.selectedBuilding = null;
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
            } else {
                this.selectedBuilding = null;
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
            }
        });

        this.demolishButton.on('pointerdown', () => {
            this.settingsMenuOpen = false;
            this.settingsDropdown.setVisible(false);
            this.deleteMode = !this.deleteMode;
            this.buildMode = false;
            this.buildMenuContainer.setVisible(false);
            if (!this.deleteMode) {
                this.selectedBuilding = null;
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
            }
        });

        // Time UI (top right, next to settings)
        this.timeUI = this.add.text(this.gameWidth - 300, 20, '', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#1976D2',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(99998);

        // Build menu UI (clickable buttons at bottom of screen)
        this.buildMenuContainer = this.add.container(this.gameWidth / 2, this.gameHeight - 80);
        this.buildMenuContainer.setScrollFactor(0).setDepth(99997).setVisible(false);

        const buildMenuBg = this.add.rectangle(0, 0, this.gameWidth, 160, 0x000000, 0.9);
        this.buildMenuContainer.add(buildMenuBg);

        // Build menu title
        this.buildMenuTitle = this.add.text(0, -60, 'SELECT BUILDING TO PLACE', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.buildMenuContainer.add(this.buildMenuTitle);

        // Create building buttons (3 rows of 4)
        const buildings = [
            { type: 'house', label: '🏠 House\n$100', color: '#FF6B6B' },
            { type: 'apartment', label: '🏢 Apartment\n$400', color: '#FF8C94' },
            { type: 'hotel', label: '🏨 Hotel\n$600', color: '#9C27B0' },
            { type: 'clothingShop', label: '👔 Clothing\n$200', color: '#FF69B4' },
            { type: 'electronicsShop', label: '💻 Electronics\n$250', color: '#2196F3' },
            { type: 'groceryStore', label: '🥬 Grocery\n$180', color: '#8BC34A' },
            { type: 'bookstore', label: '📚 Bookstore\n$150', color: '#9C27B0' },
            { type: 'restaurant', label: '🍽️ Restaurant\n$300', color: '#FFE66D' },
            { type: 'bank', label: '🏦 Bank\n$500', color: '#2E7D32' },
            { type: 'market', label: '🏪 Market\n$150', color: '#FF9800' },
            { type: 'lumbermill', label: '🌲 Lumber\n$250', color: '#8D6E63' }
        ];

        this.buildingButtons = {};
        buildings.forEach((building, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            const x = -300 + (col * 200);
            const y = -40 + (row * 35);

            const btn = this.add.text(x, y, building.label, {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: building.color,
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5).setInteractive();

            btn.on('pointerdown', () => {
                console.log('Building button clicked:', building.type);
                this.selectedBuilding = building.type;
                this.updateBuildingButtonStates();
                console.log('Build mode:', this.buildMode, 'Selected:', this.selectedBuilding);
            });

            btn.on('pointerover', () => {
                if (this.selectedBuilding !== building.type) {
                    btn.setStyle({ backgroundColor: '#FFD700', color: '#000000' });
                }
            });

            btn.on('pointerout', () => {
                if (this.selectedBuilding !== building.type) {
                    btn.setStyle({ backgroundColor: building.color, color: '#ffffff' });
                }
            });

            this.buildMenuContainer.add(btn);
            this.buildingButtons[building.type] = { button: btn, originalColor: building.color };
        });

        // Add brick factory button (4th column, 3rd row)
        const brickBtn = this.add.text(100, 60, '🧱 Brick\n$250', {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#D84315',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        brickBtn.on('pointerdown', () => {
            this.selectedBuilding = 'brickfactory';
            this.updateBuildingButtonStates();
        });

        brickBtn.on('pointerover', () => {
            if (this.selectedBuilding !== 'brickfactory') {
                brickBtn.setStyle({ backgroundColor: '#FFD700', color: '#000000' });
            }
        });

        brickBtn.on('pointerout', () => {
            if (this.selectedBuilding !== 'brickfactory') {
                brickBtn.setStyle({ backgroundColor: '#D84315', color: '#ffffff' });
            }
        });

        this.buildMenuContainer.add(brickBtn);
        this.buildingButtons['brickfactory'] = { button: brickBtn, originalColor: '#D84315' };

        // Demolish mode UI (simple overlay)
        this.demolishUI = this.add.text(this.gameWidth / 2, this.gameHeight - 60, '💥 DEMOLISH MODE - Click any building to delete it', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#D32F2F',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9998).setVisible(false);

        // Building placement confirmation UI
        this.buildConfirmContainer = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
        this.buildConfirmContainer.setScrollFactor(0).setDepth(10001).setVisible(false);

        const buildConfirmBg = this.add.rectangle(0, 0, 400, 180, 0x1976D2, 1);
        this.buildConfirmContainer.add(buildConfirmBg);

        this.buildConfirmUI = this.add.text(0, -40, '', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.buildConfirmContainer.add(this.buildConfirmUI);

        this.buildConfirmButton = this.add.text(-80, 40, 'PLACE', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#2E7D32',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.buildConfirmContainer.add(this.buildConfirmButton);

        this.buildCancelButton = this.add.text(80, 40, 'CANCEL', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#424242',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.buildConfirmContainer.add(this.buildCancelButton);

        this.buildConfirmButton.on('pointerover', () => this.buildConfirmButton.setStyle({ backgroundColor: '#4CAF50' }));
        this.buildConfirmButton.on('pointerout', () => this.buildConfirmButton.setStyle({ backgroundColor: '#2E7D32' }));
        this.buildCancelButton.on('pointerover', () => this.buildCancelButton.setStyle({ backgroundColor: '#616161' }));
        this.buildCancelButton.on('pointerout', () => this.buildCancelButton.setStyle({ backgroundColor: '#424242' }));

        this.buildConfirmButton.on('pointerdown', () => {
            const success = this.placeBuilding();
            this.buildConfirmContainer.setVisible(false);
            this.buildConfirmShowing = false;

            // Only clear selection if building was successfully placed
            if (success !== false) {
                // Clear the preview and selection after placing so user can pick another building
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
                this.selectedBuilding = null;
                this.updateBuildingButtonStates(); // Update UI to show no building selected
                // buildMode stays ON so user can continue building
                console.log('Building placed successfully - buildMode:', this.buildMode);
            } else {
                console.log('Building placement failed - keeping selection');
            }
        });

        this.buildCancelButton.on('pointerdown', () => {
            this.buildConfirmContainer.setVisible(false);
            this.buildConfirmShowing = false;
            // Preview continues to follow mouse after canceling
        });

        this.buildConfirmShowing = false;

        // Bank UI
        this.bankUI = this.add.text(this.gameWidth / 2 - 200, this.gameHeight / 2 - 100, '', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#2E7D32',
            padding: { x: 10, y: 8 }
        }).setScrollFactor(0).setDepth(9999);
        this.bankUI.setVisible(false);
        this.bankMenuOpen = false;
        this.nearBank = null; // Track which bank player is near

        // Mailbox UI for rental applications
        this.mailboxUI = this.add.text(this.gameWidth / 2, this.gameHeight / 2, '', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#1976D2',
            padding: { x: 15, y: 12 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9999);
        this.mailboxUI.setVisible(false);
        this.mailboxMenuOpen = false;
        this.currentApplicationIndex = 0; // Track which application is being viewed

        // Resource building UI
        this.resourceBuildingUI = this.add.text(this.gameWidth / 2 - 200, this.gameHeight / 2 - 100, '', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#FF9800',
            padding: { x: 10, y: 8 }
        }).setScrollFactor(0).setDepth(9999);
        this.resourceBuildingUI.setVisible(false);
        this.resourceBuildingMenuOpen = false;
        this.nearResourceBuilding = null; // Track which resource building player is near

        // Shop Interior UI (full-screen overlay)
        this.shopInteriorContainer = this.add.container(0, 0);
        this.shopInteriorContainer.setScrollFactor(0).setDepth(15000).setVisible(false);

        // Interior background (full screen)
        const interiorBg = this.add.rectangle(this.gameWidth / 2, this.gameHeight / 2, this.gameWidth, this.gameHeight, 0xE8D4B0, 1);
        this.shopInteriorContainer.add(interiorBg);

        // Floor
        const floor = this.add.rectangle(this.gameWidth / 2, this.gameHeight - 100, this.gameWidth, 200, 0xB8956A, 1);
        this.shopInteriorContainer.add(floor);

        // Back wall
        const backWall = this.add.rectangle(this.gameWidth / 2, 150, this.gameWidth, 300, 0xF5E6D3, 1);
        this.shopInteriorContainer.add(backWall);

        // Counter (checkout counter at bottom center)
        const counter = this.add.graphics();
        counter.fillStyle(0x8B4513, 1);
        counter.fillRect(this.gameWidth / 2 - 150, this.gameHeight - 250, 300, 100);
        counter.lineStyle(3, 0x654321, 1);
        counter.strokeRect(this.gameWidth / 2 - 150, this.gameHeight - 250, 300, 100);
        this.shopInteriorContainer.add(counter);

        // Counter top (lighter wood)
        const counterTop = this.add.rectangle(this.gameWidth / 2, this.gameHeight - 250, 300, 15, 0xA0522D);
        this.shopInteriorContainer.add(counterTop);

        // Employee behind counter (simple sprite for now)
        const employee = this.add.container(this.gameWidth / 2, this.gameHeight - 280);

        // Employee body
        const empBody = this.add.rectangle(0, 0, 30, 40, 0x4CAF50);
        employee.add(empBody);

        // Employee head
        const empHead = this.add.circle(0, -30, 15, 0xFFDBAC);
        employee.add(empHead);

        // Employee eyes
        const empEyes = this.add.graphics();
        empEyes.fillStyle(0x000000, 1);
        empEyes.fillCircle(-5, -32, 2);
        empEyes.fillCircle(5, -32, 2);
        employee.add(empEyes);

        // Employee smile
        const empSmile = this.add.graphics();
        empSmile.lineStyle(2, 0x000000, 1);
        empSmile.arc(0, -25, 8, 0, Math.PI, false);
        empSmile.strokePath();
        employee.add(empSmile);

        this.shopInteriorContainer.add(employee);

        // Shelves on left side
        for (let i = 0; i < 3; i++) {
            const shelf = this.add.graphics();
            shelf.fillStyle(0x8B4513, 1);
            shelf.fillRect(50, 200 + (i * 120), 200, 80);
            shelf.lineStyle(2, 0x654321, 1);
            shelf.strokeRect(50, 200 + (i * 120), 200, 80);

            // Shelf items (colored boxes representing products)
            for (let j = 0; j < 4; j++) {
                const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
                shelf.fillStyle(colors[j % colors.length], 1);
                shelf.fillRect(60 + (j * 45), 210 + (i * 120), 35, 50);
                shelf.lineStyle(1, 0x000000, 1);
                shelf.strokeRect(60 + (j * 45), 210 + (i * 120), 35, 50);
            }

            this.shopInteriorContainer.add(shelf);
        }

        // Shelves on right side
        for (let i = 0; i < 3; i++) {
            const shelf = this.add.graphics();
            shelf.fillStyle(0x8B4513, 1);
            shelf.fillRect(this.gameWidth - 250, 200 + (i * 120), 200, 80);
            shelf.lineStyle(2, 0x654321, 1);
            shelf.strokeRect(this.gameWidth - 250, 200 + (i * 120), 200, 80);

            // Shelf items
            for (let j = 0; j < 4; j++) {
                const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
                shelf.fillStyle(colors[(j + 2) % colors.length], 1);
                shelf.fillRect(this.gameWidth - 240 + (j * 45), 210 + (i * 120), 35, 50);
                shelf.lineStyle(1, 0x000000, 1);
                shelf.strokeRect(this.gameWidth - 240 + (j * 45), 210 + (i * 120), 35, 50);
            }

            this.shopInteriorContainer.add(shelf);
        }

        // Exit prompt
        this.shopExitPrompt = this.add.text(this.gameWidth / 2, 50, 'Press E or ESC to exit shop', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.shopInteriorContainer.add(this.shopExitPrompt);

        // Shop name label (will be updated when entering)
        this.shopNameLabel = this.add.text(this.gameWidth / 2, 100, '', {
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.shopInteriorContainer.add(this.shopNameLabel);

        // Inventory info panel (top right)
        this.shopStockText = this.add.text(this.gameWidth - 30, 150, '', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'right'
        }).setOrigin(1, 0);
        this.shopInteriorContainer.add(this.shopStockText);

        this.shopEmployeeText = this.add.text(this.gameWidth - 30, 190, '', {
            fontSize: '14px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'right'
        }).setOrigin(1, 0);
        this.shopInteriorContainer.add(this.shopEmployeeText);

        this.shopStatusText = this.add.text(this.gameWidth - 30, 225, '', {
            fontSize: '14px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'right'
        }).setOrigin(1, 0);
        this.shopInteriorContainer.add(this.shopStatusText);

        // Restock button (bottom center)
        this.shopRestockButton = this.add.text(this.gameWidth / 2, this.gameHeight - 80, 'RESTOCK ($500)', {
            fontSize: '18px',
            color: '#FFFFFF',
            backgroundColor: '#2E7D32',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5, 0.5).setInteractive();
        this.shopRestockButton.setScrollFactor(0).setDepth(15001).setVisible(false);

        this.shopRestockButton.on('pointerover', () => {
            this.shopRestockButton.setStyle({ backgroundColor: '#43A047' });
        });
        this.shopRestockButton.on('pointerout', () => {
            this.shopRestockButton.setStyle({ backgroundColor: '#2E7D32' });
        });
        this.shopRestockButton.on('pointerdown', () => {
            this.restockShop();
        });

        // Hire Employee button (bottom center, above restock button)
        this.shopHireButton = this.add.text(this.gameWidth / 2, this.gameHeight - 140, 'HIRE EMPLOYEE ($1000)', {
            fontSize: '18px',
            color: '#FFFFFF',
            backgroundColor: '#1976D2',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5, 0.5).setInteractive();
        this.shopHireButton.setScrollFactor(0).setDepth(15001).setVisible(false);

        this.shopHireButton.on('pointerover', () => {
            this.shopHireButton.setStyle({ backgroundColor: '#2196F3' });
        });
        this.shopHireButton.on('pointerout', () => {
            this.shopHireButton.setStyle({ backgroundColor: '#1976D2' });
        });
        this.shopHireButton.on('pointerdown', () => {
            this.hireEmployee();
        });

        // Employee wage info (bottom center, above restock button)
        this.shopWageText = this.add.text(this.gameWidth / 2, this.gameHeight - 140, '', {
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5, 0.5);
        this.shopWageText.setScrollFactor(0).setDepth(15001).setVisible(false);

        // Restart confirmation UI (container with buttons)
        this.restartConfirmContainer = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
        this.restartConfirmContainer.setScrollFactor(0).setDepth(10000).setVisible(false);

        const restartBg = this.add.rectangle(0, 0, 400, 180, 0xC62828, 1);
        this.restartConfirmContainer.add(restartBg);

        this.restartConfirmUI = this.add.text(0, -40, '', {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.restartConfirmContainer.add(this.restartConfirmUI);

        this.restartConfirmButton = this.add.text(-80, 40, 'CONFIRM', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#D32F2F',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.restartConfirmContainer.add(this.restartConfirmButton);

        this.restartCancelButton = this.add.text(80, 40, 'CANCEL', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#424242',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.restartConfirmContainer.add(this.restartCancelButton);

        this.restartConfirmButton.on('pointerover', () => this.restartConfirmButton.setStyle({ backgroundColor: '#EF5350' }));
        this.restartConfirmButton.on('pointerout', () => this.restartConfirmButton.setStyle({ backgroundColor: '#D32F2F' }));
        this.restartCancelButton.on('pointerover', () => this.restartCancelButton.setStyle({ backgroundColor: '#616161' }));
        this.restartCancelButton.on('pointerout', () => this.restartCancelButton.setStyle({ backgroundColor: '#424242' }));

        this.restartConfirmButton.on('pointerdown', () => {
            this.resetGame();
        });

        this.restartCancelButton.on('pointerdown', () => {
            this.restartConfirmShowing = false;
            this.restartConfirmContainer.setVisible(false);
        });

        this.restartConfirmShowing = false;

        // Delete confirmation UI (container with buttons)
        this.deleteConfirmContainer = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
        this.deleteConfirmContainer.setScrollFactor(0).setDepth(10000).setVisible(false);

        const deleteBg = this.add.rectangle(0, 0, 400, 180, 0xFF5722, 1);
        this.deleteConfirmContainer.add(deleteBg);

        this.deleteConfirmUI = this.add.text(0, -40, '', {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.deleteConfirmContainer.add(this.deleteConfirmUI);

        this.deleteConfirmButton = this.add.text(-80, 40, 'DELETE', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#D32F2F',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.deleteConfirmContainer.add(this.deleteConfirmButton);

        this.deleteCancelButton = this.add.text(80, 40, 'CANCEL', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#424242',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.deleteConfirmContainer.add(this.deleteCancelButton);

        this.deleteConfirmButton.on('pointerover', () => this.deleteConfirmButton.setStyle({ backgroundColor: '#EF5350' }));
        this.deleteConfirmButton.on('pointerout', () => this.deleteConfirmButton.setStyle({ backgroundColor: '#D32F2F' }));
        this.deleteCancelButton.on('pointerover', () => this.deleteCancelButton.setStyle({ backgroundColor: '#616161' }));
        this.deleteCancelButton.on('pointerout', () => this.deleteCancelButton.setStyle({ backgroundColor: '#424242' }));

        this.deleteConfirmButton.on('pointerdown', () => {
            if (this.buildingToDelete) {
                this.deleteBuilding(this.buildingToDelete);
                this.buildingToDelete = null;
            }
            this.deleteConfirmShowing = false;
            this.deleteConfirmContainer.setVisible(false);
        });

        this.deleteCancelButton.on('pointerdown', () => {
            this.deleteConfirmShowing = false;
            this.deleteConfirmContainer.setVisible(false);
            this.buildingToDelete = null;
        });

        this.deleteConfirmShowing = false;
        this.buildingToDelete = null;

        // District travel UI (container with buttons)
        this.districtTravelContainer = this.add.container(this.gameWidth / 2, this.gameHeight / 2);
        this.districtTravelContainer.setScrollFactor(0).setDepth(10000).setVisible(false);

        const travelBg = this.add.rectangle(0, 0, 500, 280, 0x1976D2, 1);
        this.districtTravelContainer.add(travelBg);

        this.districtTravelUI = this.add.text(0, -100, '🚌 FAST TRAVEL 🚌\nClick a district to travel:', {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.districtTravelContainer.add(this.districtTravelUI);

        // Residential button
        this.residentialButton = this.add.text(0, -40, '🏠 Residential District', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#FF6B6B',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        this.districtTravelContainer.add(this.residentialButton);

        // Downtown button
        this.downtownButton = this.add.text(0, 10, '🏢 Downtown', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#4ECDC4',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        this.districtTravelContainer.add(this.downtownButton);

        // Industrial button
        this.industrialButton = this.add.text(0, 60, '🏭 Industrial District', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#8D6E63',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        this.districtTravelContainer.add(this.industrialButton);

        // Close button
        this.travelCloseButton = this.add.text(0, 110, 'CLOSE', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#424242',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();
        this.districtTravelContainer.add(this.travelCloseButton);

        // Add hover effects
        [this.residentialButton, this.downtownButton, this.industrialButton].forEach(btn => {
            const originalBg = btn.style.backgroundColor;
            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#FFD700', color: '#000000' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: originalBg, color: '#ffffff' }));
        });

        this.travelCloseButton.on('pointerover', () => this.travelCloseButton.setStyle({ backgroundColor: '#616161' }));
        this.travelCloseButton.on('pointerout', () => this.travelCloseButton.setStyle({ backgroundColor: '#424242' }));

        // Add click handlers
        this.residentialButton.on('pointerdown', () => {
            console.log('Teleporting to Residential District at', this.districts.residential.centerX);
            this.player.x = this.districts.residential.centerX;
            this.player.body.x = this.districts.residential.centerX;
            this.playerVisual.x = this.player.x;
            this.cameras.main.scrollX = this.player.x - this.gameWidth / 2;
            this.districtTravelMenuOpen = false;
            this.districtTravelContainer.setVisible(false);
        });

        this.downtownButton.on('pointerdown', () => {
            console.log('Teleporting to Downtown at', this.districts.downtown.centerX);
            this.player.x = this.districts.downtown.centerX;
            this.player.body.x = this.districts.downtown.centerX;
            this.playerVisual.x = this.player.x;
            this.cameras.main.scrollX = this.player.x - this.gameWidth / 2;
            this.districtTravelMenuOpen = false;
            this.districtTravelContainer.setVisible(false);
        });

        this.industrialButton.on('pointerdown', () => {
            console.log('Teleporting to Industrial District at', this.districts.industrial.centerX);
            this.player.x = this.districts.industrial.centerX;
            this.player.body.x = this.districts.industrial.centerX;
            this.playerVisual.x = this.player.x;
            this.cameras.main.scrollX = this.player.x - this.gameWidth / 2;
            this.districtTravelMenuOpen = false;
            this.districtTravelContainer.setVisible(false);
        });

        this.travelCloseButton.on('pointerdown', () => {
            this.districtTravelMenuOpen = false;
            this.districtTravelContainer.setVisible(false);
        });

        // Pause UI
        this.pauseUI = this.add.text(this.gameWidth / 2, this.gameHeight / 2, '', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
        this.pauseUI.setVisible(false);

        // Spawn initial buses
        this.spawnBuses();

        // Spawn initial citizens
        this.spawnCitizens();

        // Load saved game if exists
        this.loadGame();

        // Debug: Check localStorage on startup
        console.log('=== GAME STARTUP DEBUG ===');
        const savedData = localStorage.getItem('mainstreetmayor_save');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log('Save data exists:', parsed);
            console.log('Buildings in save:', parsed.buildings);
        } else {
            console.log('No save data found in localStorage');
        }
        console.log('Buildings loaded into game:', this.buildings.length);
        console.log('=== END DEBUG ===');
    }

    isShop(buildingType) {
        return ['clothingShop', 'electronicsShop', 'groceryStore', 'bookstore'].includes(buildingType);
    }

    handleResize(gameSize) {
        const newWidth = gameSize.width;
        const newHeight = gameSize.height;

        // Update stored dimensions
        const oldHeight = this.gameHeight;
        this.gameHeight = newHeight;
        this.gameWidth = newWidth;

        // Update world bounds
        this.physics.world.setBounds(0, 0, 12000, this.gameHeight);

        // Update camera bounds
        this.cameras.main.setBounds(0, 0, 12000, this.gameHeight);

        // Calculate new ground position
        const newGroundY = this.gameHeight - 50;
        const newPlatformY = this.gameHeight - 100;

        // Update ground position
        this.ground.y = newGroundY;
        this.groundY = newGroundY;

        // Update platform position
        this.groundPlatformBody.y = newPlatformY;
        this.platformY = newPlatformY;
        this.groundPlatformBody.body.reset(1500, newPlatformY);

        // Reposition all buildings
        for (let building of this.buildings) {
            const buildingType = this.buildingTypes[building.type];
            const newBuildingY = this.gameHeight - 100;

            // Clear and redraw building
            building.graphics.clear();
            building.graphics.fillStyle(buildingType.color, 1);
            building.graphics.fillRect(
                building.x - buildingType.width/2,
                newBuildingY - buildingType.height,
                buildingType.width,
                buildingType.height
            );
            building.graphics.lineStyle(3, 0x000000, 1);
            building.graphics.strokeRect(
                building.x - buildingType.width/2,
                newBuildingY - buildingType.height,
                buildingType.width,
                buildingType.height
            );

            // Redraw building details
            this.drawBuildingDetails(building.graphics, building.type, building.x, newBuildingY);

            // Update label position
            building.label.y = newBuildingY - buildingType.height - 55;

            // Update building Y coordinate
            building.y = newBuildingY;
        }

        // Keep player above ground
        if (this.player.y > newPlatformY - 50) {
            this.player.y = newPlatformY - 50;
            this.playerVisual.y = this.player.y;
        }

        // Update background layers
        if (this.skyGraphics) {
            this.updateSky(); // Use dynamic sky based on time of day
        }

        // Redraw mountains at new height
        if (this.mountainGraphics) {
            this.mountainGraphics.clear();
            for (let i = 0; i < 8; i++) {
                const baseX = i * 500 - 200;
                const peakHeight = 150 + Math.random() * 100;
                const baseY = this.gameHeight - 100;

                this.mountainGraphics.fillStyle(0x8B7355, 1);
                this.mountainGraphics.beginPath();
                this.mountainGraphics.moveTo(baseX, baseY);
                this.mountainGraphics.lineTo(baseX + 250, baseY - peakHeight);
                this.mountainGraphics.lineTo(baseX + 500, baseY);
                this.mountainGraphics.closePath();
                this.mountainGraphics.fillPath();

                if (peakHeight > 200) {
                    this.mountainGraphics.fillStyle(0xFFFFFF, 0.8);
                    this.mountainGraphics.beginPath();
                    this.mountainGraphics.moveTo(baseX + 200, baseY - peakHeight + 30);
                    this.mountainGraphics.lineTo(baseX + 250, baseY - peakHeight);
                    this.mountainGraphics.lineTo(baseX + 300, baseY - peakHeight + 30);
                    this.mountainGraphics.closePath();
                    this.mountainGraphics.fillPath();
                }
            }
        }

        // Redraw distant city at new height
        if (this.cityGraphics) {
            this.cityGraphics.clear();
            for (let i = 0; i < 15; i++) {
                const x = i * 250 + Math.random() * 100;
                const buildingWidth = 60 + Math.random() * 80;
                const buildingHeight = 100 + Math.random() * 150;
                const baseY = this.gameHeight - 100;

                this.cityGraphics.fillStyle(0x4A5568, 0.6);
                this.cityGraphics.fillRect(x, baseY - buildingHeight, buildingWidth, buildingHeight);

                const windowRows = Math.floor(buildingHeight / 20);
                const windowCols = Math.floor(buildingWidth / 15);

                for (let row = 0; row < windowRows; row++) {
                    for (let col = 0; col < windowCols; col++) {
                        if (Math.random() > 0.3) {
                            this.cityGraphics.fillStyle(0xFFE66D, 0.7);
                            this.cityGraphics.fillRect(
                                x + col * 15 + 5,
                                baseY - buildingHeight + row * 20 + 8,
                                8,
                                10
                            );
                        }
                    }
                }
            }
        }

        // Update UI positions (time display, resource display, etc.)
        if (this.timeUI) {
            this.timeUI.x = this.gameWidth - 300;
        }
        if (this.settingsButton) {
            this.settingsButton.x = this.gameWidth - 130;
        }
        if (this.settingsDropdown) {
            this.settingsDropdown.x = this.gameWidth - 200;
        }
        if (this.buildMenuContainer) {
            this.buildMenuContainer.setPosition(this.gameWidth / 2, this.gameHeight - 80);
        }
        if (this.demolishUI) {
            this.demolishUI.setPosition(this.gameWidth / 2, this.gameHeight - 60);
        }
        if (this.bankUI) {
            this.bankUI.setPosition(this.gameWidth / 2 - 200, this.gameHeight / 2 - 100);
        }
        if (this.resourceBuildingUI) {
            this.resourceBuildingUI.setPosition(this.gameWidth / 2 - 200, this.gameHeight / 2 - 100);
        }
        if (this.restartConfirmContainer) {
            this.restartConfirmContainer.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        }
        if (this.buildConfirmContainer) {
            this.buildConfirmContainer.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        }
        if (this.districtTravelContainer) {
            this.districtTravelContainer.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        }
        if (this.deleteConfirmContainer) {
            this.deleteConfirmContainer.setPosition(this.gameWidth / 2, this.gameHeight / 2);
        }

        // Update shop interior UI positions
        if (this.shopInteriorContainer) {
            // Update background and interior elements to fill screen
            const interiorBg = this.shopInteriorContainer.list[0]; // First element is background
            if (interiorBg) {
                interiorBg.setPosition(this.gameWidth / 2, this.gameHeight / 2);
                interiorBg.setSize(this.gameWidth, this.gameHeight);
            }

            // Update button positions (they're not in the container, they're direct scene objects)
            if (this.shopRestockButton) {
                this.shopRestockButton.setPosition(this.gameWidth / 2, this.gameHeight - 80);
            }
            if (this.shopHireButton) {
                this.shopHireButton.setPosition(this.gameWidth / 2, this.gameHeight - 140);
            }
            if (this.shopWageText) {
                this.shopWageText.setPosition(this.gameWidth / 2, this.gameHeight - 140);
            }
        }

        console.log(`Resized to ${newWidth}x${newHeight}`);
    }

    createMountains() {
        // Create distant mountains with parallax effect
        this.mountainGraphics = this.add.graphics();
        this.mountainGraphics.setScrollFactor(0.1);
        this.mountainGraphics.setDepth(-80); // Behind city and clouds
        const mountainGraphics = this.mountainGraphics;

        // Multiple mountain peaks across the world
        for (let i = 0; i < 8; i++) {
            const baseX = i * 500 - 200;
            const peakHeight = 150 + Math.random() * 100;
            const baseY = this.gameHeight - 100;

            // Mountain gradient (darker at base, lighter at peak)
            mountainGraphics.fillStyle(0x8B7355, 1);
            mountainGraphics.beginPath();
            mountainGraphics.moveTo(baseX, baseY);
            mountainGraphics.lineTo(baseX + 250, baseY - peakHeight);
            mountainGraphics.lineTo(baseX + 500, baseY);
            mountainGraphics.closePath();
            mountainGraphics.fillPath();

            // Snow cap on taller peaks
            if (peakHeight > 200) {
                mountainGraphics.fillStyle(0xFFFFFF, 0.8);
                mountainGraphics.beginPath();
                mountainGraphics.moveTo(baseX + 200, baseY - peakHeight + 30);
                mountainGraphics.lineTo(baseX + 250, baseY - peakHeight);
                mountainGraphics.lineTo(baseX + 300, baseY - peakHeight + 30);
                mountainGraphics.closePath();
                mountainGraphics.fillPath();
            }
        }
    }

    createDistantCity() {
        // Create distant city skyline
        this.cityGraphics = this.add.graphics();
        this.cityGraphics.setScrollFactor(0.3);
        this.cityGraphics.setDepth(-70); // In front of mountains, behind main street
        const cityGraphics = this.cityGraphics;

        // Generate random buildings in the distance
        for (let i = 0; i < 15; i++) {
            const x = i * 250 + Math.random() * 100;
            const buildingWidth = 60 + Math.random() * 80;
            const buildingHeight = 100 + Math.random() * 150;
            const baseY = this.gameHeight - 100;

            // Building silhouette (darker, semi-transparent)
            cityGraphics.fillStyle(0x4A5568, 0.6);
            cityGraphics.fillRect(x, baseY - buildingHeight, buildingWidth, buildingHeight);

            // Windows (small yellow rectangles)
            const windowRows = Math.floor(buildingHeight / 20);
            const windowCols = Math.floor(buildingWidth / 15);

            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    if (Math.random() > 0.3) { // Not all windows are lit
                        cityGraphics.fillStyle(0xFFE66D, 0.7);
                        cityGraphics.fillRect(
                            x + col * 15 + 5,
                            baseY - buildingHeight + row * 20 + 8,
                            8,
                            10
                        );
                    }
                }
            }
        }
    }

    createClouds() {
        // Create fluffy clouds
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            const cloudContainer = this.add.container(
                Math.random() * 3000,
                50 + Math.random() * (this.gameHeight * 0.3)
            );
            cloudContainer.setScrollFactor(0.15 + Math.random() * 0.1);
            cloudContainer.setDepth(-60); // In front of city, behind main street

            // Create cloud shape with multiple circles
            const cloudGraphics = this.add.graphics();
            cloudGraphics.fillStyle(0xFFFFFF, 0.8);

            // Main cloud body
            cloudGraphics.fillCircle(0, 0, 40);
            cloudGraphics.fillCircle(-30, 5, 35);
            cloudGraphics.fillCircle(30, 5, 35);
            cloudGraphics.fillCircle(-15, -10, 30);
            cloudGraphics.fillCircle(15, -10, 30);

            cloudContainer.add(cloudGraphics);
            this.clouds.push({
                container: cloudContainer,
                speed: 0.02 + Math.random() * 0.03,
                startX: cloudContainer.x
            });
        }
    }

    createStars() {
        // Create twinkling stars (only visible at night)
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            const star = this.add.circle(
                Math.random() * 3000,
                Math.random() * (this.gameHeight * 0.6),
                1 + Math.random() * 1.5,
                0xFFFFFF,
                0.8
            );
            star.setScrollFactor(0.02);
            star.setDepth(-95); // Between sky and sun/moon
            star.setVisible(false); // Hidden during day
            this.stars.push({
                circle: star,
                twinkleSpeed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    updateSky() {
        // Safety check
        if (!this.skyGraphics || this.gameTime === undefined || !this.gameHeight) {
            return;
        }

        // Calculate hour of day
        const totalMinutes = Math.floor(this.gameTime);
        const hour = Math.floor((totalMinutes % (24 * 60)) / 60);

        this.skyGraphics.clear();

        // Day colors (6am-6pm): bright blue
        // Night colors (6pm-6am): dark blue/purple
        let topColor, bottomColor;

        if (hour >= 6 && hour < 20) {
            // Daytime - bright blue sky (6am to 8pm)
            const dayProgress = (hour - 6) / 14; // 0 to 1 during day
            topColor = 0x87CEEB;
            bottomColor = 0xE0F6FF;
        } else {
            // Nighttime - dark sky (8pm to 6am)
            topColor = 0x0A1128; // Very dark blue
            bottomColor = 0x1B2845; // Slightly lighter dark blue
        }

        this.skyGraphics.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
        this.skyGraphics.fillRect(0, 0, 3000, this.gameHeight);
    }

    addWindowLights(buildingData, buildingType) {
        // Create glowing window overlays for nighttime
        buildingData.windowLights = [];
        const x = buildingData.x;
        const y = buildingData.y;

        if (buildingData.type === 'house') {
            // Two-story house - 4 rows of 2 windows
            // Match exact coordinates from drawBuildingDetails
            const spacing = 25;
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 2; col++) {
                    const wx = x - spacing + (col * spacing * 2);
                    const wy = y - buildingType.height + 50 + (row * 50);
                    const light = this.add.rectangle(wx, wy + 12, 20, 25, 0xFFD700, 0.5);
                    light.setDepth(11);
                    light.setVisible(false);
                    buildingData.windowLights.push(light);
                }
            }
        } else if (buildingData.type === 'apartment') {
            // 4 floors, 2 units per floor, 2 windows per unit
            const floorHeight = buildingType.height / 4;
            for (let floor = 0; floor < 4; floor++) {
                for (let unit = 0; unit < 2; unit++) {
                    const unitIndex = floor * 2 + unit;
                    const unitX = x - 50 + (unit * 100);
                    const unitY = y - buildingType.height + (floor * floorHeight) + 35;

                    for (let win = 0; win < 2; win++) {
                        const wx = unitX - 15 + (win * 30);
                        const light = this.add.rectangle(wx, unitY, 18, 20, 0xFFD700, 0.7);
                        light.setDepth(11);
                        light.setVisible(false);
                        light.unitIndex = unitIndex; // Tag with unit index for occupied check
                        buildingData.windowLights.push(light);
                    }
                }
            }
        } else if (buildingData.type === 'hotel') {
            // 5 floors, 2 rooms per floor, 2 windows per room
            const floorHeight = buildingType.height / 5;
            for (let floor = 0; floor < 5; floor++) {
                for (let room = 0; room < 2; room++) {
                    const roomIndex = floor * 2 + room;
                    const roomX = x - 60 + (room * 120);
                    const roomY = y - buildingType.height + (floor * floorHeight) + 40;

                    for (let win = 0; win < 2; win++) {
                        const wx = roomX - 20 + (win * 40);
                        const light = this.add.rectangle(wx, roomY, 20, 22, 0xFFD700, 0.7);
                        light.setDepth(11);
                        light.setVisible(false);
                        light.roomIndex = roomIndex; // Tag with room index for occupied check
                        buildingData.windowLights.push(light);
                    }
                }
            }
        }
    }

    updateCelestialBody() {
        // Calculate time of day (0-24 hours)
        const totalMinutes = Math.floor(this.gameTime);
        const hour = Math.floor((totalMinutes % (24 * 60)) / 60);

        // Clear previous drawing
        this.celestialBody.clear();

        // Position in sky (moves across the sky during day)
        const skyArcProgress = (hour % 24) / 24; // 0 to 1
        const sunX = 300 + skyArcProgress * 2400;
        const sunY = this.gameHeight * 0.2 + Math.sin(skyArcProgress * Math.PI) * -50;

        // Day time (6am to 6pm) - Show sun
        if (hour >= 6 && hour < 18) {
            // Sun
            this.celestialBody.fillStyle(0xFFD700, 1);
            this.celestialBody.fillCircle(sunX, sunY, 40);

            // Sun rays
            this.celestialBody.lineStyle(3, 0xFFE66D, 0.8);
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const rayLength = 60;
                this.celestialBody.lineBetween(
                    sunX + Math.cos(angle) * 45,
                    sunY + Math.sin(angle) * 45,
                    sunX + Math.cos(angle) * rayLength,
                    sunY + Math.sin(angle) * rayLength
                );
            }
        } else {
            // Night time - Show moon
            this.celestialBody.fillStyle(0xE8E8E8, 1);
            this.celestialBody.fillCircle(sunX, sunY, 35);

            // Moon craters
            this.celestialBody.fillStyle(0xD0D0D0, 0.5);
            this.celestialBody.fillCircle(sunX - 10, sunY - 8, 8);
            this.celestialBody.fillCircle(sunX + 12, sunY + 5, 6);
            this.celestialBody.fillCircle(sunX - 5, sunY + 12, 5);
        }
    }

    createStreetFurniture() {
        const groundLevel = this.gameHeight - 100;

        // Place furniture at intervals along the street
        // Avoid building positions (multiples of 240)
        for (let x = 120; x < 12000; x += 240) {
            const furnitureType = Math.floor(Math.random() * 4); // 0-3 for 4 types

            // Randomly skip some positions for variety
            if (Math.random() > 0.6) continue;

            switch(furnitureType) {
                case 0:
                    this.createLampPost(x, groundLevel);
                    break;
                case 1:
                    this.createBench(x, groundLevel);
                    break;
                case 2:
                    this.createTrashCan(x, groundLevel);
                    break;
                case 3:
                    this.createMailbox(x, groundLevel);
                    break;
            }
        }

        // Create bus stops at strategic locations
        this.busStops = [];
        // Place a bus stop every 1500 pixels (about every 6 buildings)
        for (let x = 750; x < 12000; x += 1500) {
            this.createBusStop(x, groundLevel);
            this.busStops.push({ x: x, waitingCitizens: [] });
        }
    }

    createDistrictMarkers() {
        const groundLevel = this.gameHeight - 100;

        // Create a marker for each district at its center
        for (let districtKey in this.districts) {
            const district = this.districts[districtKey];
            const x = district.centerX;

            // Sign post
            const post = this.add.graphics();
            post.setDepth(5);
            post.fillStyle(0x654321, 1);
            post.fillRect(x - 6, groundLevel - 200, 12, 200);

            // Sign board background
            const signBoard = this.add.graphics();
            signBoard.setDepth(5);
            signBoard.fillStyle(district.color, 1);
            signBoard.fillRoundedRect(x - 120, groundLevel - 280, 240, 80, 8);
            signBoard.lineStyle(4, 0x000000, 1);
            signBoard.strokeRoundedRect(x - 120, groundLevel - 280, 240, 80, 8);

            // District name text
            const nameText = this.add.text(x, groundLevel - 260, district.name.toUpperCase(), {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(6);

            // Description text
            const descText = this.add.text(x, groundLevel - 235, district.description, {
                fontSize: '11px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(6);

            // Add ground colored stripe for visual district separation
            const stripe = this.add.rectangle(
                district.startX + (district.endX - district.startX) / 2,
                groundLevel + 10,
                district.endX - district.startX,
                20,
                district.color,
                0.2
            );
            stripe.setDepth(-5);
        }
    }

    createLampPost(x, groundLevel) {
        const lampPost = this.add.graphics();
        lampPost.setDepth(5); // In front of ground, behind buildings

        // Post (dark gray pole)
        lampPost.fillStyle(0x404040, 1);
        lampPost.fillRect(x - 4, groundLevel - 120, 8, 120);

        // Base (wider bottom)
        lampPost.fillStyle(0x303030, 1);
        lampPost.fillRect(x - 8, groundLevel - 10, 16, 10);

        // Light fixture (top)
        lampPost.fillStyle(0x2C3E50, 1);
        lampPost.fillRect(x - 12, groundLevel - 130, 24, 12);

        // Light bulb (glowing) - separate circle for day/night control
        const lightBulb = this.add.circle(x, groundLevel - 124, 8, 0xFFE66D, 0.9);
        lightBulb.setDepth(6);
        lightBulb.setVisible(false); // Off during day

        // Light glow effect - larger circle for night glow
        const lightGlow = this.add.circle(x, groundLevel - 124, 20, 0xFFFFAA, 0.3);
        lightGlow.setDepth(6);
        lightGlow.setVisible(false); // Off during day

        // Store reference for day/night updates
        this.lampPosts.push({
            bulb: lightBulb,
            glow: lightGlow
        });
    }

    createBench(x, groundLevel) {
        const bench = this.add.graphics();
        bench.setDepth(5);

        // Seat (wooden brown)
        bench.fillStyle(0x8B4513, 1);
        bench.fillRect(x - 25, groundLevel - 25, 50, 8);

        // Backrest
        bench.fillStyle(0x8B4513, 1);
        bench.fillRect(x - 25, groundLevel - 50, 50, 8);

        // Vertical slats on backrest
        bench.fillStyle(0x654321, 1);
        for (let i = 0; i < 5; i++) {
            bench.fillRect(x - 20 + (i * 10), groundLevel - 48, 3, 23);
        }

        // Metal legs (dark gray)
        bench.fillStyle(0x505050, 1);
        bench.fillRect(x - 20, groundLevel - 25, 4, 25);
        bench.fillRect(x + 16, groundLevel - 25, 4, 25);

        // Armrests
        bench.fillStyle(0x654321, 1);
        bench.fillRect(x - 28, groundLevel - 35, 6, 10);
        bench.fillRect(x + 22, groundLevel - 35, 6, 10);
    }

    createTrashCan(x, groundLevel) {
        const trashCan = this.add.graphics();
        trashCan.setDepth(5);

        // Can body (green/blue city trash can)
        trashCan.fillStyle(0x2E7D32, 1);
        trashCan.fillRect(x - 12, groundLevel - 35, 24, 35);

        // Lid (darker green)
        trashCan.fillStyle(0x1B5E20, 1);
        trashCan.fillRect(x - 14, groundLevel - 40, 28, 5);

        // Lid handle
        trashCan.fillStyle(0x000000, 1);
        trashCan.fillCircle(x, groundLevel - 37, 3);

        // Recycling symbol (simplified)
        trashCan.lineStyle(2, 0xFFFFFF, 1);
        trashCan.strokeCircle(x, groundLevel - 18, 8);

        // Highlight/shine
        trashCan.fillStyle(0xFFFFFF, 0.3);
        trashCan.fillRect(x - 8, groundLevel - 32, 4, 20);
    }

    createMailbox(x, groundLevel) {
        const mailbox = this.add.graphics();
        mailbox.setDepth(5);

        // Post (brown wooden post)
        mailbox.fillStyle(0x654321, 1);
        mailbox.fillRect(x - 3, groundLevel - 60, 6, 60);

        // Mailbox body (blue USPS style)
        mailbox.fillStyle(0x1976D2, 1);
        mailbox.fillRoundedRect(x - 15, groundLevel - 75, 30, 20, 3);

        // Mailbox flag (red)
        mailbox.fillStyle(0xD32F2F, 1);
        mailbox.fillRect(x + 12, groundLevel - 70, 8, 10);

        // Mail slot (black)
        mailbox.fillStyle(0x000000, 1);
        mailbox.fillRect(x - 10, groundLevel - 68, 20, 3);

        // White stripe on mailbox
        mailbox.fillStyle(0xFFFFFF, 1);
        mailbox.fillRect(x - 12, groundLevel - 67, 24, 2);

        // Track this mailbox for interaction
        this.mailboxes.push({
            graphics: mailbox,
            x: x,
            y: groundLevel,
            hasApplications: false
        });
    }

    createBusStop(x, groundLevel) {
        const busStop = this.add.graphics();
        busStop.setDepth(10.5); // Above buildings (10), but behind citizens (11) and buses (12)

        // Simple pole that goes to ground
        busStop.fillStyle(0x424242, 1);
        busStop.fillRect(x - 2, groundLevel - 110, 4, 110);

        // Bus stop sign (blue circle with bus icon)
        busStop.fillStyle(0x1976D2, 1);
        busStop.fillCircle(x, groundLevel - 120, 20);
        busStop.lineStyle(3, 0xFFFFFF, 1);
        busStop.strokeCircle(x, groundLevel - 120, 20);

        // Simple bus icon (white rectangle)
        busStop.fillStyle(0xFFFFFF, 1);
        busStop.fillRoundedRect(x - 10, groundLevel - 128, 20, 12, 2);
        busStop.fillRect(x - 12, groundLevel - 124, 4, 8); // Front windshield
        busStop.fillCircle(x - 6, groundLevel - 114, 2); // wheel
        busStop.fillCircle(x + 6, groundLevel - 114, 2); // wheel
    }

    spawnBuses() {
        // Spawn 3 buses that travel the full route
        const groundLevel = this.gameHeight - 100;

        // Bus 1 starts at beginning - positioned at ground level
        this.createBus(500, groundLevel - 40, 1);

        // Bus 2 starts at middle
        this.createBus(6000, groundLevel - 40, 1);

        // Bus 3 starts at end
        this.createBus(11000, groundLevel - 40, 1);
    }

    createBus(startX, startY, direction) {
        const bus = this.add.container(startX, startY);
        bus.setDepth(12); // Above buildings (10), below player (100)

        // Bus body (big yellow/orange bus)
        const body = this.add.graphics();
        body.fillStyle(0xFFA726, 1); // Orange
        body.fillRoundedRect(-80, -40, 160, 80, 8);
        body.lineStyle(3, 0xE65100, 1); // Dark orange outline
        body.strokeRoundedRect(-80, -40, 160, 80, 8);
        bus.add(body);

        // Windows (blue tinted)
        const windowColor = 0x81D4FA;
        for (let i = 0; i < 4; i++) {
            const window = this.add.rectangle(-60 + (i * 35), -20, 25, 20, windowColor);
            bus.add(window);
        }

        // Windshield (front)
        const windshield = this.add.rectangle(70, -10, 15, 35, windowColor);
        bus.add(windshield);

        // Wheels
        const wheel1 = this.add.graphics();
        wheel1.fillStyle(0x212121, 1);
        wheel1.fillCircle(-50, 42, 12);
        wheel1.fillStyle(0x424242, 1);
        wheel1.fillCircle(-50, 42, 6);
        bus.add(wheel1);

        const wheel2 = this.add.graphics();
        wheel2.fillStyle(0x212121, 1);
        wheel2.fillCircle(50, 42, 12);
        wheel2.fillStyle(0x424242, 1);
        wheel2.fillCircle(50, 42, 6);
        bus.add(wheel2);

        // Headlights
        const headlight = this.add.circle(78, 20, 5, 0xFFEB3B);
        bus.add(headlight);

        // Door (darker rectangle on side)
        const door = this.add.rectangle(-70, 10, 20, 50, 0xE65100);
        bus.add(door);

        // Store bus data
        this.buses.push({
            container: bus,
            x: startX,
            y: startY,
            direction: direction, // 1 = right, -1 = left
            speed: 100, // pixels per second
            passengers: [],
            currentStopIndex: 0,
            nextStopIndex: 1,
            isAtStop: false,
            stopTimer: 0
        });
    }

    spawnCitizens() {
        // Spawn 20 initial citizens at random locations
        const groundLevel = this.gameHeight - 100;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 12000;
            this.createCitizen(x, groundLevel - 30);
        }
    }

    createCitizen(startX, startY) {
        const citizen = this.add.container(startX, startY);
        citizen.setDepth(11); // Above buildings (10), below buses (12)

        // Randomize citizen appearance
        const skinTones = [0xFFDBAC, 0xF1C27D, 0xE0AC69, 0xC68642, 0x8D5524, 0x5C3317];
        const shirtColors = [0x2196F3, 0xF44336, 0x4CAF50, 0xFF9800, 0x9C27B0, 0x00BCD4, 0xE91E63];
        const pantColors = [0x1565C0, 0x424242, 0x795548, 0x5D4037];

        const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
        const pantColor = pantColors[Math.floor(Math.random() * pantColors.length)];

        // Shadow
        const shadow = this.add.ellipse(0, 28, 20, 6, 0x000000, 0.3);
        citizen.add(shadow);

        // Legs
        const leftLeg = this.add.graphics();
        leftLeg.fillStyle(pantColor, 1);
        leftLeg.fillRoundedRect(-6, 6, 6, 14, 2);
        citizen.add(leftLeg);

        const rightLeg = this.add.graphics();
        rightLeg.fillStyle(pantColor, 1);
        rightLeg.fillRoundedRect(0, 6, 6, 14, 2);
        citizen.add(rightLeg);

        // Shoes
        const leftShoe = this.add.ellipse(-3, 22, 8, 4, 0x000000);
        const rightShoe = this.add.ellipse(3, 22, 8, 4, 0x000000);
        citizen.add(leftShoe);
        citizen.add(rightShoe);

        // Body (shirt)
        const body = this.add.graphics();
        body.fillStyle(shirtColor, 1);
        body.fillRoundedRect(-8, -12, 16, 20, 3);
        citizen.add(body);

        // Arms
        const leftArm = this.add.graphics();
        leftArm.fillStyle(shirtColor, 1);
        leftArm.fillRoundedRect(-12, -6, 4, 10, 2);
        citizen.add(leftArm);

        const rightArm = this.add.graphics();
        rightArm.fillStyle(shirtColor, 1);
        rightArm.fillRoundedRect(8, -6, 4, 10, 2);
        citizen.add(rightArm);

        // Hands
        const leftHand = this.add.circle(-10, 6, 3, skinTone);
        const rightHand = this.add.circle(10, 6, 3, skinTone);
        citizen.add(leftHand);
        citizen.add(rightHand);

        // Neck
        const neck = this.add.rectangle(0, -14, 4, 3, skinTone);
        citizen.add(neck);

        // Head
        const head = this.add.circle(0, -20, 8, skinTone);
        citizen.add(head);

        // Eyes
        const leftEye = this.add.circle(-3, -21, 1.5, 0x000000);
        const rightEye = this.add.circle(3, -21, 1.5, 0x000000);
        citizen.add(leftEye);
        citizen.add(rightEye);

        // Random hair color and style
        const hairColors = [0x000000, 0x3E2723, 0x5D4037, 0xFFD700, 0xF44336];
        const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        const hair = this.add.circle(0, -24, 6, hairColor);
        citizen.add(hair);

        // Store citizen data
        const targetBuilding = this.buildings.length > 0
            ? this.buildings[Math.floor(Math.random() * this.buildings.length)]
            : null;

        this.citizens.push({
            container: citizen,
            x: startX,
            y: startY,
            state: 'walking', // walking, waiting, riding, visiting
            walkSpeed: 30 + Math.random() * 20, // Random walk speed
            direction: Math.random() > 0.5 ? 1 : -1,
            targetBuilding: targetBuilding,
            targetBusStop: null,
            waitTimer: 0,
            visitTimer: 0
        });
    }

    generateRentalApplication(apartmentBuilding, unitIndex) {
        // Random name generation
        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
                           'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
                           'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
                          'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
                          'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'];

        // Random employment
        const jobs = ['Software Engineer', 'Teacher', 'Nurse', 'Accountant', 'Sales Manager', 'Chef',
                     'Graphic Designer', 'Marketing Specialist', 'Mechanic', 'Electrician', 'Dentist',
                     'Pharmacist', 'Police Officer', 'Firefighter', 'Construction Worker', 'Lawyer',
                     'Real Estate Agent', 'Retail Manager', 'Bank Teller', 'Insurance Agent'];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const job = jobs[Math.floor(Math.random() * jobs.length)];

        // Base rent for apartment unit
        const baseRent = this.buildingTypes.apartment.incomePerUnit;

        // Rent offer varies +/- 30% from base
        const rentVariation = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
        const rentOffer = Math.floor(baseRent * rentVariation);

        // Credit score (300-850)
        const creditScore = Math.floor(300 + Math.random() * 550);

        // Employment length (months)
        const employmentLength = Math.floor(6 + Math.random() * 60); // 6 months to 5 years

        return {
            name: `${firstName} ${lastName}`,
            job: job,
            rentOffer: rentOffer,
            creditScore: creditScore,
            employmentLength: employmentLength,
            apartmentBuilding: apartmentBuilding,
            unitIndex: unitIndex
        };
    }

    generateApplicationsForVacantUnit(apartmentBuilding, unitIndex) {
        console.log(`generateApplicationsForVacantUnit called for unit ${unitIndex}, mailboxes:`, this.mailboxes.length);
        // Generate 3-5 applications
        const numApplications = 3 + Math.floor(Math.random() * 3);
        const applications = [];

        for (let i = 0; i < numApplications; i++) {
            applications.push(this.generateRentalApplication(apartmentBuilding, unitIndex));
        }

        // Add to pending applications
        this.pendingApplications.push({
            apartmentBuilding: apartmentBuilding,
            unitIndex: unitIndex,
            applications: applications,
            arrivalTime: Date.now()
        });

        // Flag mailboxes as having applications
        for (let mailbox of this.mailboxes) {
            mailbox.hasApplications = true;
        }

        console.log(`${numApplications} applications received for apartment unit ${unitIndex + 1}`);
    }

    checkTenantRisk(unit) {
        // Check if tenant might skip out on rent based on credit score
        if (!unit.tenant || !unit.rented) return;

        const now = Date.now();
        const timeSinceLastCheck = (now - unit.lastRiskCheck) / 1000 / 60; // minutes

        // Check once per game day (24 game hours)
        if (timeSinceLastCheck < 24 * 60) return;

        unit.lastRiskCheck = now;

        const creditScore = unit.tenant.creditScore;
        let skipChance = 0;

        // Calculate skip chance based on credit score
        if (creditScore >= 750) {
            skipChance = 0.001; // 0.1% chance - very reliable
        } else if (creditScore >= 650) {
            skipChance = 0.01; // 1% chance - mostly reliable
        } else if (creditScore >= 550) {
            skipChance = 0.05; // 5% chance - moderate risk
        } else {
            skipChance = 0.15; // 15% chance - high risk!
        }

        // Roll the dice
        if (Math.random() < skipChance) {
            // Tenant bolted! Lose accumulated income
            console.log(`⚠️ ${unit.tenant.name} skipped out on rent! Lost $${unit.accumulatedIncome}`);

            // Unit becomes vacant
            unit.rented = false;
            unit.tenant = null;
            unit.accumulatedIncome = 0;

            // Generate new applications after a delay
            const building = this.buildings.find(b => b.units && b.units.includes(unit));
            const unitIndex = building.units.indexOf(unit);

            // Wait a bit before new applications arrive (simulate time to clean/list unit)
            setTimeout(() => {
                this.generateApplicationsForVacantUnit(building, unitIndex);
            }, 5000); // 5 seconds delay
        }
    }

    drawBuildingDetails(graphics, type, x, y) {
        const building = this.buildingTypes[type];

        if (type === 'house') {
            // House: Two-story residential with 2x4 symmetrical windows
            const windowColor = 0xFFFF99;
            const windowWidth = 20;
            const windowHeight = 25;
            const spacing = 25;

            // Floor separator line (between stories)
            graphics.lineStyle(3, 0x654321, 1);
            graphics.lineBetween(x - building.width/2, y - building.height/2, x + building.width/2, y - building.height/2);

            // 2 columns, 4 rows of windows (2 per floor)
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 2; col++) {
                    const wx = x - spacing + (col * spacing * 2);
                    const wy = y - building.height + 50 + (row * 50);

                    // Window shadow (depth effect - darker rectangle behind)
                    graphics.fillStyle(0x000000, 0.3);
                    graphics.fillRect(wx - windowWidth/2 + 2, wy + 2, windowWidth, windowHeight);

                    // Window
                    graphics.fillStyle(windowColor, 1);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                    // Window reflection (lighter top half)
                    graphics.fillStyle(0xFFFFFF, 0.3);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                    // Window frame
                    graphics.lineStyle(2, 0x654321, 1);
                    graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                    // Window cross
                    graphics.lineStyle(1, 0x654321, 1);
                    graphics.lineBetween(wx, wy, wx, wy + windowHeight);
                    graphics.lineBetween(wx - windowWidth/2, wy + windowHeight/2, wx + windowWidth/2, wy + windowHeight/2);
                }
            }

            // Door shadow (3D depth)
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillRect(x - 20 + 3, y - 50 + 3, 40, 50);

            // Front door (centered)
            graphics.fillStyle(0x8B4513, 1);
            graphics.fillRect(x - 20, y - 50, 40, 50);
            graphics.lineStyle(2, 0x654321, 1);
            graphics.strokeRect(x - 20, y - 50, 40, 50);

            // Door panels
            graphics.lineStyle(1, 0x654321, 1);
            graphics.strokeRect(x - 15, y - 45, 12, 20);
            graphics.strokeRect(x + 3, y - 45, 12, 20);

            // Doorknob with shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillCircle(x + 13, y - 24, 3);
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillCircle(x + 12, y - 25, 3);
            graphics.fillStyle(0xFFFF99, 0.5);
            graphics.fillCircle(x + 11, y - 26, 1.5);

            // 3D Peaked Roof with angular perspective
            // Dark underside shadow
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillTriangle(
                x - building.width/2 - 10, y - building.height,
                x, y - building.height - 35,
                x + building.width/2 + 10, y - building.height
            );

            // Left side of roof (lighter)
            graphics.fillStyle(0xA0522D, 1);
            graphics.fillTriangle(
                x - building.width/2 - 10, y - building.height,
                x, y - building.height - 35,
                x, y - building.height
            );

            // Right side of roof (darker for 3D effect)
            graphics.fillStyle(0x8B4513, 1);
            graphics.fillTriangle(
                x, y - building.height - 35,
                x + building.width/2 + 10, y - building.height,
                x, y - building.height
            );

            // Roof outline
            graphics.lineStyle(2, 0x654321, 1);
            graphics.strokeTriangle(
                x - building.width/2 - 10, y - building.height,
                x, y - building.height - 35,
                x + building.width/2 + 10, y - building.height
            );

            // Roof ridge line (3D edge)
            graphics.lineStyle(1, 0x000000, 0.5);
            graphics.lineBetween(x, y - building.height, x, y - building.height - 35);

        } else if (type === 'apartment') {
            // Apartment: Four-story building with 2 units per floor (8 units total)
            const windowColor = 0xFFFF99;
            const windowWidth = 18;
            const windowHeight = 20;
            const floorHeight = building.height / 4; // 90px per floor

            // Draw floor separator lines
            graphics.lineStyle(2, 0x654321, 1);
            for (let floor = 1; floor < 4; floor++) {
                const floorY = y - (floor * floorHeight);
                graphics.lineBetween(x - building.width/2, floorY, x + building.width/2, floorY);
            }

            // Draw units (2 per floor, 4 floors = 8 units)
            for (let floor = 0; floor < 4; floor++) {
                for (let unit = 0; unit < 2; unit++) {
                    const unitX = x - 50 + (unit * 100); // Left or right unit
                    const unitY = y - building.height + (floor * floorHeight) + 20;
                    const unitIndex = floor * 2 + unit; // Calculate unit index (0-7)

                    // Windows for each unit (2 windows)
                    for (let win = 0; win < 2; win++) {
                        const wx = unitX - 15 + (win * 30);
                        const wy = unitY + 15;

                        // Window shadow
                        graphics.fillStyle(0x000000, 0.3);
                        graphics.fillRect(wx - windowWidth/2 + 1, wy + 1, windowWidth, windowHeight);

                        // Window
                        graphics.fillStyle(windowColor, 1);
                        graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                        // Window reflection
                        graphics.fillStyle(0xFFFFFF, 0.3);
                        graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                        // Window frame
                        graphics.lineStyle(1, 0x654321, 1);
                        graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);
                    }
                    // Note: VACANT signs are added dynamically as text in the update loop
                }
            }

            // Main entrance - Double glass doors on first floor (centered)
            const entranceWidth = 50;
            const entranceHeight = 70;
            const entranceY = y - entranceHeight;

            // Door frame shadow
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, entranceWidth, entranceHeight);

            // Door frame
            graphics.fillStyle(0x654321, 1);
            graphics.fillRect(x - entranceWidth/2, entranceY, entranceWidth, entranceHeight);

            // Left glass door
            graphics.fillStyle(0x87CEEB, 0.7);
            graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, (entranceWidth/2) - 5, entranceHeight - 6);

            // Right glass door
            graphics.fillRect(x + 2, entranceY + 3, (entranceWidth/2) - 5, entranceHeight - 6);

            // Glass reflection
            graphics.fillStyle(0xFFFFFF, 0.3);
            graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, (entranceWidth/2) - 5, (entranceHeight - 6)/2);
            graphics.fillRect(x + 2, entranceY + 3, (entranceWidth/2) - 5, (entranceHeight - 6)/2);

            // Door divider (between double doors)
            graphics.fillStyle(0x654321, 1);
            graphics.fillRect(x - 2, entranceY, 4, entranceHeight);

            // Door handles (gold)
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillCircle(x - 10, entranceY + entranceHeight/2, 3);
            graphics.fillCircle(x + 10, entranceY + entranceHeight/2, 3);

            // Flat roof
            graphics.fillStyle(0x696969, 1);
            graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);

        } else if (type === 'hotel') {
            // Hotel: Five-story building with 2 rooms per floor (10 rooms total)
            const windowColor = 0xFFFF99;
            const windowWidth = 20;
            const windowHeight = 22;
            const floorHeight = building.height / 5; // 80px per floor

            // Draw floor separator lines
            graphics.lineStyle(2, 0x654321, 1);
            for (let floor = 1; floor < 5; floor++) {
                const floorY = y - (floor * floorHeight);
                graphics.lineBetween(x - building.width/2, floorY, x + building.width/2, floorY);
            }

            // Draw rooms (2 per floor, 5 floors = 10 rooms)
            for (let floor = 0; floor < 5; floor++) {
                for (let room = 0; room < 2; room++) {
                    const roomX = x - 60 + (room * 120); // Left or right room
                    const roomY = y - building.height + (floor * floorHeight) + 25;
                    const roomIndex = floor * 2 + room; // Calculate room index (0-9)

                    // Windows for each room (2 windows)
                    for (let win = 0; win < 2; win++) {
                        const wx = roomX - 20 + (win * 40);
                        const wy = roomY + 15;

                        // Window shadow
                        graphics.fillStyle(0x000000, 0.3);
                        graphics.fillRect(wx - windowWidth/2 + 1, wy + 1, windowWidth, windowHeight);

                        // Window
                        graphics.fillStyle(windowColor, 1);
                        graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                        // Window reflection
                        graphics.fillStyle(0xFFFFFF, 0.3);
                        graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                        // Window frame
                        graphics.lineStyle(1, 0x654321, 1);
                        graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);
                    }
                    // Note: DIRTY signs are added dynamically as text in the update loop
                }
            }

            // Main entrance - Large revolving door on first floor (centered)
            const entranceWidth = 60;
            const entranceHeight = 75;
            const entranceY = y - entranceHeight;

            // Door frame shadow
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, entranceWidth, entranceHeight);

            // Door frame (gold)
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillRect(x - entranceWidth/2, entranceY, entranceWidth, entranceHeight);

            // Glass revolving door
            graphics.fillStyle(0x87CEEB, 0.6);
            graphics.fillRect(x - entranceWidth/2 + 5, entranceY + 5, entranceWidth - 10, entranceHeight - 10);

            // Glass reflection
            graphics.fillStyle(0xFFFFFF, 0.4);
            graphics.fillRect(x - entranceWidth/2 + 5, entranceY + 5, entranceWidth - 10, (entranceHeight - 10)/2);

            // Revolving door dividers (cross pattern)
            graphics.fillStyle(0xC0C0C0, 1);
            graphics.fillRect(x - 2, entranceY + 5, 4, entranceHeight - 10); // Vertical
            graphics.fillRect(x - entranceWidth/2 + 5, entranceY + entranceHeight/2 - 2, entranceWidth - 10, 4); // Horizontal

            // Hotel sign above entrance
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillRect(x - 40, y - building.height + 10, 80, 20);
            graphics.lineStyle(2, 0x654321, 1);
            graphics.strokeRect(x - 40, y - building.height + 10, 80, 20);

            // Flat roof with decorative trim
            graphics.fillStyle(0x696969, 1);
            graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);

        } else if (this.isShop(type)) {
            // Shop: Commercial with large display windows
            const windowColor = 0x87CEEB;

            // Large storefront window shadow (depth)
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(x - 60 + 3, y - 120 + 3, 120, 60);

            // Large storefront window (centered)
            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(x - 60, y - 120, 120, 60);

            // Window reflection
            graphics.fillStyle(0xFFFFFF, 0.2);
            graphics.fillRect(x - 60, y - 120, 120, 30);

            graphics.lineStyle(3, 0x000000, 1);
            graphics.strokeRect(x - 60, y - 120, 120, 60);

            // Window panes
            graphics.lineStyle(2, 0x000000, 1);
            graphics.lineBetween(x - 60, y - 90, x + 60, y - 90);
            graphics.lineBetween(x - 30, y - 120, x - 30, y - 60);
            graphics.lineBetween(x + 30, y - 120, x + 30, y - 60);

            // Upper floor windows (2 windows, symmetrical)
            for (let col = 0; col < 2; col++) {
                const wx = x - 35 + (col * 70);
                const wy = y - building.height + 30;

                // Window shadow
                graphics.fillStyle(0x000000, 0.3);
                graphics.fillRect(wx - 15 + 2, wy + 2, 30, 35);

                graphics.fillStyle(windowColor, 1);
                graphics.fillRect(wx - 15, wy, 30, 35);

                // Window reflection
                graphics.fillStyle(0xFFFFFF, 0.2);
                graphics.fillRect(wx - 15, wy, 30, 17);

                graphics.lineStyle(2, 0x000000, 1);
                graphics.strokeRect(wx - 15, wy, 30, 35);
                graphics.lineBetween(wx, wy, wx, wy + 35);
            }

            // 3D Angular Awning with perspective
            // Awning shadow underneath
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(x - 70, y - 120, 140, 8);

            // Awning top (flat part)
            graphics.fillStyle(0xFF6347, 1);
            graphics.fillRect(x - 70, y - 130, 140, 10);

            // Awning front face (3D perspective - angled)
            graphics.fillStyle(0xDC143C, 1);
            graphics.beginPath();
            graphics.moveTo(x - 70, y - 120);
            graphics.lineTo(x + 70, y - 120);
            graphics.lineTo(x + 65, y - 115);
            graphics.lineTo(x - 65, y - 115);
            graphics.closePath();
            graphics.fillPath();

            // Awning stripes on top
            graphics.lineStyle(2, 0x8B0000, 1);
            for (let i = 0; i < 7; i++) {
                graphics.lineBetween(x - 70 + (i * 23), y - 130, x - 70 + (i * 23), y - 120);
            }

            // Awning edge outline
            graphics.lineStyle(2, 0x8B0000, 1);
            graphics.strokeRect(x - 70, y - 130, 140, 10);

            // Door shadow
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillRect(x - 20 + 3, y - 55 + 3, 40, 55);

            // Door (centered)
            graphics.fillStyle(0x654321, 1);
            graphics.fillRect(x - 20, y - 55, 40, 55);
            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(x - 20, y - 55, 40, 55);

            // Door handle with shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillCircle(x + 11, y - 27, 4);
            graphics.fillStyle(0xC0C0C0, 1);
            graphics.fillCircle(x + 10, y - 28, 4);
            graphics.fillStyle(0xFFFFFF, 0.6);
            graphics.fillCircle(x + 9, y - 29, 2);

            // 3D Flat roof with angular trim
            // Roof shadow
            graphics.fillStyle(0x000000, 0.2);
            graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);

            // Roof main
            graphics.fillStyle(0x696969, 1);
            graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);

            // Roof edge (3D perspective)
            graphics.fillStyle(0x505050, 1);
            graphics.beginPath();
            graphics.moveTo(x - building.width/2 - 5, y - building.height);
            graphics.lineTo(x + building.width/2 + 5, y - building.height);
            graphics.lineTo(x + building.width/2 + 10, y - building.height - 5);
            graphics.lineTo(x - building.width/2 - 10, y - building.height - 5);
            graphics.closePath();
            graphics.fillPath();

        } else if (type === 'restaurant') {
            // Restaurant: Fancy with arched windows
            const windowColor = 0xFFF8DC;

            // 3 arched windows on upper floor (symmetrical)
            for (let col = 0; col < 3; col++) {
                const wx = x - 50 + (col * 50);
                const wy = y - building.height + 40;

                // Window shadow (depth)
                graphics.fillStyle(0x000000, 0.3);
                graphics.fillRect(wx - 15 + 2, wy + 2, 30, 40);
                graphics.fillCircle(wx + 2, wy + 2, 15);

                // Window rectangle
                graphics.fillStyle(windowColor, 1);
                graphics.fillRect(wx - 15, wy, 30, 40);

                // Arched top
                graphics.fillCircle(wx, wy, 15);

                // Window reflection
                graphics.fillStyle(0xFFFFFF, 0.25);
                graphics.fillRect(wx - 15, wy, 30, 20);
                graphics.fillCircle(wx, wy, 7);

                // Frame
                graphics.lineStyle(2, 0x8B4513, 1);
                graphics.strokeRect(wx - 15, wy, 30, 40);
                graphics.strokeCircle(wx, wy, 15);
            }

            // Large entrance shadow (3D depth)
            graphics.fillStyle(0x000000, 0.4);
            graphics.fillRect(x - 30 + 4, y - 70 + 4, 60, 70);

            // Large entrance (centered)
            graphics.fillStyle(0x8B4513, 1);
            graphics.fillRect(x - 30, y - 70, 60, 70);
            graphics.lineStyle(3, 0x654321, 1);
            graphics.strokeRect(x - 30, y - 70, 60, 70);

            // Double doors
            graphics.lineStyle(2, 0x654321, 1);
            graphics.lineBetween(x, y - 70, x, y);
            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(x - 20, y - 60, 15, 30);
            graphics.fillRect(x + 5, y - 60, 15, 30);

            // Door glass reflection
            graphics.fillStyle(0xFFFFFF, 0.3);
            graphics.fillRect(x - 20, y - 60, 15, 15);
            graphics.fillRect(x + 5, y - 60, 15, 15);

            // Door handles with shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillCircle(x - 7, y - 34, 3);
            graphics.fillCircle(x + 9, y - 34, 3);
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillCircle(x - 8, y - 35, 3);
            graphics.fillCircle(x + 8, y - 35, 3);
            graphics.fillStyle(0xFFFF99, 0.5);
            graphics.fillCircle(x - 9, y - 36, 1.5);
            graphics.fillCircle(x + 7, y - 36, 1.5);

            // 3D Restaurant sign/awning between windows and doors
            // Sign shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(x - 65 + 2, y - 105 + 2, 130, 20);

            // Sign main
            graphics.fillStyle(0x8B0000, 1);
            graphics.fillRect(x - 65, y - 105, 130, 20);

            // Sign 3D edge (bottom perspective)
            graphics.fillStyle(0x660000, 1);
            graphics.beginPath();
            graphics.moveTo(x - 65, y - 85);
            graphics.lineTo(x + 65, y - 85);
            graphics.lineTo(x + 63, y - 80);
            graphics.lineTo(x - 63, y - 80);
            graphics.closePath();
            graphics.fillPath();

            // Sign outline
            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(x - 65, y - 105, 130, 20);

            // 3D Decorative peaked roof with angular perspective
            // Roof shadow base
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillTriangle(
                x - building.width/2 - 8, y - building.height,
                x, y - building.height - 30,
                x + building.width/2 + 8, y - building.height
            );

            // Left side of roof (lighter)
            graphics.fillStyle(0xA0522D, 1);
            graphics.fillTriangle(
                x - building.width/2 - 8, y - building.height,
                x, y - building.height - 30,
                x, y - building.height
            );

            // Right side of roof (darker for 3D effect)
            graphics.fillStyle(0x8B4513, 1);
            graphics.fillTriangle(
                x, y - building.height - 30,
                x + building.width/2 + 8, y - building.height,
                x, y - building.height
            );

            // Roof outline
            graphics.lineStyle(2, 0x654321, 1);
            graphics.strokeTriangle(
                x - building.width/2 - 8, y - building.height,
                x, y - building.height - 30,
                x + building.width/2 + 8, y - building.height
            );

            // Roof ridge line (3D edge)
            graphics.lineStyle(1, 0x000000, 0.5);
            graphics.lineBetween(x, y - building.height, x, y - building.height - 30);

            // Decorative roof trim (3D angular eaves)
            graphics.fillStyle(0x654321, 1);
            graphics.beginPath();
            graphics.moveTo(x - building.width/2 - 8, y - building.height);
            graphics.lineTo(x - building.width/2 - 15, y - building.height + 5);
            graphics.lineTo(x + building.width/2 + 15, y - building.height + 5);
            graphics.lineTo(x + building.width/2 + 8, y - building.height);
            graphics.closePath();
            graphics.fillPath();
        }
    }

    updateBuildingButtonStates() {
        // Update all building buttons to show which one is selected
        for (let buildingType in this.buildingButtons) {
            const btnData = this.buildingButtons[buildingType];
            if (buildingType === this.selectedBuilding) {
                btnData.button.setStyle({ backgroundColor: '#00FF00', color: '#000000' });
            } else {
                btnData.button.setStyle({ backgroundColor: btnData.originalColor, color: '#ffffff' });
            }
        }

        // Update build menu title
        if (this.selectedBuilding) {
            const buildingType = this.buildingTypes[this.selectedBuilding];
            const suggestedDistrict = buildingType ? this.districts[buildingType.district].name : '';
            this.buildMenuTitle.setText(`${buildingType.name} selected\nSuggested: ${suggestedDistrict} (20% bonus!)\nClick on the map to place`);
        } else {
            this.buildMenuTitle.setText('SELECT A BUILDING TO PLACE');
        }
    }

    update() {
        // Update game time based on real time passed and speed multiplier (only if not paused)
        const now = Date.now();
        if (!this.isPaused) {
            const realTimePassed = (now - this.lastRealTime) / 1000; // seconds
            const gameTimePassed = realTimePassed * this.timeSpeed * 15; // Game minutes (1 real second = 15 game minutes at 1x speed)
            this.gameTime += gameTimePassed;
        }
        this.lastRealTime = now;

        // Calculate day, hour, minute
        const totalMinutes = Math.floor(this.gameTime);
        const day = Math.floor(totalMinutes / (24 * 60)) + 1;
        const hour = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minute = totalMinutes % 60;

        // Update time UI
        const timeString = `Day ${day} - ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const speedIndicator = this.timeSpeed === 1 ? '▶' : this.timeSpeed === 2 ? '▶▶' : '▶▶▶';
        this.timeUI.setText(`⏰ ${timeString} ${speedIndicator}`);

        // Update sky color based on time of day
        this.updateSky();

        // Update celestial body (sun/moon) position
        this.updateCelestialBody();

        // Update stars visibility and twinkling
        const isNight = hour < 6 || hour >= 20; // Night is 8pm to 6am
        if (this.stars) {
            for (let star of this.stars) {
                star.circle.setVisible(isNight);
                if (isNight) {
                    // Twinkling effect
                    star.phase += star.twinkleSpeed * 0.05;
                    const alpha = 0.5 + Math.sin(star.phase) * 0.3;
                    star.circle.setAlpha(alpha);
                }
            }
        }

        // Update building window lights based on time and occupancy
        for (let building of this.buildings) {
            if (building.windowLights) {
                if (building.type === 'house') {
                    // Houses: all windows lit at night
                    for (let light of building.windowLights) {
                        light.setVisible(isNight);
                    }
                } else if (building.type === 'apartment') {
                    // Apartments: only lit if unit is occupied (rented)
                    for (let light of building.windowLights) {
                        const unitIndex = light.unitIndex;
                        const windowsPerUnit = 2;
                        const actualUnitIndex = Math.floor(building.windowLights.indexOf(light) / windowsPerUnit);
                        const isOccupied = building.units && building.units[actualUnitIndex] && building.units[actualUnitIndex].rented;
                        light.setVisible(isNight && isOccupied);
                    }
                } else if (building.type === 'hotel') {
                    // Hotel: only lit if room is occupied
                    for (let light of building.windowLights) {
                        const windowsPerRoom = 2;
                        const roomIndex = Math.floor(building.windowLights.indexOf(light) / windowsPerRoom);
                        const isOccupied = building.rooms && building.rooms[roomIndex] && building.rooms[roomIndex].status === 'occupied';
                        light.setVisible(isNight && isOccupied);
                    }
                }
            }
        }

        // Update street lamp lights
        if (this.lampPosts) {
            for (let lamp of this.lampPosts) {
                lamp.bulb.setVisible(isNight);
                lamp.glow.setVisible(isNight);
            }
        }

        // Animate clouds slowly drifting
        if (this.clouds) {
            for (let cloud of this.clouds) {
                cloud.container.x += cloud.speed;
                // Wrap around when cloud goes off screen
                if (cloud.container.x > 3000 + 100) {
                    cloud.container.x = -100;
                }
            }
        }

        // Time speed and creative mode are now controlled via settings menu (mouse clicks)

        // Update income accumulation and resource regeneration for all buildings
        for (let building of this.buildings) {
            const buildingType = this.buildingTypes[building.type];

            // Income accumulation for houses, shops, restaurants
            if (buildingType && buildingType.incomeRate) {
                // Calculate time elapsed in minutes (adjusted for time speed)
                const elapsedMinutes = ((now - building.lastIncomeTime) / 60000) * this.timeSpeed;
                const bonus = building.districtBonus || 1.0;
                const incomeToAdd = elapsedMinutes * buildingType.incomeRate * bonus;

                building.accumulatedIncome = Math.min(
                    building.accumulatedIncome + incomeToAdd,
                    buildingType.maxIncome * bonus
                );
                building.lastIncomeTime = now;

                // Show $ indicator if income is ready to collect (> $5)
                if (building.accumulatedIncome >= 5) {
                    if (!building.incomeIndicator) {
                        building.incomeIndicator = this.add.text(building.x, building.y - buildingType.height - 80, '💰', {
                            fontSize: '24px'
                        }).setOrigin(0.5);
                    } else {
                        building.incomeIndicator.setVisible(true);
                    }
                } else {
                    if (building.incomeIndicator) {
                        building.incomeIndicator.setVisible(false);
                    }
                }
            }

            // Resource regeneration for lumber mills and brick factories
            if (buildingType && buildingType.resourceType) {
                // Calculate time elapsed in minutes (adjusted for time speed)
                const elapsedMinutes = ((now - building.lastResourceTime) / 60000) * this.timeSpeed;
                const resourcesToAdd = elapsedMinutes * buildingType.regenRate;

                building.storedResources = Math.min(
                    building.storedResources + resourcesToAdd,
                    buildingType.maxStorage
                );
                building.lastResourceTime = now;

                // Show resource indicator if resources are available (>= 1)
                if (building.storedResources >= 1) {
                    const icon = buildingType.resourceType === 'wood' ? '🪵' : '🧱';
                    if (!building.resourceIndicator) {
                        building.resourceIndicator = this.add.text(building.x, building.y - buildingType.height - 80, icon, {
                            fontSize: '24px'
                        }).setOrigin(0.5);
                    } else {
                        building.resourceIndicator.setVisible(true);
                    }
                } else {
                    if (building.resourceIndicator) {
                        building.resourceIndicator.setVisible(false);
                    }
                }
            }

            // Apartment unit income generation and tenant risk checking
            if (building.type === 'apartment' && building.units) {
                const apartmentType = this.buildingTypes.apartment;
                const floorHeight = buildingType.height / 4; // 90px per floor

                for (let unitIndex = 0; unitIndex < building.units.length; unitIndex++) {
                    const unit = building.units[unitIndex];
                    const floor = Math.floor(unitIndex / 2); // 0-3
                    const unitPos = unitIndex % 2; // 0 or 1 (left or right)
                    const unitX = building.x - 50 + (unitPos * 100);
                    const unitY = building.y - buildingType.height + (floor * floorHeight) + 65;

                    if (unit.rented && unit.tenant) {
                        // Generate rent income
                        const elapsedMinutes = ((now - unit.lastIncomeTime) / 60000) * this.timeSpeed;
                        const bonus = building.districtBonus || 1.0;
                        const incomeToAdd = elapsedMinutes * unit.tenant.rentOffer * bonus;

                        unit.accumulatedIncome = Math.min(
                            unit.accumulatedIncome + incomeToAdd,
                            apartmentType.maxIncomePerUnit * bonus
                        );
                        unit.lastIncomeTime = now;

                        // Check if tenant might skip out
                        this.checkTenantRisk(unit);

                        // Hide vacancy indicator if it exists
                        if (unit.vacancyIndicator && unit.vacancyIndicator.setVisible) {
                            unit.vacancyIndicator.setVisible(false);
                        }
                    } else {
                        // Unit is vacant - show vacancy indicator
                        if (!unit.vacancyIndicator || !unit.vacancyIndicator.setVisible) {
                            unit.vacancyIndicator = this.add.text(unitX, unitY, 'VACANT', {
                                fontSize: '8px',
                                color: '#FFFFFF',
                                backgroundColor: '#FF0000',
                                padding: { x: 3, y: 1 }
                            }).setOrigin(0.5).setDepth(11);
                        } else {
                            unit.vacancyIndicator.setVisible(true);
                            unit.vacancyIndicator.x = unitX;
                            unit.vacancyIndicator.y = unitY;
                        }
                    }
                }
            }

            // Hotel room management and nightly income
            if (building.type === 'hotel' && building.rooms) {
                const hotelType = this.buildingTypes.hotel;
                const floorHeight = buildingType.height / 5; // 80px per floor
                const currentNight = Math.floor(this.gameTime / (24 * 60)); // Current night number

                // Check if we've crossed into a new night
                const lastNight = Math.floor(building.lastNightCheck / (24 * 60));
                if (currentNight > lastNight) {
                    // New night has started! Process all rooms
                    console.log(`🌙 New night at hotel! Night #${currentNight}`);

                    for (let roomIndex = 0; roomIndex < building.rooms.length; roomIndex++) {
                        const room = building.rooms[roomIndex];

                        if (room.status === 'occupied') {
                            // Guest stays one more night
                            room.nightsOccupied++;

                            // Random checkout: 33% chance each night after first night
                            if (room.nightsOccupied >= 1 && Math.random() < 0.33) {
                                // Guest checks out - room becomes dirty and generates income
                                const income = hotelType.nightlyRate * room.nightsOccupied;
                                building.accumulatedIncome += income;
                                room.status = 'dirty';
                                room.nightsOccupied = 0;
                                console.log(`Guest checked out of room ${roomIndex + 1} after ${room.nightsOccupied} nights. Earned $${income}`);
                            }
                        } else if (room.status === 'clean') {
                            // Room is clean - new guest checks in
                            room.status = 'occupied';
                            room.nightsOccupied = 0; // Will become 1 on next night check
                            console.log(`New guest checked into room ${roomIndex + 1}`);
                        }
                        // Dirty rooms stay dirty until mayor cleans them
                    }

                    building.lastNightCheck = this.gameTime;
                }

                // Update dirty room indicators
                for (let roomIndex = 0; roomIndex < building.rooms.length; roomIndex++) {
                    const room = building.rooms[roomIndex];
                    const floor = Math.floor(roomIndex / 2); // 0-4
                    const roomPos = roomIndex % 2; // 0 or 1 (left or right)
                    const roomX = building.x - 60 + (roomPos * 120);
                    const roomY = building.y - buildingType.height + (floor * floorHeight) + 75;

                    if (room.status === 'dirty') {
                        // Show dirty indicator
                        if (!room.dirtyIndicator) {
                            room.dirtyIndicator = this.add.text(roomX, roomY, 'DIRTY', {
                                fontSize: '8px',
                                color: '#FFFFFF',
                                backgroundColor: '#8B4513',
                                padding: { x: 3, y: 1 }
                            }).setOrigin(0.5).setDepth(11);
                        } else {
                            room.dirtyIndicator.setVisible(true);
                            room.dirtyIndicator.x = roomX;
                            room.dirtyIndicator.y = roomY;
                        }
                    } else {
                        // Hide dirty indicator if room is clean/occupied
                        if (room.dirtyIndicator) {
                            room.dirtyIndicator.setVisible(false);
                        }
                    }
                }

                // Show income indicator if income is ready to collect
                if (building.accumulatedIncome >= 1) {
                    if (!building.incomeIndicator) {
                        building.incomeIndicator = this.add.text(building.x, building.y - buildingType.height - 80, '💰', {
                            fontSize: '24px'
                        }).setOrigin(0.5).setDepth(11);
                    } else {
                        building.incomeIndicator.setVisible(true);
                    }
                } else {
                    if (building.incomeIndicator) {
                        building.incomeIndicator.setVisible(false);
                    }
                }
            }

            // Shop employee wage payment (daily)
            if (this.isShop(building.type) && building.hasEmployee && building.dailyWage > 0) {
                const currentDay = Math.floor(this.gameTime / (24 * 60)); // Current day number
                const lastDay = Math.floor((building.lastWageCheck || 0) / (24 * 60));

                // Check if we've crossed into a new day
                if (currentDay > lastDay) {
                    // New day has started! Pay employee wage
                    this.money -= building.dailyWage;
                    console.log(`💵 Paid $${building.dailyWage} wage to shop employee. Day #${currentDay}`);

                    building.lastWageCheck = this.gameTime;

                    // Update money UI
                    this.updateMoneyUI();

                    // Update shop UI if player is viewing this shop
                    if (this.insideShop && this.currentShop === building) {
                        this.updateShopInventoryUI();
                    }
                }
            }

            // Shop opening hours (7am-9pm if has employee)
            if (this.isShop(building.type) && building.hasEmployee) {
                const totalMinutes = Math.floor(this.gameTime);
                const hour = Math.floor((totalMinutes % (24 * 60)) / 60);

                // Shop is open from 7am (hour 7) to 9pm (hour 21)
                const shouldBeOpen = hour >= 7 && hour < 21;

                // Update shop status
                if (building.isOpen !== shouldBeOpen) {
                    building.isOpen = shouldBeOpen;

                    // Update shop UI if player is viewing this shop
                    if (this.insideShop && this.currentShop === building) {
                        this.updateShopInventoryUI();
                    }
                }
            }
        }

        // Update resource UI
        let resourceText = `💰 Cash: $${this.money}  🪵 ${this.wood}  🧱 ${this.bricks}`;
        if (this.creativeMode) resourceText += `  [CREATIVE MODE]`;
        if (this.bankBalance > 0) resourceText += `\n🏦 Bank: $${this.bankBalance}`;
        if (this.loanAmount > 0) resourceText += `\n💳 Debt: $${this.loanAmount}`;
        this.resourceUI.setText(resourceText);

        // Update buses
        if (!this.isPaused) {
            this.updateBuses();
        }

        // Update citizens
        if (!this.isPaused) {
            this.updateCitizens();
        }

        // Restart is now controlled via settings menu (mouse clicks)

        // Delete confirmation is now handled by clickable buttons

        // Pause and travel are now controlled via settings menu (mouse clicks)

        // Toggle delete mode
        if (Phaser.Input.Keyboard.JustDown(this.xKey) && !this.restartConfirmShowing && !this.deleteConfirmShowing) {
            this.deleteMode = !this.deleteMode;
            this.buildMode = false;  // Exit build mode if entering delete mode
            if (!this.deleteMode) {
                this.selectedBuilding = null;
                if (this.buildingPreview) {
                    this.buildingPreview.destroy();
                    this.buildingPreview = null;
                }
            }
        }

        // Build mode is now controlled via clickable menu at bottom of screen
        // Update building preview if in build mode (freeze position during confirmation but keep visible)
        if (this.buildMode) {
            if (!this.buildConfirmShowing) {
                this.updateBuildingPreview();
            }
            // Keep preview visible even during confirmation so user can see where it will be placed
        } else {
            // Clear preview when exiting build mode
            if (this.buildingPreview) {
                this.buildingPreview.destroy();
                this.buildingPreview = null;
            }
        }

        // Update delete mode UI
        if (this.deleteMode) {
            this.demolishUI.setVisible(true);
        } else {
            this.demolishUI.setVisible(false);
        }

        if (this.deleteMode) {

            // Check for click on building to delete
            if (this.input.activePointer.isDown && this.input.activePointer.justDown) {
                const clickX = this.input.activePointer.x + this.cameras.main.scrollX;
                const clickY = this.input.activePointer.y + this.cameras.main.scrollY;

                // Find building at click position
                for (let building of this.buildings) {
                    const buildingType = this.buildingTypes[building.type];
                    const left = building.x - buildingType.width / 2;
                    const right = building.x + buildingType.width / 2;
                    const top = building.y - buildingType.height;
                    const bottom = building.y;

                    if (clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
                        // Show confirmation dialog
                        this.buildingToDelete = building;
                        this.deleteConfirmShowing = true;
                        this.deleteConfirmUI.setText(`Delete ${buildingType.name}?`);
                        this.deleteConfirmContainer.setVisible(true);
                        break;
                    }
                }
            }
        }

        // Hotel cleaning interaction - click hotel when NOT in build/delete mode
        if (!this.buildMode && !this.deleteMode && !this.deleteConfirmShowing && !this.bankMenuOpen && !this.mailboxMenuOpen) {
            if (this.input.activePointer.isDown && this.input.activePointer.justDown) {
                const clickX = this.input.activePointer.x + this.cameras.main.scrollX;
                const clickY = this.input.activePointer.y + this.cameras.main.scrollY;

                // Find if click is on a hotel
                for (let building of this.buildings) {
                    if (building.type === 'hotel') {
                        const buildingType = this.buildingTypes[building.type];
                        const left = building.x - buildingType.width / 2;
                        const right = building.x + buildingType.width / 2;
                        const top = building.y - buildingType.height;
                        const bottom = building.y;

                        if (clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
                            // Count dirty rooms
                            let dirtyCount = 0;
                            for (let room of building.rooms) {
                                if (room.status === 'dirty') {
                                    dirtyCount++;
                                }
                            }

                            if (dirtyCount > 0) {
                                const totalCleaningCost = dirtyCount * buildingType.cleaningCost;

                                // Check if mayor has enough money
                                if (this.money >= totalCleaningCost) {
                                    // Clean all dirty rooms
                                    for (let room of building.rooms) {
                                        if (room.status === 'dirty') {
                                            room.status = 'clean';
                                        }
                                    }

                                    // Deduct money
                                    this.money -= totalCleaningCost;
                                    console.log(`🧹 Cleaned ${dirtyCount} rooms for $${totalCleaningCost}. Cash remaining: $${this.money}`);

                                    // Save game
                                    this.saveGame();
                                } else {
                                    console.log(`❌ Not enough money to clean rooms! Need $${totalCleaningCost}, have $${this.money}`);
                                }
                            } else {
                                console.log(`✨ All hotel rooms are already clean!`);
                            }

                            break;
                        }
                    }
                }
            }
        }

        // Check if player is near a bank
        // Find the CLOSEST one, not just the first one
        this.nearBank = null;
        let closestBankDistance = 250;
        for (let building of this.buildings) {
            if (building.type === 'bank') {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y);
                if (distance < closestBankDistance) {
                    this.nearBank = building;
                    closestBankDistance = distance;
                }
            }
        }

        // Bank interaction
        if (this.nearBank && !this.bankMenuOpen && !this.buildMode && !this.restartConfirmShowing) {
            // Show prompt above the bank building
            const bankType = this.buildingTypes[this.nearBank.type];
            if (!this.bankPrompt) {
                this.bankPrompt = this.add.text(this.nearBank.x, this.nearBank.y - bankType.height - 100, 'Press E to use Bank', {
                    fontSize: '12px',
                    color: '#ffffff',
                    backgroundColor: '#2E7D32',
                    padding: { x: 5, y: 3 }
                }).setOrigin(0.5);
            } else {
                this.bankPrompt.x = this.nearBank.x;
                this.bankPrompt.y = this.nearBank.y - bankType.height - 100;
                this.bankPrompt.setVisible(true);
            }

            // Open bank menu
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.openBankMenu();
            }
        } else {
            if (this.bankPrompt) {
                this.bankPrompt.setVisible(false);
            }
        }

        // Check if player is near a shop (only when NOT inside a shop)
        if (!this.insideShop) {
            this.nearShop = null;
            let closestShopDistance = 150;
            for (let building of this.buildings) {
                if (this.isShop(building.type)) {
                    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y);
                    if (distance < closestShopDistance) {
                        this.nearShop = building;
                        closestShopDistance = distance;
                    }
                }
            }

            // Shop interaction - Enter shop
            if (this.nearShop && !this.buildMode && !this.deleteMode && !this.bankMenuOpen && !this.mailboxMenuOpen) {
                // Show prompt above the shop building
                const shopType = this.buildingTypes[this.nearShop.type];
                if (!this.shopPrompt) {
                    this.shopPrompt = this.add.text(this.nearShop.x, this.nearShop.y - shopType.height - 100, 'Press E to enter Shop', {
                        fontSize: '12px',
                        color: '#ffffff',
                        backgroundColor: '#4ECDC4',
                        padding: { x: 5, y: 3 }
                    }).setOrigin(0.5).setDepth(1000);
                } else {
                    this.shopPrompt.x = this.nearShop.x;
                    this.shopPrompt.y = this.nearShop.y - shopType.height - 100;
                    this.shopPrompt.setVisible(true);
                }

                // Enter shop
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    this.enterShop(this.nearShop);
                }
            } else {
                if (this.shopPrompt) {
                    this.shopPrompt.setVisible(false);
                }
            }
        }

        // Exit shop if inside
        if (this.insideShop) {
            if (Phaser.Input.Keyboard.JustDown(this.eKey) || this.input.keyboard.addKey('ESC').isDown) {
                this.exitShop();
            }
        }

        // Check if player is near a mailbox
        this.nearMailbox = null;
        let closestMailboxDistance = 80;
        for (let mailbox of this.mailboxes) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, mailbox.x, mailbox.y);
            if (distance < closestMailboxDistance) {
                this.nearMailbox = mailbox;
                closestMailboxDistance = distance;
            }
        }

        // Mailbox interaction
        if (this.nearMailbox && !this.mailboxMenuOpen && !this.buildMode && !this.restartConfirmShowing) {
            // Show prompt above mailbox if there are applications
            if (this.pendingApplications.length > 0) {
                if (!this.mailboxPrompt) {
                    this.mailboxPrompt = this.add.text(this.nearMailbox.x, this.nearMailbox.y - 90, `Press E - ${this.pendingApplications.length} Application(s)`, {
                        fontSize: '12px',
                        color: '#ffffff',
                        backgroundColor: '#D32F2F',
                        padding: { x: 5, y: 3 }
                    }).setOrigin(0.5).setDepth(1000);
                } else {
                    this.mailboxPrompt.setText(`Press E - ${this.pendingApplications.length} Application(s)`);
                    this.mailboxPrompt.x = this.nearMailbox.x;
                    this.mailboxPrompt.y = this.nearMailbox.y - 90;
                    this.mailboxPrompt.setVisible(true);
                }

                // Open mailbox menu
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    this.openMailboxMenu();
                }
            }
        } else {
            if (this.mailboxPrompt) {
                this.mailboxPrompt.setVisible(false);
            }
        }

        // Handle bank menu
        if (this.bankMenuOpen) {
            // Close bank menu
            if (Phaser.Input.Keyboard.JustDown(this.eKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.closeBankMenu();
            }

            // Bank operations
            if (Phaser.Input.Keyboard.JustDown(this.key1)) {
                this.depositMoney(100);
            }
            if (Phaser.Input.Keyboard.JustDown(this.key2)) {
                this.withdrawMoney(100);
            }
            if (Phaser.Input.Keyboard.JustDown(this.key3)) {
                this.borrowMoney(500);
            }
        }

        // Handle mailbox menu
        if (this.mailboxMenuOpen && this.pendingApplications.length > 0) {
            // Close mailbox menu
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.closeMailboxMenu();
            }

            const currentBatch = this.pendingApplications[0];
            const numApplications = currentBatch.applications.length;

            // Navigate between applications
            if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.aKey)) {
                this.currentApplicationIndex = (this.currentApplicationIndex - 1 + numApplications) % numApplications;
                this.updateMailboxUI();
            }
            if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.dKey)) {
                this.currentApplicationIndex = (this.currentApplicationIndex + 1) % numApplications;
                this.updateMailboxUI();
            }

            // Accept application
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.acceptApplication();
            }
        }

        // Check if player is near an income-generating building (House, Shop, Restaurant, Apartment)
        // Find the CLOSEST one with income ready, not just the first one
        this.nearIncomeBuilding = null;
        let closestIncomeDistance = 250;
        for (let building of this.buildings) {
            const buildingType = this.buildingTypes[building.type];

            // Check regular buildings (House, Shop, Restaurant)
            if (buildingType && buildingType.incomeRate && building.accumulatedIncome >= 1) {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y);
                if (distance < closestIncomeDistance) {
                    this.nearIncomeBuilding = building;
                    closestIncomeDistance = distance;
                }
            }

            // Check apartment buildings (income from rented units)
            if (building.type === 'apartment' && building.units) {
                let totalApartmentIncome = 0;
                for (let unit of building.units) {
                    if (unit.rented && unit.accumulatedIncome) {
                        totalApartmentIncome += unit.accumulatedIncome;
                    }
                }
                if (totalApartmentIncome >= 1) {
                    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y);
                    if (distance < closestIncomeDistance) {
                        this.nearIncomeBuilding = building;
                        closestIncomeDistance = distance;
                    }
                }
            }
        }

        // Check if player is near a resource building (Market, Lumber Mill, Brick Factory)
        // Find the CLOSEST one, not just the first one
        this.nearResourceBuilding = null;
        let closestResourceDistance = 251; // Start at max range + 1
        for (let building of this.buildings) {
            if (building.type === 'market' || building.type === 'lumbermill' || building.type === 'brickfactory') {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y);
                if (distance < 250 && distance < closestResourceDistance) {
                    this.nearResourceBuilding = building;
                    closestResourceDistance = distance;
                }
            }
        }

        // Income building interaction (prioritize over resource buildings)
        if (this.nearIncomeBuilding && !this.buildMode && !this.bankMenuOpen && !this.resourceBuildingMenuOpen && !this.restartConfirmShowing) {
            // Show prompt above the income building
            const buildingType = this.buildingTypes[this.nearIncomeBuilding.type];

            // Calculate income (different for apartments vs regular buildings)
            let income = 0;
            if (this.nearIncomeBuilding.type === 'apartment' && this.nearIncomeBuilding.units) {
                for (let unit of this.nearIncomeBuilding.units) {
                    if (unit.rented && unit.accumulatedIncome) {
                        income += unit.accumulatedIncome;
                    }
                }
            } else {
                income = this.nearIncomeBuilding.accumulatedIncome;
            }
            income = Math.floor(income);

            if (!this.incomePrompt) {
                this.incomePrompt = this.add.text(this.nearIncomeBuilding.x, this.nearIncomeBuilding.y - buildingType.height - 100, `Press E to collect $${income}`, {
                    fontSize: '12px',
                    color: '#ffffff',
                    backgroundColor: '#4CAF50',
                    padding: { x: 5, y: 3 }
                }).setOrigin(0.5);
            } else {
                this.incomePrompt.setText(`Press E to collect $${income}`);
                this.incomePrompt.x = this.nearIncomeBuilding.x;
                this.incomePrompt.y = this.nearIncomeBuilding.y - buildingType.height - 100;
                this.incomePrompt.setVisible(true);
            }

            // Collect income
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.collectIncome(this.nearIncomeBuilding);
            }
        } else {
            if (this.incomePrompt) {
                this.incomePrompt.setVisible(false);
            }
        }

        // Resource building interaction
        if (this.nearResourceBuilding && !this.resourceBuildingMenuOpen && !this.buildMode && !this.bankMenuOpen && !this.nearIncomeBuilding && !this.restartConfirmShowing) {
            // Show prompt above the resource building with building name
            const resourceType = this.buildingTypes[this.nearResourceBuilding.type];
            const promptText = `Press E: ${resourceType.name}`;

            if (!this.resourcePrompt) {
                this.resourcePrompt = this.add.text(this.nearResourceBuilding.x, this.nearResourceBuilding.y - resourceType.height - 100, promptText, {
                    fontSize: '12px',
                    color: '#ffffff',
                    backgroundColor: '#FF9800',
                    padding: { x: 5, y: 3 }
                }).setOrigin(0.5);
            } else {
                this.resourcePrompt.setText(promptText);
                this.resourcePrompt.x = this.nearResourceBuilding.x;
                this.resourcePrompt.y = this.nearResourceBuilding.y - resourceType.height - 100;
                this.resourcePrompt.setVisible(true);
            }

            // Open resource building menu
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.openResourceBuildingMenu();
            }
        } else {
            if (this.resourcePrompt) {
                this.resourcePrompt.setVisible(false);
            }
        }

        // Handle resource building menu
        if (this.resourceBuildingMenuOpen) {
            // Close menu
            if (Phaser.Input.Keyboard.JustDown(this.eKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.closeResourceBuildingMenu();
            }

            // Building-specific operations
            if (this.nearResourceBuilding.type === 'market') {
                if (Phaser.Input.Keyboard.JustDown(this.key1)) {
                    this.buyWood(10, 50);
                }
                if (Phaser.Input.Keyboard.JustDown(this.key2)) {
                    this.buyBricks(10, 75);
                }
            } else if (this.nearResourceBuilding.type === 'lumbermill') {
                if (Phaser.Input.Keyboard.JustDown(this.key1)) {
                    this.collectWood();
                }
            } else if (this.nearResourceBuilding.type === 'brickfactory') {
                if (Phaser.Input.Keyboard.JustDown(this.key1)) {
                    this.collectBricks();
                }
            }
        }

        // Sync visual with player
        this.playerVisual.x = this.player.x;
        this.playerVisual.y = this.player.y;

        // Movement (disabled when restart confirmation is showing)
        if (!this.restartConfirmShowing) {
            if (this.cursors.left.isDown || this.aKey.isDown) {
                this.player.setVelocityX(-200);
                this.playerVisual.scaleX = -1;
            } else if (this.cursors.right.isDown || this.dKey.isDown) {
                this.player.setVelocityX(200);
                this.playerVisual.scaleX = 1;
            } else {
                this.player.setVelocityX(0);
            }
        } else {
            this.player.setVelocityX(0);
        }

        // Jump - check if on ground (disabled when restart confirmation is showing)
        if (!this.restartConfirmShowing) {
            const onGround = this.player.body.touching.down ||
                            this.player.body.blocked.down ||
                            Math.abs(this.player.body.velocity.y) < 0.5;

            if ((this.cursors.up.isDown || this.wKey.isDown || this.spaceKey.isDown) && onGround) {
                this.player.setVelocityY(-550);
            }
        }
    }

    updateBuildingPreview() {
        if (!this.buildMode || !this.selectedBuilding) {
            return;
        }

        const building = this.buildingTypes[this.selectedBuilding];
        if (!building) {
            console.error('Building type not found:', this.selectedBuilding);
            return;
        }

        const mouseWorldX = this.input.activePointer.x + this.cameras.main.scrollX;

        // Snap to grid (every 240 pixels along the street for bigger buildings)
        const snappedX = Math.round(mouseWorldX / 240) * 240;
        const buildingY = this.gameHeight - 100; // Ground level (matches the gray street)

        // Only recreate preview if position changed
        if (this.buildingPreview && this.buildingPreview.snappedX === snappedX && this.buildingPreview.buildingY === buildingY) {
            return; // Position hasn't changed, keep existing preview
        }

        // Remove old preview
        if (this.buildingPreview) {
            this.buildingPreview.destroy();
            this.buildingPreview = null;
        }

        // Create new preview in WORLD coordinates
        const previewGraphics = this.add.graphics();
        previewGraphics.setDepth(15); // Above buildings (10) but below UI (9998+)
        previewGraphics.setVisible(true);
        previewGraphics.setAlpha(0.7); // Semi-transparent

        // Draw the building preview at the actual world position
        previewGraphics.fillStyle(building.color, 1);
        previewGraphics.fillRect(snappedX - building.width/2, buildingY - building.height,
                                building.width, building.height);
        previewGraphics.lineStyle(3, 0x000000, 1);
        previewGraphics.strokeRect(snappedX - building.width/2, buildingY - building.height,
                                  building.width, building.height);

        // Draw building details (windows, doors, etc.) so user can see what they're placing
        try {
            this.drawBuildingDetails(previewGraphics, this.selectedBuilding, snappedX, buildingY);
        } catch (error) {
            console.error('Error drawing building preview details:', error);
        }

        // Add bright green outline to show it's a preview
        previewGraphics.lineStyle(5, 0x00FF00, 0.8);
        previewGraphics.strokeRect(snappedX - building.width/2, buildingY - building.height,
                                  building.width, building.height);

        this.buildingPreview = previewGraphics;
        this.buildingPreview.snappedX = snappedX;
        this.buildingPreview.buildingY = buildingY;

        console.log('Preview created at', snappedX, buildingY);
    }

    deleteBuilding(building) {
        // Destroy graphics
        if (building.graphics) {
            building.graphics.destroy();
        }

        // Destroy label
        if (building.label) {
            building.label.destroy();
        }

        // Destroy income indicator
        if (building.incomeIndicator) {
            building.incomeIndicator.destroy();
        }

        // Destroy resource indicator
        if (building.resourceIndicator) {
            building.resourceIndicator.destroy();
        }

        // Destroy vacancy indicators for apartments
        if (building.type === 'apartment' && building.units) {
            for (let unit of building.units) {
                if (unit.vacancyIndicator) {
                    unit.vacancyIndicator.destroy();
                }
            }
        }

        // Destroy dirty indicators for hotel rooms
        if (building.type === 'hotel' && building.rooms) {
            for (let room of building.rooms) {
                if (room.dirtyIndicator) {
                    room.dirtyIndicator.destroy();
                }
            }
        }

        // Destroy window lights
        if (building.windowLights) {
            for (let light of building.windowLights) {
                light.destroy();
            }
        }

        // Remove from buildings array
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }

        console.log(`Deleted ${building.type}`);

        // Save game
        this.saveGame();
    }

    placeBuilding() {
        if (!this.selectedBuilding) return;

        const building = this.buildingTypes[this.selectedBuilding];

        // Check if player has enough resources (skip in creative mode)
        if (!this.creativeMode) {
            if (this.money < building.cost || this.wood < building.wood || this.bricks < building.bricks) {
                console.log('Not enough resources! Need: $' + building.cost + ', Wood:' + building.wood + ', Bricks:' + building.bricks);
                console.log('You have: $' + this.money + ', Wood:' + this.wood + ', Bricks:' + this.bricks);
                alert('Not enough resources!\n\nNeed: $' + building.cost + ', 🪵' + building.wood + ', 🧱' + building.bricks + '\nYou have: $' + this.money + ', 🪵' + this.wood + ', 🧱' + this.bricks);
                return false; // Return false to indicate failure
            }

            // Deduct resources
            this.money -= building.cost;
            this.wood -= building.wood;
            this.bricks -= building.bricks;
        }

        // Use the saved position from when confirmation was triggered
        const x = this.pendingBuildingX;
        const y = this.pendingBuildingY;

        const newBuilding = this.add.graphics();
        newBuilding.setDepth(10); // Buildings are on top of background
        newBuilding.fillStyle(building.color, 1);
        newBuilding.fillRect(x - building.width/2, y - building.height, building.width, building.height);
        newBuilding.lineStyle(3, 0x000000, 1);
        newBuilding.strokeRect(x - building.width/2, y - building.height, building.width, building.height);

        // Draw detailed building features (windows, doors, roof, etc.)
        this.drawBuildingDetails(newBuilding, this.selectedBuilding, x, y);

        // Add label (bigger text for bigger buildings)
        const label = this.add.text(x, y - building.height - 55, building.name, {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 5 }
        }).setOrigin(0.5).setDepth(11);

        // Special decorations for specific building types
        if (this.selectedBuilding === 'bank') {
            // Add dollar sign symbol
            const dollarSign = this.add.text(x, y - building.height / 2, '$', {
                fontSize: '80px',
                color: '#FFD700',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);

            // Add columns to make it look more like a bank
            newBuilding.fillStyle(0xFFFFFF, 0.3);
            newBuilding.fillRect(x - building.width/2 + 20, y - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x - building.width/2 + 60, y - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 80, y - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 40, y - building.height + 40, 20, building.height - 80);
        } else if (this.isShop(this.selectedBuilding)) {
            // Add shop name text sign above awning
            const shopName = this.buildingTypes[this.selectedBuilding].name.toUpperCase();
            const shopSign = this.add.text(x, y - 140, shopName, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (this.selectedBuilding === 'restaurant') {
            // Add "RESTAURANT" text on the red sign
            const restaurantSign = this.add.text(x, y - 95, 'RESTAURANT', {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (this.selectedBuilding === 'hotel') {
            // Add "HOTEL" text on the gold sign
            const hotelSign = this.add.text(x, y - building.height + 20, 'HOTEL', {
                fontSize: '14px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (this.selectedBuilding === 'market') {
            // Add market awning
            const awning = this.add.text(x, y - building.height / 2, '🏪', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (this.selectedBuilding === 'lumbermill') {
            // Add tree/wood icon
            const woodIcon = this.add.text(x, y - building.height / 2, '🌲', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (this.selectedBuilding === 'brickfactory') {
            // Add brick icon
            const brickIcon = this.add.text(x, y - building.height / 2, '🧱', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        }

        // Determine which district the building is in
        let placedDistrict = null;
        for (let districtKey in this.districts) {
            const district = this.districts[districtKey];
            if (x >= district.startX && x < district.endX) {
                placedDistrict = districtKey;
                break;
            }
        }

        // Check if building is in its suggested district for bonus
        const inCorrectDistrict = placedDistrict === building.district;
        const districtBonus = inCorrectDistrict ? 1.2 : 1.0; // 20% bonus if in correct district

        // Add building with income and resource tracking
        const buildingData = {
            graphics: newBuilding,
            label: label,
            type: this.selectedBuilding,
            x: x,
            y: y,
            accumulatedIncome: 0,
            lastIncomeTime: Date.now(),
            storedResources: 0,  // For resource buildings (lumber mill, brick factory)
            lastResourceTime: Date.now(),
            placedDistrict: placedDistrict,
            districtBonus: districtBonus
        };

        // Add visual indicator if building is in correct district
        if (inCorrectDistrict) {
            const bonusIndicator = this.add.text(x, y - building.height - 30, '⭐', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(12);
            buildingData.bonusIndicator = bonusIndicator;
        }

        // Initialize apartment units if it's an apartment building
        if (this.selectedBuilding === 'apartment') {
            buildingData.units = [];
            for (let i = 0; i < building.units; i++) {
                buildingData.units.push({
                    rented: false,  // All units start vacant
                    tenant: null,   // Current tenant info (name, credit score, etc.)
                    accumulatedIncome: 0,
                    lastIncomeTime: Date.now(),
                    lastRiskCheck: Date.now()  // For checking if tenant skips
                });
            }
            buildingData.vacancySigns = [];  // Will store vacancy sign graphics

            // Generate applications for all vacant units immediately
            console.log('Generating applications for new apartment building with', building.units, 'units');
            for (let i = 0; i < building.units; i++) {
                this.generateApplicationsForVacantUnit(buildingData, i);
            }
        }

        // Initialize hotel rooms if it's a hotel building
        if (this.selectedBuilding === 'hotel') {
            buildingData.rooms = [];
            buildingData.lastNightCheck = this.gameTime; // Track last time we checked for night transition
            buildingData.accumulatedIncome = 0; // Total income from all rooms

            for (let i = 0; i < building.rooms; i++) {
                buildingData.rooms.push({
                    status: 'clean',  // clean, dirty, or occupied
                    nightsOccupied: 0,  // How many nights has current guest stayed
                    lastStatusChange: Date.now()
                });
            }
        }

        // Initialize shop inventory if it's a shop
        if (this.isShop(this.selectedBuilding)) {
            buildingData.inventory = {
                stock: 50,  // Current stock level (0-100)
                maxStock: 100,  // Maximum stock capacity
                restockCost: 5,  // Cost per unit to restock
                salesPerCustomer: 5  // Stock consumed per customer visit
            };
            buildingData.hasEmployee = false;  // No employee until hired
            buildingData.isOpen = false;  // Closed until employee is hired
            buildingData.dailyWage = 0;  // No wage until employee is hired
            buildingData.lastWageCheck = this.gameTime;  // Track last time we paid wages
        }

        // Add window lights for nighttime
        this.addWindowLights(buildingData, building);

        this.buildings.push(buildingData);

        if (this.creativeMode) {
            console.log(`Built ${building.name} in CREATIVE MODE!`);
        } else {
            console.log(`Built ${building.name}! Resources: $${this.money}, Wood: ${this.wood}, Bricks: ${this.bricks}`);
        }

        // Auto-save after building
        this.saveGame();
    }

    saveGame() {
        try {
            const saveData = {
                money: this.money,
                wood: this.wood,
                bricks: this.bricks,
                bankBalance: this.bankBalance,
                loanAmount: this.loanAmount,
                gameTime: this.gameTime,
                timeSpeed: this.timeSpeed,
                buildings: this.buildings.map(b => ({
                    type: b.type,
                    x: b.x,
                    y: b.y,
                    accumulatedIncome: b.accumulatedIncome || 0,
                    lastIncomeTime: b.lastIncomeTime || Date.now(),
                    storedResources: b.storedResources || 0,
                    lastResourceTime: b.lastResourceTime || Date.now(),
                    placedDistrict: b.placedDistrict || null,
                    districtBonus: b.districtBonus || 1.0,
                    // Save apartment units
                    units: b.units || undefined,
                    // Save hotel rooms
                    rooms: b.rooms || undefined,
                    lastNightCheck: b.lastNightCheck || undefined,
                    // Save shop inventory
                    inventory: b.inventory || undefined,
                    hasEmployee: b.hasEmployee,
                    isOpen: b.isOpen,
                    dailyWage: b.dailyWage,
                    lastWageCheck: b.lastWageCheck
                }))
            };
            localStorage.setItem('mainstreetmayor_save', JSON.stringify(saveData));
            console.log(`Game saved! ${this.buildings.length} buildings:`, this.buildings.map(b => `${b.type} at x=${b.x}`));
        } catch (error) {
            console.error('Error saving game:', error);
            // Game continues even if save fails
        }
    }

    loadGame() {
        const saveDataStr = localStorage.getItem('mainstreetmayor_save');
        if (!saveDataStr) {
            console.log('No save data found');
            return false;
        }

        try {
            const saveData = JSON.parse(saveDataStr);

            // Restore resources
            this.money = saveData.money;
            this.wood = saveData.wood;
            this.bricks = saveData.bricks;

            // Restore bank data
            this.bankBalance = saveData.bankBalance || 0;
            this.loanAmount = saveData.loanAmount || 0;

            // Restore time data
            this.gameTime = saveData.gameTime || 0;
            this.timeSpeed = saveData.timeSpeed || 1;
            this.lastRealTime = Date.now(); // Reset to current time on load

            // Restore buildings
            if (saveData.buildings && saveData.buildings.length > 0) {
                console.log(`Loading ${saveData.buildings.length} buildings from save:`, saveData.buildings);
                saveData.buildings.forEach((buildingData, index) => {
                    // Migration: Convert old 'shop' type to 'clothingShop'
                    if (buildingData.type === 'shop') {
                        console.log(`Migrating old 'shop' building to 'clothingShop'`);
                        buildingData.type = 'clothingShop';
                    }
                    console.log(`Loading building ${index}: ${buildingData.type} at x=${buildingData.x}`);
                    this.loadBuilding(
                        buildingData.type,
                        buildingData.x,
                        buildingData.y,
                        buildingData.accumulatedIncome || 0,
                        buildingData.lastIncomeTime || Date.now(),
                        buildingData.storedResources || 0,
                        buildingData.lastResourceTime || Date.now(),
                        buildingData.units,
                        buildingData.rooms,
                        buildingData.lastNightCheck,
                        buildingData.placedDistrict || null,
                        buildingData.districtBonus || 1.0,
                        buildingData.inventory,
                        buildingData.hasEmployee,
                        buildingData.isOpen,
                        buildingData.dailyWage,
                        buildingData.lastWageCheck
                    );
                });
                console.log(`Successfully loaded ${this.buildings.length} buildings`);
            }

            console.log('Game loaded!');
            return true;
        } catch (e) {
            console.error('Error loading save data:', e);
            return false;
        }
    }

    loadBuilding(type, x, y, accumulatedIncome = 0, lastIncomeTime = Date.now(), storedResources = 0, lastResourceTime = Date.now(), units = null, rooms = null, lastNightCheck = null, placedDistrict = null, districtBonus = 1.0, inventory = null, hasEmployee = null, isOpen = null, dailyWage = null, lastWageCheck = null) {
        const building = this.buildingTypes[type];
        if (!building) {
            console.error(`Building type ${type} not found!`);
            return;
        }

        // Always use current ground level instead of saved Y coordinate
        const buildingY = this.gameHeight - 100;

        console.log(`Drawing ${type} at x=${x}, y=${buildingY}, width=${building.width}, height=${building.height}`);

        const newBuilding = this.add.graphics();
        newBuilding.setDepth(10); // Buildings are on top of background
        newBuilding.fillStyle(building.color, 1);
        newBuilding.fillRect(x - building.width/2, buildingY - building.height, building.width, building.height);
        newBuilding.lineStyle(3, 0x000000, 1);
        newBuilding.strokeRect(x - building.width/2, buildingY - building.height, building.width, building.height);

        // Draw detailed building features (windows, doors, roof, etc.)
        try {
            this.drawBuildingDetails(newBuilding, type, x, buildingY);
            console.log(`Successfully drew details for ${type}`);
        } catch (error) {
            console.error(`Error drawing details for ${type}:`, error);
        }

        // Add label (bigger text for bigger buildings)
        const label = this.add.text(x, buildingY - building.height - 55, building.name, {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 5 }
        }).setOrigin(0.5).setDepth(11);

        // Special decorations for specific building types
        if (type === 'bank') {
            // Add dollar sign symbol
            const dollarSign = this.add.text(x, buildingY - building.height / 2, '$', {
                fontSize: '80px',
                color: '#FFD700',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11);

            // Add columns to make it look more like a bank
            newBuilding.fillStyle(0xFFFFFF, 0.3);
            newBuilding.fillRect(x - building.width/2 + 20, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x - building.width/2 + 60, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 80, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 40, buildingY - building.height + 40, 20, building.height - 80);
        } else if (this.isShop(type)) {
            // Add shop name text sign above awning
            const shopName = this.buildingTypes[type].name.toUpperCase();
            const shopSign = this.add.text(x, buildingY - 140, shopName, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'restaurant') {
            // Add "RESTAURANT" text on the red sign
            const restaurantSign = this.add.text(x, buildingY - 95, 'RESTAURANT', {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'hotel') {
            // Add "HOTEL" text on the gold sign
            const hotelSign = this.add.text(x, buildingY - building.height + 20, 'HOTEL', {
                fontSize: '14px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'market') {
            // Add market awning
            const awning = this.add.text(x, buildingY - building.height / 2, '🏪', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'lumbermill') {
            // Add tree/wood icon
            const woodIcon = this.add.text(x, buildingY - building.height / 2, '🌲', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'brickfactory') {
            // Add brick icon
            const brickIcon = this.add.text(x, buildingY - building.height / 2, '🧱', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        }

        // Add loaded building with income and resource tracking (use buildingY for current ground level)
        const buildingData = {
            graphics: newBuilding,
            label: label,
            type: type,
            x: x,
            y: buildingY,
            accumulatedIncome: accumulatedIncome,
            lastIncomeTime: lastIncomeTime,
            storedResources: storedResources,
            lastResourceTime: lastResourceTime,
            placedDistrict: placedDistrict,
            districtBonus: districtBonus
        };

        // Add visual indicator if building is in correct district
        const inCorrectDistrict = placedDistrict === building.district;
        if (inCorrectDistrict) {
            const bonusIndicator = this.add.text(x, buildingY - building.height - 30, '⭐', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(12);
            buildingData.bonusIndicator = bonusIndicator;
        }

        // Restore apartment units if they exist
        if (units) {
            buildingData.units = units;
            buildingData.vacancySigns = [];
        }

        // Restore hotel rooms if they exist
        if (rooms) {
            buildingData.rooms = rooms;
            buildingData.lastNightCheck = lastNightCheck || this.gameTime;
        }

        // Initialize shop inventory if it's a shop (use saved data or defaults)
        if (this.isShop(type)) {
            buildingData.inventory = inventory || {
                stock: 50,
                maxStock: 100,
                restockCost: 5,
                salesPerCustomer: 5
            };
            buildingData.hasEmployee = hasEmployee !== null ? hasEmployee : false;
            buildingData.isOpen = isOpen !== null ? isOpen : false;
            buildingData.dailyWage = dailyWage !== null ? dailyWage : 0;
            buildingData.lastWageCheck = lastWageCheck !== null ? lastWageCheck : this.gameTime;
        }

        // Add window lights for nighttime
        const buildingType = this.buildingTypes[type];
        this.addWindowLights(buildingData, buildingType);

        this.buildings.push(buildingData);
    }

    openBankMenu() {
        this.bankMenuOpen = true;
        this.updateBankUI();
        this.bankUI.setVisible(true);
    }

    closeBankMenu() {
        this.bankMenuOpen = false;
        this.bankUI.setVisible(false);
    }

    enterShop(shop) {
        console.log('Entering shop:', shop);
        this.insideShop = true;
        this.currentShop = shop;

        // Update shop name label
        this.shopNameLabel.setText(shop.type.toUpperCase());

        // Show shop interior
        this.shopInteriorContainer.setVisible(true);

        // Show shop buttons (they're not in the container)
        this.shopRestockButton.setVisible(true);
        this.shopHireButton.setVisible(true);
        this.shopWageText.setVisible(true);

        // Update inventory display
        this.updateShopInventoryUI();

        // Hide shop prompt
        if (this.shopPrompt) {
            this.shopPrompt.setVisible(false);
        }

        // Disable player movement
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
    }

    exitShop() {
        console.log('Exiting shop');
        this.insideShop = false;
        this.currentShop = null;

        // Hide shop interior
        this.shopInteriorContainer.setVisible(false);

        // Hide shop buttons (they're not in the container)
        this.shopRestockButton.setVisible(false);
        this.shopHireButton.setVisible(false);
        this.shopWageText.setVisible(false);
    }

    updateShopInventoryUI() {
        if (!this.currentShop || !this.currentShop.inventory) {
            console.log('No shop or inventory data');
            return;
        }

        const inv = this.currentShop.inventory;

        // Update stock level display
        const stockPercent = Math.floor((inv.stock / inv.maxStock) * 100);
        let stockColor = '#4CAF50'; // Green
        if (stockPercent < 30) stockColor = '#F44336'; // Red
        else if (stockPercent < 60) stockColor = '#FF9800'; // Orange

        this.shopStockText.setText(`Stock: ${inv.stock}/${inv.maxStock} (${stockPercent}%)`);
        this.shopStockText.setStyle({ backgroundColor: stockColor });

        // Update employee status
        const employeeStatus = this.currentShop.hasEmployee ? 'Employee: YES' : 'Employee: NO';
        const employeeColor = this.currentShop.hasEmployee ? '#4CAF50' : '#F44336';
        this.shopEmployeeText.setText(employeeStatus);
        this.shopEmployeeText.setStyle({ backgroundColor: employeeColor });

        // Update shop open/closed status
        const totalMinutes = Math.floor(this.gameTime);
        const hour = Math.floor((totalMinutes % (24 * 60)) / 60);
        const openHours = '7am-9pm';

        let shopStatus = this.currentShop.isOpen ? `OPEN (${openHours})` : `CLOSED (${openHours})`;
        if (!this.currentShop.hasEmployee) {
            shopStatus = 'CLOSED (No Employee)';
        }

        const statusColor = this.currentShop.isOpen ? '#4CAF50' : '#9E9E9E';
        this.shopStatusText.setText(shopStatus);
        this.shopStatusText.setStyle({ backgroundColor: statusColor });

        // Update hire employee button
        const hiringCost = 1000;
        if (this.currentShop.hasEmployee) {
            this.shopHireButton.setVisible(false);
            this.shopWageText.setText(`Daily Wage: $${this.currentShop.dailyWage || 50}`);
            this.shopWageText.setVisible(true);
        } else {
            this.shopWageText.setVisible(false);
            this.shopHireButton.setVisible(true);
            if (this.money < hiringCost) {
                this.shopHireButton.setText(`HIRE EMPLOYEE ($${hiringCost}) - NOT ENOUGH MONEY`);
                this.shopHireButton.setStyle({ backgroundColor: '#D32F2F' });
                this.shopHireButton.disableInteractive();
            } else {
                this.shopHireButton.setText(`HIRE EMPLOYEE ($${hiringCost})`);
                this.shopHireButton.setStyle({ backgroundColor: '#1976D2' });
                this.shopHireButton.setInteractive();
            }
        }

        // Update restock button
        const restockAmount = inv.maxStock - inv.stock;
        const restockCost = restockAmount * inv.restockCost;

        if (restockAmount === 0) {
            this.shopRestockButton.setText('FULLY STOCKED');
            this.shopRestockButton.setStyle({ backgroundColor: '#9E9E9E' });
            this.shopRestockButton.disableInteractive();
        } else if (this.money < restockCost) {
            this.shopRestockButton.setText(`RESTOCK ($${restockCost}) - NOT ENOUGH MONEY`);
            this.shopRestockButton.setStyle({ backgroundColor: '#D32F2F' });
            this.shopRestockButton.disableInteractive();
        } else {
            this.shopRestockButton.setText(`RESTOCK ${restockAmount} units ($${restockCost})`);
            this.shopRestockButton.setStyle({ backgroundColor: '#2E7D32' });
            this.shopRestockButton.setInteractive();
        }
    }

    restockShop() {
        if (!this.currentShop || !this.currentShop.inventory) {
            console.log('No shop or inventory data');
            return;
        }

        const inv = this.currentShop.inventory;
        const restockAmount = inv.maxStock - inv.stock;
        const restockCost = restockAmount * inv.restockCost;

        // Check if already fully stocked
        if (restockAmount === 0) {
            console.log('Shop already fully stocked');
            return;
        }

        // Check if player has enough money
        if (this.money < restockCost) {
            console.log('Not enough money to restock');
            return;
        }

        // Restock the shop
        inv.stock = inv.maxStock;
        this.money -= restockCost;

        console.log(`Restocked shop for $${restockCost}. New stock: ${inv.stock}`);

        // Update UI
        this.updateMoneyUI();
        this.updateShopInventoryUI();
    }

    hireEmployee() {
        if (!this.currentShop) {
            console.log('No current shop');
            return;
        }

        const hiringCost = 1000;

        // Check if already has employee
        if (this.currentShop.hasEmployee) {
            console.log('Shop already has an employee');
            return;
        }

        // Check if player has enough money
        if (this.money < hiringCost) {
            console.log('Not enough money to hire employee');
            return;
        }

        // Hire the employee
        this.currentShop.hasEmployee = true;
        this.currentShop.isOpen = true;
        this.currentShop.dailyWage = 50; // $50 per day
        this.money -= hiringCost;

        console.log(`Hired employee for $${hiringCost}. Shop is now open. Daily wage: $${this.currentShop.dailyWage}`);

        // Update UI
        this.updateMoneyUI();
        this.updateShopInventoryUI();
    }

    openMailboxMenu() {
        if (this.pendingApplications.length === 0) return;

        this.mailboxMenuOpen = true;
        this.currentApplicationIndex = 0;
        this.updateMailboxUI();
        this.mailboxUI.setVisible(true);
    }

    closeMailboxMenu() {
        this.mailboxMenuOpen = false;
        this.mailboxUI.setVisible(false);
    }

    updateMailboxUI() {
        if (this.pendingApplications.length === 0) {
            this.closeMailboxMenu();
            return;
        }

        const currentBatch = this.pendingApplications[0];
        const applications = currentBatch.applications;
        const currentApp = applications[this.currentApplicationIndex];

        let menuText = `=== RENTAL APPLICATION ===\n`;
        menuText += `Unit: Apartment #${currentBatch.unitIndex + 1}\n`;
        menuText += `Application ${this.currentApplicationIndex + 1} of ${applications.length}\n\n`;
        menuText += `Applicant: ${currentApp.name}\n`;
        menuText += `Occupation: ${currentApp.job}\n`;
        menuText += `Employment: ${currentApp.employmentLength} months\n`;
        menuText += `Credit Score: ${currentApp.creditScore}\n`;
        menuText += `Monthly Rent Offer: $${currentApp.rentOffer}/min\n\n`;

        // Credit rating
        let rating = '';
        if (currentApp.creditScore >= 750) rating = '⭐ Excellent (Very Low Risk)';
        else if (currentApp.creditScore >= 650) rating = '✓ Good (Low Risk)';
        else if (currentApp.creditScore >= 550) rating = '⚠ Fair (Moderate Risk)';
        else rating = '❌ Poor (HIGH RISK!)';
        menuText += `Rating: ${rating}\n\n`;

        menuText += `← → : View other applications\n`;
        menuText += `ENTER : Accept this applicant\n`;
        menuText += `ESC : Close mailbox\n`;

        this.mailboxUI.setText(menuText);
    }

    acceptApplication() {
        if (this.pendingApplications.length === 0) return;

        const currentBatch = this.pendingApplications[0];
        const applications = currentBatch.applications;
        const acceptedApp = applications[this.currentApplicationIndex];
        const apartmentBuilding = currentBatch.apartmentBuilding;
        const unitIndex = currentBatch.unitIndex;

        // Find the unit
        const unit = apartmentBuilding.units[unitIndex];

        // Move tenant in
        unit.rented = true;
        unit.tenant = {
            name: acceptedApp.name,
            job: acceptedApp.job,
            creditScore: acceptedApp.creditScore,
            rentOffer: acceptedApp.rentOffer
        };
        unit.lastIncomeTime = Date.now();
        unit.lastRiskCheck = Date.now();

        console.log(`✅ Accepted ${acceptedApp.name} for Apartment #${unitIndex + 1} at $${acceptedApp.rentOffer}/min`);

        // Remove this batch of applications
        this.pendingApplications.shift();

        // Close menu or show next batch
        if (this.pendingApplications.length > 0) {
            this.currentApplicationIndex = 0;
            this.updateMailboxUI();
        } else {
            this.closeMailboxMenu();
        }

        // Save game
        this.saveGame();
    }

    updateBankUI() {
        let menuText = '=== MAIN STREET BANK ===\n';
        menuText += `💰 Cash on Hand: $${this.money}\n`;
        menuText += `🏦 Bank Balance: $${this.bankBalance}\n`;
        menuText += `💳 Loan Debt: $${this.loanAmount}\n\n`;
        menuText += '1: Deposit $100\n';
        menuText += '2: Withdraw $100\n';
        menuText += '3: Borrow $500 (10% interest)\n';
        menuText += 'E/Enter: Close';
        this.bankUI.setText(menuText);
    }

    depositMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.bankBalance += amount;
            console.log(`Deposited $${amount}. Bank balance: $${this.bankBalance}`);
            this.updateBankUI();
            this.saveGame();
        } else {
            console.log('Not enough cash to deposit!');
        }
    }

    withdrawMoney(amount) {
        if (this.bankBalance >= amount) {
            this.bankBalance -= amount;
            this.money += amount;
            console.log(`Withdrew $${amount}. Bank balance: $${this.bankBalance}`);
            this.updateBankUI();
            this.saveGame();
        } else {
            console.log('Not enough money in bank!');
        }
    }

    borrowMoney(amount) {
        const totalLoan = Math.round(amount * (1 + this.loanInterestRate));
        this.money += amount;
        this.loanAmount += totalLoan;
        console.log(`Borrowed $${amount}. You owe $${totalLoan} (including 10% interest). Total debt: $${this.loanAmount}`);
        this.updateBankUI();
        this.saveGame();
    }

    resetGame() {
        // Clear save data
        localStorage.removeItem('mainstreetmayor_save');
        console.log('Game reset! Starting new game...');

        // Restart the scene
        this.scene.restart();
    }

    openResourceBuildingMenu() {
        this.resourceBuildingMenuOpen = true;
        this.updateResourceBuildingUI();
        this.resourceBuildingUI.setVisible(true);
    }

    closeResourceBuildingMenu() {
        this.resourceBuildingMenuOpen = false;
        this.resourceBuildingUI.setVisible(false);
    }

    updateResourceBuildingUI() {
        let menuText = '';

        if (this.nearResourceBuilding.type === 'market') {
            menuText = '=== MARKET ===\n';
            menuText += `💰 Cash: $${this.money}\n`;
            menuText += `🪵 Wood: ${this.wood}\n`;
            menuText += `🧱 Bricks: ${this.bricks}\n\n`;
            menuText += '1: Buy 10 Wood ($50)\n';
            menuText += '2: Buy 10 Bricks ($75)\n';
            menuText += 'E/Enter: Close';
        } else if (this.nearResourceBuilding.type === 'lumbermill') {
            const available = Math.floor(this.nearResourceBuilding.storedResources);
            menuText = '=== LUMBER MILL ===\n';
            menuText += `🪵 Available: ${available} wood\n`;
            menuText += `Your Wood: ${this.wood}\n\n`;
            if (available >= 1) {
                menuText += `1: Collect ${available} Wood (Free!)\n`;
            } else {
                menuText += '⏳ Regenerating... (1 wood/min)\n';
            }
            menuText += 'E/Enter: Close';
        } else if (this.nearResourceBuilding.type === 'brickfactory') {
            const available = Math.floor(this.nearResourceBuilding.storedResources);
            menuText = '=== BRICK FACTORY ===\n';
            menuText += `🧱 Available: ${available} bricks\n`;
            menuText += `Your Bricks: ${this.bricks}\n\n`;
            if (available >= 1) {
                menuText += `1: Collect ${available} Bricks (Free!)\n`;
            } else {
                menuText += '⏳ Regenerating... (1 brick/min)\n';
            }
            menuText += 'E/Enter: Close';
        }

        this.resourceBuildingUI.setText(menuText);
    }

    buyWood(amount, cost) {
        if (this.money >= cost) {
            this.money -= cost;
            this.wood += amount;
            console.log(`Bought ${amount} wood for $${cost}. Wood: ${this.wood}, Money: $${this.money}`);
            this.updateResourceBuildingUI();
            this.saveGame();
        } else {
            console.log('Not enough money!');
        }
    }

    buyBricks(amount, cost) {
        if (this.money >= cost) {
            this.money -= cost;
            this.bricks += amount;
            console.log(`Bought ${amount} bricks for $${cost}. Bricks: ${this.bricks}, Money: $${this.money}`);
            this.updateResourceBuildingUI();
            this.saveGame();
        } else {
            console.log('Not enough money!');
        }
    }

    collectWood() {
        const available = Math.floor(this.nearResourceBuilding.storedResources);
        if (available >= 1) {
            this.wood += available;
            this.nearResourceBuilding.storedResources = 0;
            this.nearResourceBuilding.lastResourceTime = Date.now();
            console.log(`Collected ${available} wood. Total wood: ${this.wood}`);

            // Hide resource indicator
            if (this.nearResourceBuilding.resourceIndicator) {
                this.nearResourceBuilding.resourceIndicator.setVisible(false);
            }

            this.updateResourceBuildingUI();
            this.saveGame();
        } else {
            console.log('No wood available yet. Wait for regeneration.');
        }
    }

    collectBricks() {
        const available = Math.floor(this.nearResourceBuilding.storedResources);
        if (available >= 1) {
            this.bricks += available;
            this.nearResourceBuilding.storedResources = 0;
            this.nearResourceBuilding.lastResourceTime = Date.now();
            console.log(`Collected ${available} bricks. Total bricks: ${this.bricks}`);

            // Hide resource indicator
            if (this.nearResourceBuilding.resourceIndicator) {
                this.nearResourceBuilding.resourceIndicator.setVisible(false);
            }

            this.updateResourceBuildingUI();
            this.saveGame();
        } else {
            console.log('No bricks available yet. Wait for regeneration.');
        }
    }

    collectIncome(building) {
        let income = 0;

        // For apartments, collect from all rented units
        if (building.type === 'apartment' && building.units) {
            for (let unit of building.units) {
                if (unit.rented && unit.accumulatedIncome) {
                    income += unit.accumulatedIncome;
                    unit.accumulatedIncome = 0;
                }
            }
        } else {
            // For regular buildings (house, shop, restaurant)
            income = building.accumulatedIncome;
            building.accumulatedIncome = 0;
            building.lastIncomeTime = Date.now();
        }

        income = Math.floor(income);

        if (income > 0) {
            this.money += income;

            const buildingType = this.buildingTypes[building.type];
            console.log(`Collected $${income} from ${buildingType.name}! Total money: $${this.money}`);

            // Hide income indicator
            if (building.incomeIndicator) {
                building.incomeIndicator.setVisible(false);
            }

            this.saveGame();
        }
    }

    updateBuses() {
        const deltaTime = 1/60; // Approximate 60 FPS

        for (let bus of this.buses) {
            // Update bus position
            const distance = bus.speed * deltaTime;
            bus.x += distance * bus.direction;
            bus.container.x = bus.x;

            // Check if at a bus stop
            for (let i = 0; i < this.busStops.length; i++) {
                const stop = this.busStops[i];
                const distanceToStop = Math.abs(bus.x - stop.x);

                // If bus is near a stop and moving toward it
                if (distanceToStop < 50 && !bus.isAtStop) {
                    bus.isAtStop = true;
                    bus.stopTimer = 3; // Wait 3 seconds at stop
                    bus.currentStopIndex = i;

                    // Drop off passengers
                    const droppingOff = [];
                    for (let j = bus.passengers.length - 1; j >= 0; j--) {
                        const passenger = bus.passengers[j];
                        // Some passengers randomly get off at stops
                        if (Math.random() < 0.3 || passenger.targetStopIndex === i) {
                            // Remove from bus and place on street
                            bus.passengers.splice(j, 1);
                            passenger.citizen.container.setVisible(true);
                            passenger.citizen.x = stop.x + (Math.random() * 100 - 50);
                            passenger.citizen.container.x = passenger.citizen.x;
                            passenger.citizen.state = 'walking';
                        }
                    }

                    // Pick up waiting citizens
                    const waitingCitizens = stop.waitingCitizens.slice(); // Copy array
                    for (let citizen of waitingCitizens) {
                        if (bus.passengers.length < 20) { // Bus capacity
                            bus.passengers.push({
                                citizen: citizen,
                                targetStopIndex: Math.floor(Math.random() * this.busStops.length)
                            });
                            citizen.container.setVisible(false); // Hide citizen while on bus
                            citizen.state = 'riding';

                            // Remove from waiting list
                            const index = stop.waitingCitizens.indexOf(citizen);
                            if (index > -1) {
                                stop.waitingCitizens.splice(index, 1);
                            }
                        }
                    }
                }
            }

            // Handle stop timer
            if (bus.isAtStop) {
                bus.stopTimer -= deltaTime;
                if (bus.stopTimer <= 0) {
                    bus.isAtStop = false;
                }
            }

            // Reverse direction at ends of street
            if (bus.x > 11900) {
                bus.direction = -1;
                bus.container.setScale(-1, 1); // Flip bus sprite
            } else if (bus.x < 100) {
                bus.direction = 1;
                bus.container.setScale(1, 1); // Normal direction
            }
        }
    }

    updateCitizens() {
        const deltaTime = 1/60; // Approximate 60 FPS

        for (let citizen of this.citizens) {
            if (citizen.state === 'walking') {
                // Walk in current direction
                const distance = citizen.walkSpeed * deltaTime;
                citizen.x += distance * citizen.direction;
                citizen.container.x = citizen.x;

                // Randomly decide to go to a bus stop
                if (Math.random() < 0.001) { // 0.1% chance per frame
                    // Find nearest bus stop
                    let nearestStop = null;
                    let nearestDistance = Infinity;
                    for (let stop of this.busStops) {
                        const dist = Math.abs(citizen.x - stop.x);
                        if (dist < nearestDistance) {
                            nearestDistance = dist;
                            nearestStop = stop;
                        }
                    }

                    if (nearestStop) {
                        citizen.targetBusStop = nearestStop;
                        citizen.direction = citizen.x < nearestStop.x ? 1 : -1;
                    }
                }

                // Check if reached bus stop
                if (citizen.targetBusStop) {
                    const distanceToStop = Math.abs(citizen.x - citizen.targetBusStop.x);
                    if (distanceToStop < 30) {
                        // Arrived at bus stop
                        citizen.state = 'waiting';
                        citizen.waitTimer = 0;
                        citizen.targetBusStop.waitingCitizens.push(citizen);
                        citizen.targetBusStop = null;
                    }
                }

                // Randomly reverse direction at edges or randomly
                if (citizen.x > 11900 || citizen.x < 100 || Math.random() < 0.002) {
                    citizen.direction *= -1;
                }

                // Randomly visit nearby buildings (prioritize shops)
                if (Math.random() < 0.0005 && this.buildings.length > 0) {
                    // Find nearby shops that are open and have stock
                    const nearbyShops = this.buildings.filter(b =>
                        this.isShop(b.type) &&
                        Math.abs(b.x - citizen.x) < 800 &&
                        b.isOpen &&
                        b.inventory &&
                        b.inventory.stock >= b.inventory.salesPerCustomer
                    );

                    // If no shops available, visit any nearby building
                    let targetBuilding = null;
                    if (nearbyShops.length > 0) {
                        targetBuilding = nearbyShops[Math.floor(Math.random() * nearbyShops.length)];
                        citizen.isShoppingVisit = true;
                    } else {
                        const nearbyBuildings = this.buildings.filter(b =>
                            Math.abs(b.x - citizen.x) < 500
                        );
                        if (nearbyBuildings.length > 0) {
                            targetBuilding = nearbyBuildings[Math.floor(Math.random() * nearbyBuildings.length)];
                            citizen.isShoppingVisit = false;
                        }
                    }

                    if (targetBuilding) {
                        citizen.targetBuilding = targetBuilding;
                        citizen.direction = citizen.x < targetBuilding.x ? 1 : -1;
                    }
                }

                // Check if reached target building
                if (citizen.targetBuilding) {
                    const distanceToBuilding = Math.abs(citizen.x - citizen.targetBuilding.x);
                    if (distanceToBuilding < 50) {
                        // Arrived at building - start visit
                        citizen.state = 'visiting';
                        citizen.visitTimer = 5 + Math.random() * 10; // Visit for 5-15 seconds
                        citizen.container.setVisible(false); // Hide while inside building
                    }
                }
            } else if (citizen.state === 'waiting') {
                // Citizen is waiting at bus stop - just stand still
                citizen.waitTimer += deltaTime;

                // Small chance to give up waiting and start walking again
                if (citizen.waitTimer > 30 && Math.random() < 0.01) {
                    citizen.state = 'walking';
                    // Remove from bus stop waiting list
                    for (let stop of this.busStops) {
                        const index = stop.waitingCitizens.indexOf(citizen);
                        if (index > -1) {
                            stop.waitingCitizens.splice(index, 1);
                            break;
                        }
                    }
                }
            } else if (citizen.state === 'visiting') {
                // Citizen is inside a building
                citizen.visitTimer -= deltaTime;
                if (citizen.visitTimer <= 0) {
                    // Process shop purchase if this was a shopping visit
                    if (citizen.isShoppingVisit && citizen.targetBuilding && this.isShop(citizen.targetBuilding.type)) {
                        const shop = citizen.targetBuilding;
                        if (shop.inventory && shop.isOpen && shop.inventory.stock >= shop.inventory.salesPerCustomer) {
                            // Customer makes a purchase
                            shop.inventory.stock -= shop.inventory.salesPerCustomer;
                            const salePrice = shop.inventory.salesPerCustomer * 15; // $15 per unit sold
                            this.money += salePrice;
                            this.updateMoneyUI();

                            console.log(`Customer purchased from shop! Stock: ${shop.inventory.stock}, Income: $${salePrice}`);

                            // Update UI if player is currently viewing this shop
                            if (this.insideShop && this.currentShop === shop) {
                                this.updateShopInventoryUI();
                            }
                        }
                        citizen.isShoppingVisit = false;
                    }

                    // Finished visiting - come back out
                    citizen.state = 'walking';
                    citizen.container.setVisible(true);
                    if (citizen.targetBuilding) {
                        citizen.x = citizen.targetBuilding.x + (Math.random() * 100 - 50);
                        citizen.container.x = citizen.x;
                    }
                    citizen.targetBuilding = null;
                    citizen.direction = Math.random() > 0.5 ? 1 : -1;
                }
            } else if (citizen.state === 'riding') {
                // Citizen is on a bus - already handled in updateBuses
                // The bus will drop them off and change state back to walking
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
