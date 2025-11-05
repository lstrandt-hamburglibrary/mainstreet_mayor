export class MuseumSystem {
    constructor(scene) {
        this.scene = scene;
        this.museums = [];

        // Tracking metrics
        this.totalVisitors = 0;
        this.totalRevenue = 0;
        this.exhibitsCount = 0;

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 350;
        this.promptedUpgrades = new Set();
    }

    initializeMuseum(building) {
        building.museumData = {
            exhibits: ['Ancient History', 'Natural Science', 'Art Gallery'], // Starting exhibits
            specialExhibits: [],
            admissionFee: 10,
            weeklyVisitors: 0,
            revenue: 0,
            rating: 3.5, // Out of 5
            hasGiftShop: false,
            tourismBonus: 0
        };

        this.museums.push(building);
        this.exhibitsCount = building.museumData.exhibits.length;
    }

    trackVisit(building, isTourist = false) {
        if (!building.museumData) {
            this.initializeMuseum(building);
        }

        building.museumData.weeklyVisitors++;
        this.totalVisitors++;

        // Collect admission fee
        const fee = building.museumData.admissionFee;
        this.totalRevenue += fee;
        building.museumData.revenue += fee;
        this.scene.money += fee;

        // Gift shop revenue if available
        if (building.museumData.hasGiftShop && Math.random() < 0.4) {
            const giftShopRevenue = Math.floor(Math.random() * 20) + 5;
            this.totalRevenue += giftShopRevenue;
            building.museumData.revenue += giftShopRevenue;
            this.scene.money += giftShopRevenue;
        }

        // Tourists boost rating
        if (isTourist) {
            building.museumData.tourismBonus += 0.01;
        }
    }

    checkMilestones() {
        if (this.museums.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        for (let museum of this.museums) {
            if (!museum.museumData) continue;

            const museumId = this.museums.indexOf(museum);

            // Suggest new exhibit when museum is popular
            if (museum.museumData.exhibits.length < 10 &&
                museum.museumData.weeklyVisitors > 50 + (museum.museumData.exhibits.length * 20) &&
                !this.promptedUpgrades.has(`exhibit-${museumId}-${museum.museumData.exhibits.length}`)) {

                const exhibitOptions = [
                    'Modern Art Collection',
                    'Dinosaur Fossils',
                    'Space & Astronomy',
                    'Local History',
                    'World Cultures',
                    'Technology & Innovation',
                    'Photography Gallery',
                    'Sculpture Garden'
                ];

                const newExhibit = exhibitOptions[Math.floor(Math.random() * exhibitOptions.length)];

                this.showUpgradePrompt(
                    '🏛️ New Exhibit!',
                    `Museum is attracting crowds! Acquire "${newExhibit}" exhibit to draw even more visitors?`,
                    600,
                    () => this.addExhibit(museum, newExhibit)
                );
                this.promptedUpgrades.add(`exhibit-${museumId}-${museum.museumData.exhibits.length}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest gift shop when museum is established
            if (!museum.museumData.hasGiftShop &&
                this.totalVisitors > 200 &&
                !this.promptedUpgrades.has(`giftshop-${museumId}`)) {

                this.showUpgradePrompt(
                    '🎁 Museum Gift Shop!',
                    `The museum has many visitors! Add a gift shop to generate additional revenue from merchandise sales?`,
                    250,
                    () => this.addGiftShop(museum)
                );
                this.promptedUpgrades.add(`giftshop-${museumId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest facility upgrade when rating could improve
            if (museum.museumData.rating < 4.5 &&
                museum.museumData.revenue > 2000 &&
                !this.promptedUpgrades.has(`renovation-${museumId}`)) {

                this.showUpgradePrompt(
                    '🏛️ Museum Renovation!',
                    `Invest in facility upgrades to improve the visitor experience and museum rating?`,
                    500,
                    () => this.renovateFacilities(museum)
                );
                this.promptedUpgrades.add(`renovation-${museumId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Celebrate revenue milestones
            const revenueMilestones = [1000, 2500, 5000, 10000];
            for (let milestone of revenueMilestones) {
                if (museum.museumData.revenue >= milestone &&
                    !this.promptedUpgrades.has(`revenue-${museumId}-${milestone}`)) {

                    this.showInfoPopup(
                        '🏛️ Museum Success!',
                        `The museum has generated $${museum.museumData.revenue} in revenue from ${museum.museumData.weeklyVisitors} visitors!`
                    );
                    this.promptedUpgrades.add(`revenue-${museumId}-${milestone}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }

            // Suggest special event when tourism is high
            if (museum.museumData.specialExhibits.length === 0 &&
                museum.museumData.tourismBonus > 1.0 &&
                !this.promptedUpgrades.has(`special-${museumId}`)) {

                this.showUpgradePrompt(
                    '🎨 Special Exhibition!',
                    `The museum attracts tourists from far and wide! Host a temporary special exhibition to capitalize on this interest?`,
                    300,
                    () => this.hostSpecialExhibit(museum)
                );
                this.promptedUpgrades.add(`special-${museumId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }
        }
    }

    addExhibit(museum, exhibitName) {
        museum.museumData.exhibits.push(exhibitName);
        this.exhibitsCount++;
        museum.museumData.rating += 0.1;

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🏛️ New exhibit: ${exhibitName}!`);
        }
    }

    addGiftShop(museum) {
        museum.museumData.hasGiftShop = true;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎁 Museum gift shop opened!`);
        }
    }

    renovateFacilities(museum) {
        museum.museumData.rating = Math.min(5.0, museum.museumData.rating + 0.5);
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`✨ Museum renovated! Rating: ${museum.museumData.rating.toFixed(1)}/5`);
        }
    }

    hostSpecialExhibit(museum) {
        const specialExhibits = [
            'Treasures of Ancient Egypt',
            'Impressionist Masters',
            'Mars Rover Experience',
            'Medieval Armor & Weapons'
        ];
        const exhibit = specialExhibits[Math.floor(Math.random() * specialExhibits.length)];
        museum.museumData.specialExhibits.push(exhibit);

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🎨 Special exhibition: ${exhibit}!`);
        }
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0xD4AF37, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#D4AF37',
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

        const acceptBtn = this.createPopupButton(popup, -80, 80, '✓ Invest', () => {
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
        bg.lineStyle(3, 0xD4AF37, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#D4AF37',
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
