export class PoliceStationSystem {
    constructor(scene) {
        this.scene = scene;
        this.policeStations = [];

        // City-wide safety metrics
        this.crimeRate = 25; // Lower is better (out of 100)
        this.recentCrimes = [];
        this.totalCrimesResponded = 0;
        this.averageResponseTime = 5.0; // minutes

        // Milestone tracking to avoid spam
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 300; // Game time units between prompts
        this.promptedUpgrades = new Set(); // Track what we've already prompted for
    }

    initializePoliceStation(building) {
        building.policeStationData = {
            officers: 15, // Number of police officers
            vehicles: 3, // Police cars
            equipment: 'Standard',
            trainingLevel: 'Basic',
            communityPrograms: 0, // Number of active community programs
            lastPatrol: this.scene.gameTime || 0,
            arrestsMade: 0
        };

        this.policeStations.push(building);
        this.updateCrimeRate();
    }

    updateCrimeRate() {
        // Base crime rate (higher population = more crime potential)
        let crimeRate = 40;

        // More police stations = lower crime
        crimeRate -= Math.min(this.policeStations.length * 12, 25);

        // Check equipment and training levels
        for (let station of this.policeStations) {
            if (station.policeStationData) {
                if (station.policeStationData.equipment === 'Advanced') crimeRate -= 5;
                if (station.policeStationData.trainingLevel === 'Advanced') crimeRate -= 5;
                crimeRate -= station.policeStationData.communityPrograms * 2;
            }
        }

        this.crimeRate = Math.max(0, Math.min(100, crimeRate));
    }

