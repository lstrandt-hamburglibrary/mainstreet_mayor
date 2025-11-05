export class EntertainmentSystem {
    constructor(scene) {
        this.scene = scene;
        this.entertainmentBuildings = [];

        // Tracking metrics by type
        this.metrics = {
            movieTheater: { visitors: 0, revenue: 0, screens: 0 },
            themePark: { visitors: 0, revenue: 0, rides: 0 },
            arcade: { visitors: 0, revenue: 0, machines: 0 }
        };

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 350;
        this.promptedUpgrades = new Set();
    }

    initializeBuilding(building, type) {
        if (type === 'movieTheater') {
            building.entertainmentData = {
                type: 'movieTheater',
                screens: 3,
                seatsPerScreen: 100,
                ticketPrice: 12,
                weeklyVisitors: 0,
                revenue: 0,
                features: [] // IMAX, 3D, etc.
            };
            this.metrics.movieTheater.screens += 3;
        } else if (type === 'themePark') {
            building.entertainmentData = {
                type: 'themePark',
                rides: ['Roller Coaster', 'Ferris Wheel', 'Bumper Cars'],
                admissionPrice: 25,
                weeklyVisitors: 0,
                revenue: 0,
                rating: 4.0
            };
            this.metrics.themePark.rides += 3;
        } else if (type === 'arcade') {
            building.entertainmentData = {
                type: 'arcade',
                machines: 15,
                tokenPrice: 1,
                weeklyVisitors: 0,
                revenue: 0,
                hasRedemptionGames: false
            };
            this.metrics.arcade.machines += 15;
        }

        this.entertainmentBuildings.push(building);
    }

    trackVisit(building) {
        if (!building.entertainmentData) return;

        const data = building.entertainmentData;
        data.weeklyVisitors++;

        let revenue = 0;
        if (data.type === 'movieTheater') {
            revenue = data.ticketPrice;
            this.metrics.movieTheater.visitors++;
        } else if (data.type === 'themePark') {
            revenue = data.admissionPrice;
            this.metrics.themePark.visitors++;
        } else if (data.type === 'arcade') {
            revenue = Math.floor(Math.random() * 20) + 5; // $5-$25 per visit
            this.metrics.arcade.visitors++;
        }

        data.revenue += revenue;
        this.metrics[data.type].revenue += revenue;
        this.scene.money += revenue;
    }

    checkMilestones() {
        if (this.entertainmentBuildings.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        for (let building of this.entertainmentBuildings) {
            if (!building.entertainmentData) continue;

            const data = building.entertainmentData;
            const buildingId = this.entertainmentBuildings.indexOf(building);

            // MOVIE THEATER MILESTONES
            if (data.type === 'movieTheater') {
                // Suggest adding screens
                if (data.screens < 12 &&
                    data.weeklyVisitors > data.screens * 40 &&
                    !this.promptedUpgrades.has(`screens-${buildingId}-${data.screens}`)) {

                    this.showUpgradePrompt(
                        '🎬 Expand Theater!',
                        `Movie theater is packed! Add 2 more screens to handle demand?`,
                        3000,
                        () => this.addScreens(building)
                    );
                    this.promptedUpgrades.add(`screens-${buildingId}-${data.screens}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }

                // Suggest premium features
                if (data.features.length === 0 &&
                    data.revenue > 2000 &&
                    !this.promptedUpgrades.has(`imax-${buildingId}`)) {

                    this.showUpgradePrompt(
                        '🎬 Premium Theater!',
                        `Install IMAX or premium features to attract more customers and charge higher prices?`,
                        5000,
                        () => this.addTheaterFeatures(building)
                    );
                    this.promptedUpgrades.add(`imax-${buildingId}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }

            // THEME PARK MILESTONES
            if (data.type === 'themePark') {
                // Suggest adding rides
                if (data.rides.length < 10 &&
                    data.weeklyVisitors > data.rides.length * 30 &&
                    !this.promptedUpgrades.has(`ride-${buildingId}-${data.rides.length}`)) {

                    const newRides = [
                        'Log Flume',
                        'Haunted House',
                        'Go Karts',
                        'Drop Tower',
                        'Carousel',
                        'Spinning Teacups',
                        'Pirate Ship'
                    ];

                    const availableRides = newRides.filter(r => !data.rides.includes(r));
                    if (availableRides.length > 0) {
                        const newRide = availableRides[0];

                        this.showUpgradePrompt(
                            '🎡 New Attraction!',
                            `Theme park is thriving! Add "${newRide}" to give visitors more to do?`,
                            2000,
                            () => this.addRide(building, newRide)
                        );
                        this.promptedUpgrades.add(`ride-${buildingId}-${data.rides.length}`);
                        this.lastUpgradePrompt = currentTime;
                        return;
                    }
                }
            }

            // ARCADE MILESTONES
            if (data.type === 'arcade') {
                // Suggest adding machines
                if (data.machines < 50 &&
                    data.weeklyVisitors > data.machines * 3 &&
                    !this.promptedUpgrades.has(`machines-${buildingId}-${data.machines}`)) {

                    this.showUpgradePrompt(
                        '🕹️ More Machines!',
                        `Arcade is crowded! Add 10 more arcade machines to accommodate players?`,
                        800,
                        () => this.addMachines(building)
                    );
                    this.promptedUpgrades.add(`machines-${buildingId}-${data.machines}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }

                // Suggest redemption games
                if (!data.hasRedemptionGames &&
                    data.revenue > 1000 &&
                    !this.promptedUpgrades.has(`redemption-${buildingId}`)) {

                    this.showUpgradePrompt(
                        '🎟️ Prize Games!',
                        `Add redemption games and a prize counter to increase revenue and attract families?`,
                        600,
                        () => this.addRedemptionGames(building)
                    );
                    this.promptedUpgrades.add(`redemption-${buildingId}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }

            // Revenue milestones for all types
            const revenueMilestones = [2000, 5000, 10000];
            for (let milestone of revenueMilestones) {
                if (data.revenue >= milestone &&
                    !this.promptedUpgrades.has(`revenue-${buildingId}-${milestone}`)) {

                    const icons = {
                        movieTheater: '🎬',
                        themePark: '🎡',
                        arcade: '🕹️'
                    };

                    this.showInfoPopup(
                        `${icons[data.type]} Entertainment Success!`,
                        `This ${data.type.replace(/([A-Z])/g, ' $1').toLowerCase()} has generated $${data.revenue} in revenue!`
                    );
                    this.promptedUpgrades.add(`revenue-${buildingId}-${milestone}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }
        }
    }

    addScreens(building) {
        building.entertainmentData.screens += 2;
        this.metrics.movieTheater.screens += 2;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎬 Added 2 screens! Total: ${building.entertainmentData.screens}`);
        }
    }

    addTheaterFeatures(building) {
        building.entertainmentData.features.push('IMAX', '3D', 'Premium Seating');
        building.entertainmentData.ticketPrice += 5;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎬 Premium features installed!`);
        }
    }

    addRide(building, rideName) {
        building.entertainmentData.rides.push(rideName);
        this.metrics.themePark.rides++;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎡 New ride: ${rideName}!`);
        }
    }

    addMachines(building) {
        building.entertainmentData.machines += 10;
        this.metrics.arcade.machines += 10;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🕹️ Added 10 arcade machines! Total: ${building.entertainmentData.machines}`);
        }
    }

    addRedemptionGames(building) {
        building.entertainmentData.hasRedemptionGames = true;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎟️ Prize counter and redemption games added!`);
        }
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0xFF00FF, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FF00FF',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        const messageText = this.scene.add.text(0, -30, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        const costText = this.scene.add.text(0, 30, `Cost: $${cost}`, {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4CAF50'
        });
        costText.setOrigin(0.5);
        popup.add(costText);

        const acceptBtn = this.createPopupButton(popup, -80, 80, '✓ Expand', () => {
            if (this.scene.money >= cost) {
                this.scene.money -= cost;
                onAccept();
                popup.destroy();
            } else {
                if (this.scene.uiManager) {
                    this.scene.uiManager.addNotification(`❌ Not enough money! Need $${cost}`);
                }
            }
        }, '#4CAF50');

        const declineBtn = this.createPopupButton(popup, 80, 80, '✗ Not Now', () => {
            popup.destroy();
        }, '#F44336');

        this.scene.time.delayedCall(10000, () => {
            if (popup && popup.active) {
                popup.destroy();
            }
        });
    }

    showInfoPopup(title, message) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -100, 500, 200, 10);
        bg.lineStyle(3, 0xFF00FF, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FF00FF',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        const messageText = this.scene.add.text(0, -10, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        const okBtn = this.createPopupButton(popup, 0, 60, '✓ OK', () => {
            popup.destroy();
        }, '#4CAF50');

        this.scene.time.delayedCall(8000, () => {
            if (popup && popup.active) {
                popup.destroy();
            }
        });
    }

    createPopupButton(container, x, y, text, onClick, color = '#4CAF50') {
        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        const colorValue = parseInt(color.replace('#', ''), 16);
        bg.fillStyle(colorValue, 1);
        bg.fillRoundedRect(-70, -18, 140, 36, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-70, -18, 140, 36, 5);
        btn.add(bg);

        const label = this.scene.add.text(0, 0, text, {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        btn.add(label);

        btn.setInteractive(
            new Phaser.Geom.Rectangle(-70, -18, 140, 36),
            Phaser.Geom.Rectangle.Contains
        );
        btn.on('pointerdown', onClick);
        btn.on('pointerover', () => bg.setAlpha(0.8));
        btn.on('pointerout', () => bg.setAlpha(1));

        container.add(btn);
        return btn;
    }
}
