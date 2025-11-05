export class LibrarySystem {
    constructor(scene) {
        this.scene = scene;
        this.libraries = [];

        // Tracking metrics
        this.totalVisitors = 0;
        this.totalLateFees = 0;
        this.booksCirculated = 0;

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 350;
        this.promptedUpgrades = new Set();
    }

    initializeLibrary(building) {
        building.libraryData = {
            books: 1000, // Starting collection
            computers: 2,
            studyRooms: 0,
            programs: [], // Reading programs, book clubs, etc.
            level: 1, // 1-3 scale
            weeklyVisitors: 0,
            revenue: 0
        };

        this.libraries.push(building);
    }

    trackVisit(building) {
        if (!building.libraryData) {
            this.initializeLibrary(building);
        }

        building.libraryData.weeklyVisitors++;
        this.totalVisitors++;

        // Chance of late fee
        if (Math.random() < 0.15) {
            const fee = 5;
            this.totalLateFees += fee;
            building.libraryData.revenue += fee;
            this.scene.money += fee;
        }

        // Track book circulation
        if (Math.random() < 0.7) {
            this.booksCirculated++;
        }
    }

    checkMilestones() {
        if (this.libraries.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        for (let library of this.libraries) {
            if (!library.libraryData) continue;

            const libraryId = this.libraries.indexOf(library);

            // Suggest digital upgrade when population is high
            if (library.libraryData.computers < 10 &&
                population > 40 + (library.libraryData.computers * 10) &&
                !this.promptedUpgrades.has(`computers-${libraryId}-${library.libraryData.computers}`)) {

                this.showUpgradePrompt(
                    '📖 Library Upgrade!',
                    `Library is getting crowded! Add ${library.libraryData.computers < 5 ? 'more' : 'additional'} computers for digital resources and research?`,
                    400,
                    () => this.upgradeComputers(library)
                );
                this.promptedUpgrades.add(`computers-${libraryId}-${library.libraryData.computers}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest expanding book collection
            if (library.libraryData.books < 5000 &&
                this.booksCirculated > 200 + (library.libraryData.books / 5) &&
                !this.promptedUpgrades.has(`books-${libraryId}`)) {

                this.showUpgradePrompt(
                    '📚 Expand Collection!',
                    `Books are flying off the shelves! Expand the library collection with new titles and genres?`,
                    250,
                    () => this.expandCollection(library)
                );
                this.promptedUpgrades.add(`books-${libraryId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest study rooms when library is popular
            if (library.libraryData.studyRooms === 0 &&
                library.libraryData.weeklyVisitors > 100 &&
                !this.promptedUpgrades.has(`study-${libraryId}`)) {

                this.showUpgradePrompt(
                    '📖 Add Study Rooms!',
                    `The library is very popular! Add private study rooms for students and researchers?`,
                    500,
                    () => this.addStudyRooms(library)
                );
                this.promptedUpgrades.add(`study-${libraryId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Celebrate visitor milestones
            const visitorMilestones = [500, 1000, 2500, 5000];
            for (let milestone of visitorMilestones) {
                if (this.totalVisitors >= milestone &&
                    !this.promptedUpgrades.has(`visitors-${milestone}`)) {

                    this.showInfoPopup(
                        '📖 Library Success!',
                        `The library has welcomed ${this.totalVisitors} visitors! ${this.booksCirculated} books have been checked out.`
                    );
                    this.promptedUpgrades.add(`visitors-${milestone}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }
        }
    }

    upgradeComputers(library) {
        library.libraryData.computers += 3;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`💻 Added 3 computers to library!`);
        }
    }

    expandCollection(library) {
        library.libraryData.books += 1000;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`📚 Library collection expanded by 1,000 books!`);
        }
    }

    addStudyRooms(library) {
        library.libraryData.studyRooms = 3;
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`📖 Added study rooms to library!`);
        }
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0x8B4513, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#8B4513',
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

        const acceptBtn = this.createPopupButton(popup, -80, 80, '✓ Upgrade', () => {
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
        bg.lineStyle(3, 0x8B4513, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#8B4513',
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