    checkMilestones() {
        if (this.policeStations.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        // Check each police station for upgrade opportunities
        for (let station of this.policeStations) {
            if (!station.policeStationData) continue;

            const stationId = station.id || this.policeStations.indexOf(station);

            // Suggest equipment upgrade if crime rate is high
            if (station.policeStationData.equipment === 'Standard' &&
                this.crimeRate > 35 &&
                !this.promptedUpgrades.has(`equipment-${stationId}`)) {

                this.showUpgradePrompt(
                    '👮 Crime Alert!',
                    `Crime rate is high (${this.crimeRate}/100). Upgrade police equipment to improve law enforcement?`,
                    6000,
                    () => this.upgradeEquipment(station, null)
                );
                this.promptedUpgrades.add(`equipment-${stationId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest training upgrade if response times are slow
            if (station.policeStationData.trainingLevel === 'Basic' &&
                this.averageResponseTime > 6 &&
                !this.promptedUpgrades.has(`training-${stationId}`)) {

                this.showUpgradePrompt(
                    '📚 Training Needed!',
                    `Police response time is ${this.averageResponseTime.toFixed(1)} minutes. Upgrade officer training to improve response times?`,
                    4000,
                    () => this.upgradeTraining(station, null)
                );
                this.promptedUpgrades.add(`training-${stationId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest additional police car if population is high
            if (station.policeStationData.vehicles < 6 &&
                population > 60 + (station.policeStationData.vehicles * 25) &&
                !this.promptedUpgrades.has(`car-${stationId}-${station.policeStationData.vehicles}`)) {

                this.showUpgradePrompt(
                    '🚔 More Patrols Needed!',
                    `Population has grown to ${population}. Purchase an additional police car for better patrol coverage?`,
                    7000,
                    () => this.buyPoliceCar(station, null)
                );
                this.promptedUpgrades.add(`car-${stationId}-${station.policeStationData.vehicles}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest community program if crime rate is moderate and no programs yet
            if (station.policeStationData.communityPrograms === 0 &&
                this.crimeRate > 25 && this.crimeRate < 50 &&
                population > 40 &&
                !this.promptedUpgrades.has(`program-${stationId}-0`)) {

                this.showUpgradePrompt(
                    '🤝 Community Engagement!',
                    `Start a community program to reduce crime through prevention and outreach?`,
                    2500,
                    () => this.startCommunityProgram(station, null)
                );
                this.promptedUpgrades.add(`program-${stationId}-0`);
                this.lastUpgradePrompt = currentTime;
                return;
            }
        }
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        // Create popup
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0x1976D2, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        // Title
        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1976D2',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        // Message
        const messageText = this.scene.add.text(0, -30, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        // Cost display
        const costText = this.scene.add.text(0, 30, `Cost: $${cost}`, {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4CAF50'
        });
        costText.setOrigin(0.5);
        popup.add(costText);

        // Accept button
        const acceptBtn = this.createPopupButton(popup, -80, 80, '✓ Upgrade', () => {
            if (this.scene.money >= cost) {
                onAccept();
                popup.destroy();
            } else {
                if (this.scene.uiManager) {
                    this.scene.uiManager.addNotification(`❌ Not enough money! Need $${cost}`);
                }
            }
        }, '#4CAF50');

        // Decline button
        const declineBtn = this.createPopupButton(popup, 80, 80, '✗ Not Now', () => {
            popup.destroy();
        }, '#F44336');

        // Auto-close after 10 seconds
        this.scene.time.delayedCall(10000, () => {
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

    showPoliceStationUI(building) {
        if (!building.policeStationData) {
            this.initializePoliceStation(building);
        }
        const data = building.policeStationData;

        // Create UI
        const ui = this.scene.add.container(400, 100);
        ui.setDepth(1001);
        ui.setScrollFactor(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.95);
        bg.fillRoundedRect(0, 0, 800, 550, 10);
        bg.lineStyle(3, 0x1976D2, 1);
        bg.strokeRoundedRect(0, 0, 800, 550, 10);
        ui.add(bg);

        // Title
        const title = this.scene.add.text(400, 20, '👮 POLICE STATION', {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1976D2',
            align: 'center'
        });
        title.setOrigin(0.5, 0);
        ui.add(title);

        // Crime Rate
        const crimeColor = this.crimeRate <= 20 ? '#4CAF50' :
                          this.crimeRate <= 40 ? '#FFC107' : '#F44336';
        const rating = this.scene.add.text(400, 70,
            `CITY CRIME RATE: ${this.crimeRate}/100`, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: crimeColor
        });
        rating.setOrigin(0.5, 0);
        ui.add(rating);

        const safetyText = this.crimeRate <= 20 ? '(Very Safe)' :
                          this.crimeRate <= 40 ? '(Safe)' : '(Needs Improvement)';
        const subtext = this.scene.add.text(400, 100, safetyText, {
            fontSize: '16px',
            color: crimeColor,
            fontStyle: 'italic'
        });
        subtext.setOrigin(0.5, 0);
        ui.add(subtext);

        // Station Info
        let yPos = 140;
        const stationInfo = [
            `👮 Police Officers: ${data.officers}`,
            `🚔 Police Vehicles: ${data.vehicles}`,
            `🔧 Equipment: ${data.equipment}`,
            `📚 Training: ${data.trainingLevel}`,
            `🤝 Community Programs: ${data.communityPrograms}`,
            `⏱️ Avg Response Time: ${this.averageResponseTime.toFixed(1)} min`,
            `⚖️ Total Cases: ${this.totalCrimesResponded}`
        ];

        for (let info of stationInfo) {
            const text = this.scene.add.text(50, yPos, info, {
                fontSize: '18px',
                color: '#ffffff'
            });
            ui.add(text);
            yPos += 32;
        }

        // Upgrade Buttons
        yPos = 350;
        const upgrades = [
            {
                label: '⬆️ Upgrade Equipment ($6,000)',
                cost: 6000,
                action: () => this.upgradeEquipment(building, ui)
            },
            {
                label: '📚 Advanced Training ($4,000)',
                cost: 4000,
                action: () => this.upgradeTraining(building, ui)
            },
            {
                label: '🚔 Buy Police Car ($7,000)',
                cost: 7000,
                action: () => this.buyPoliceCar(building, ui)
            },
            {
                label: '🤝 Start Community Program ($2,500)',
                cost: 2500,
                action: () => this.startCommunityProgram(building, ui)
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
            yPos += 40;
        }

        // Close button
        this.createButton(ui, 400, 510, '✖ CLOSE', () => {
            console.log('Police station close clicked');
            ui.destroy();
        }, 200, '#D32F2F');

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
        if (building.policeStationData.equipment === 'Advanced') {
            alert('Equipment is already at maximum level!');
            return;
        }

        this.scene.money -= 6000;
        building.policeStationData.equipment = 'Advanced';
        this.updateCrimeRate();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('🔧 Police equipment upgraded!');
        }

        ui.destroy();
        this.showPoliceStationUI(building);
    }

    upgradeTraining(building, ui) {
        if (building.policeStationData.trainingLevel === 'Advanced') {
            alert('Training is already at maximum level!');
            return;
        }

        this.scene.money -= 4000;
        building.policeStationData.trainingLevel = 'Advanced';
        this.averageResponseTime = Math.max(2.0, this.averageResponseTime - 1.0);
        this.updateCrimeRate();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('📚 Officers received advanced training!');
        }

        ui.destroy();
        this.showPoliceStationUI(building);
    }

    buyPoliceCar(building, ui) {
        if (building.policeStationData.vehicles >= 6) {
            alert('Maximum police vehicles reached!');
            return;
        }

        this.scene.money -= 7000;
        building.policeStationData.vehicles++;
        this.updateCrimeRate();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('🚔 New police car added to the fleet!');
        }

        ui.destroy();
        this.showPoliceStationUI(building);
    }

    startCommunityProgram(building, ui) {
        if (building.policeStationData.communityPrograms >= 5) {
            alert('Maximum community programs running!');
            return;
        }

        this.scene.money -= 2500;
        building.policeStationData.communityPrograms++;
        this.updateCrimeRate();

        const programNames = [
            'Neighborhood Watch',
            'Youth Outreach',
            'Safety Education',
            'Community Patrols',
            'Crime Prevention'
        ];
        const programName = programNames[building.policeStationData.communityPrograms - 1];

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🤝 Started: ${programName}`);
        }

        ui.destroy();
        this.showPoliceStationUI(building);
    }

    createButton(container, x, y, text, onClick, width = 360, color = '#1976D2') {
        const btn = this.scene.add.container(x, y);

        const halfWidth = width / 2;
        const bg = this.scene.add.graphics();
        const colorValue = parseInt(color.replace('#', ''), 16);
        bg.fillStyle(colorValue, 1);
        bg.fillRoundedRect(-halfWidth, -16, width, 32, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-halfWidth, -16, width, 32, 5);
        btn.add(bg);

        const label = this.scene.add.text(0, 0, text, {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        btn.add(label);

        btn.setInteractive(
            new Phaser.Geom.Rectangle(-halfWidth, -16, width, 32),
            Phaser.Geom.Rectangle.Contains
        );
        btn.on('pointerdown', onClick);
        btn.on('pointerover', () => bg.setAlpha(0.8));
        btn.on('pointerout', () => bg.setAlpha(1));

        container.add(btn);
        return btn;
    }
}
