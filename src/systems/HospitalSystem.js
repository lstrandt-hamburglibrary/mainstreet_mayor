export class HospitalSystem {
    constructor(scene) {
        this.scene = scene;
        this.hospitals = [];

        // Tracking metrics
        this.totalPatients = 0;
        this.emergencyResponses = 0;
        this.cityHealthRating = 85; // Out of 100

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 350;
        this.promptedUpgrades = new Set();
    }

    initializeHospital(building) {
        building.hospitalData = {
            doctors: 10,
            nurses: 20,
            beds: 50,
            equipment: 'Standard', // Standard or Advanced
            emergencyDepartment: true,
            specialties: ['General Medicine'], // Can add more
            weeklyPatients: 0,
            level: 1 // 1-3
        };

        this.hospitals.push(building);
        this.updateHealthRating();
    }

    updateHealthRating() {
        let rating = 60;

        // More hospitals = better health coverage
        rating += Math.min(this.hospitals.length * 15, 25);

        // Check equipment and capacity
        for (let hospital of this.hospitals) {
            if (hospital.hospitalData) {
                if (hospital.hospitalData.equipment === 'Advanced') rating += 5;
                rating += Math.min(hospital.hospitalData.specialties.length * 2, 10);
            }
        }

        this.cityHealthRating = Math.max(0, Math.min(100, rating));
    }

    checkMilestones() {
        if (this.hospitals.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        for (let hospital of this.hospitals) {
            if (!hospital.hospitalData) continue;

            const hospitalId = this.hospitals.indexOf(hospital);

            // Suggest equipment upgrade if health rating is low
            if (hospital.hospitalData.equipment === 'Standard' &&
                this.cityHealthRating < 75 &&
                !this.promptedUpgrades.has(`equipment-${hospitalId}`)) {

                this.showUpgradePrompt(
                    '🏥 Medical Equipment!',
                    `City health rating is ${this.cityHealthRating}/100. Upgrade to advanced medical equipment for better patient care?`,
                    5000,
                    () => this.upgradeEquipment(hospital)
                );
                this.promptedUpgrades.add(`equipment-${hospitalId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest expanding beds if population is high
            if (hospital.hospitalData.beds < 200 &&
                population > 60 + (hospital.hospitalData.beds / 2) &&
                !this.promptedUpgrades.has(`beds-${hospitalId}-${hospital.hospitalData.beds}`)) {

                this.showUpgradePrompt(
                    '🛏️ Hospital Capacity!',
                    `Population has grown to ${population}. Expand hospital capacity by adding more beds and staff?`,
                    3000,
                    () => this.expandCapacity(hospital)
                );
                this.promptedUpgrades.add(`beds-${hospitalId}-${hospital.hospitalData.beds}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest adding specialties when established
            const availableSpecialties = [
                'Cardiology',
                'Pediatrics',
                'Orthopedics',
                'Neurology',
                'Oncology',
                'Radiology'
            ];

            const unusedSpecialties = availableSpecialties.filter(
                s => !hospital.hospitalData.specialties.includes(s)
            );

            if (unusedSpecialties.length > 0 &&
                hospital.hospitalData.weeklyPatients > 50 * hospital.hospitalData.specialties.length &&
                !this.promptedUpgrades.has(`specialty-${hospitalId}-${hospital.hospitalData.specialties.length}`)) {

                const newSpecialty = unusedSpecialties[0];

                this.showUpgradePrompt(
                    '🏥 Medical Specialty!',
                    `The hospital is seeing many patients. Add ${newSpecialty} department to provide specialized care?`,
                    2500,
                    () => this.addSpecialty(hospital, newSpecialty)
                );
                this.promptedUpgrades.add(`specialty-${hospitalId}-${hospital.hospitalData.specialties.length}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Celebrate patient milestones
            const patientMilestones = [500, 1000, 2500, 5000];
            for (let milestone of patientMilestones) {
                if (this.totalPatients >= milestone &&
                    !this.promptedUpgrades.has(`patients-${milestone}`)) {

                    this.showInfoPopup(
                        '🏥 Healthcare Milestone!',
                        `The hospital has treated ${this.totalPatients} patients! City health rating: ${this.cityHealthRating}/100`
                    );
                    this.promptedUpgrades.add(`patients-${milestone}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }
        }
    }

    upgradeEquipment(hospital) {
        hospital.hospitalData.equipment = 'Advanced';
        this.updateHealthRating();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🏥 Hospital equipment upgraded!`);
        }
    }

    expandCapacity(hospital) {
        hospital.hospitalData.beds += 30;
        hospital.hospitalData.doctors += 5;
        hospital.hospitalData.nurses += 10;

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🛏️ Hospital expanded! +30 beds, +5 doctors, +10 nurses`);
        }
    }

    addSpecialty(hospital, specialtyName) {
        hospital.hospitalData.specialties.push(specialtyName);
        this.updateHealthRating();

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🏥 New department: ${specialtyName}!`);
        }
    }

    trackPatient(hospital) {
        if (!hospital.hospitalData) {
            this.initializeHospital(hospital);
        }

        hospital.hospitalData.weeklyPatients++;
        this.totalPatients++;
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0xFF4444, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FF4444',
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
        bg.lineStyle(3, 0xFF4444, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FF4444',
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
