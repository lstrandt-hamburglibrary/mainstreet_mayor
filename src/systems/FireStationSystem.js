export class FireStationSystem {
    constructor(scene) {
        this.scene = scene;
        this.fireStations = [];

        // City-wide fire safety metrics
        this.fireSafetyRating = 75; // Out of 100
        this.recentIncidents = [];
        this.totalIncidentsResponded = 0;
        this.averageResponseTime = 4.5; // minutes
    }

    initializeFireStation(building) {
        building.fireStationData = {
            staff: 12, // Number of firefighters
            trucks: 2,
            equipment: 'Standard',
            trainingLevel: 'Basic',
            monthlyDrills: 4,
            lastInspection: this.scene.gameTime || 0,
            responseTimes: [] // Track response times
        };

        this.fireStations.push(building);
        this.updateFireSafetyRating();
    }

    updateFireSafetyRating() {
        // Base rating
        let rating = 50;

        // More fire stations = better coverage
        rating += Math.min(this.fireStations.length * 15, 30);

        // Check equipment and training levels
        for (let station of this.fireStations) {
            if (station.fireStationData) {
                if (station.fireStationData.equipment === 'Advanced') rating += 5;
                if (station.fireStationData.trainingLevel === 'Advanced') rating += 5;
            }
        }

        // Recent incidents lower rating temporarily
        const recentBadIncidents = this.recentIncidents.filter(i => i.responseTime > 6).length;
        rating -= recentBadIncidents * 3;

        this.fireSafetyRating = Math.max(0, Math.min(100, rating));
    }

    showFireStationUI(building) {
        if (!building.fireStationData) {
            this.initializeFireStation(building);
        }
        const data = building.fireStationData;

        // Create UI
        const ui = this.scene.add.container(400, 150);
        ui.setDepth(1001);
        ui.setScrollFactor(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.95);
        bg.fillRoundedRect(0, 0, 800, 500, 10);
        bg.lineStyle(3, 0xD32F2F, 1);
        bg.strokeRoundedRect(0, 0, 800, 500, 10);
        ui.add(bg);

        // Title
        const title = this.scene.add.text(400, 20, '🚒 FIRE STATION', {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#D32F2F',
            align: 'center'
        });
        title.setOrigin(0.5, 0);
        ui.add(title);

        // City Fire Safety Rating
        const ratingColor = this.fireSafetyRating >= 80 ? '#4CAF50' :
                           this.fireSafetyRating >= 60 ? '#FFC107' : '#F44336';
        const rating = this.scene.add.text(400, 70,
            `CITY FIRE SAFETY: ${this.fireSafetyRating}/100`, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: ratingColor
        });
        rating.setOrigin(0.5, 0);
        ui.add(rating);

        // Station Info
        let yPos = 120;
        const stationInfo = [
            `👨‍🚒 Firefighters: ${data.staff}`,
            `🚒 Fire Trucks: ${data.trucks}`,
            `🔧 Equipment: ${data.equipment}`,
            `📚 Training: ${data.trainingLevel}`,
            `⏱️ Avg Response Time: ${this.averageResponseTime.toFixed(1)} min`,
            `🔥 Incidents Responded: ${this.totalIncidentsResponded}`
        ];

        for (let info of stationInfo) {
            const text = this.scene.add.text(50, yPos, info, {
                fontSize: '20px',
                color: '#ffffff'
            });
            ui.add(text);
            yPos += 35;
        }

        // Upgrade Buttons
        yPos = 340;
        const upgrades = [
            {
                label: '⬆️ Upgrade Equipment ($5,000)',
                cost: 5000,
                action: () => this.upgradeEquipment(building, ui)
            },
            {
                label: '📚 Advanced Training ($3,000)',
                cost: 3000,
                action: () => this.upgradeTraining(building, ui)
            },
            {
                label: '🚒 Buy Fire Truck ($8,000)',
                cost: 8000,
                action: () => this.buyFireTruck(building, ui)
            }
        ];

        for (let upgrade of upgrades) {
            this.createButton(ui, 400, yPos, upgrade.label, () => {
                if (this.scene.money >= upgrade.cost) {
                    upgrade.action();
                } else {
                    alert(`Not enough money! Need $${upgrade.cost}`);
                }
            });
            yPos += 45;
        }

        // Close button
        this.createButton(ui, 400, 468, '✖ CLOSE', () => {
            console.log('Fire station close clicked');
            ui.destroy();
        });

        // ESC key support
        const escKey = this.scene.input.keyboard.addKey('ESC');
        const escHandler = () => {
            ui.destroy();
            escKey.off('down', escHandler);
        };
        escKey.on('down', escHandler);

        this.scene.currentUI = ui;
    }

    upgradeEquipment(building, ui) {
        if (building.fireStationData.equipment === 'Advanced') {
            alert('Equipment is already at maximum level!');
            return;
        }

        this.scene.money -= 5000;
        building.fireStationData.equipment = 'Advanced';
        this.updateFireSafetyRating();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('🔧 Fire station equipment upgraded!');
        }

        ui.destroy();
        this.showFireStationUI(building);
    }

    upgradeTraining(building, ui) {
        if (building.fireStationData.trainingLevel === 'Advanced') {
            alert('Training is already at maximum level!');
            return;
        }

        this.scene.money -= 3000;
        building.fireStationData.trainingLevel = 'Advanced';
        this.averageResponseTime = Math.max(2.0, this.averageResponseTime - 1.5);
        this.updateFireSafetyRating();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('📚 Firefighters received advanced training!');
        }

        ui.destroy();
        this.showFireStationUI(building);
    }

    buyFireTruck(building, ui) {
        if (building.fireStationData.trucks >= 5) {
            alert('Maximum fire trucks reached!');
            return;
        }

        this.scene.money -= 8000;
        building.fireStationData.trucks++;
        this.updateFireSafetyRating();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('🚒 New fire truck purchased!');
        }

        ui.destroy();
        this.showFireStationUI(building);
    }

    createButton(container, x, y, text, onClick, color = '#D32F2F') {
        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        const colorValue = parseInt(color.replace('#', ''), 16);
        bg.fillStyle(colorValue, 1);
        bg.fillRoundedRect(-180, -18, 360, 36, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-180, -18, 360, 36, 5);
        btn.add(bg);

        const label = this.scene.add.text(0, 0, text, {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        btn.add(label);

        btn.setInteractive(
            new Phaser.Geom.Rectangle(-180, -18, 360, 36),
            Phaser.Geom.Rectangle.Contains
        );
        btn.on('pointerdown', onClick);
        btn.on('pointerover', () => bg.setAlpha(0.8));
        btn.on('pointerout', () => bg.setAlpha(1));

        container.add(btn);
        return btn;
    }
}
