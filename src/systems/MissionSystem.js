export class MissionSystem {
    constructor(scene) {
        this.scene = scene;
        this.missions = [];
        this.completedMissions = [];

        this.initializeMissions();
    }

    initializeMissions() {
        this.missions = [
            // Early game missions
            {
                id: 'first_house',
                title: 'First Home',
                description: 'Build your first house',
                type: 'building_count',
                buildingType: 'house',
                target: 1,
                reward: { money: 500 },
                completed: false
            },
            {
                id: 'population_10',
                title: 'Small Community',
                description: 'Reach 10 residents',
                type: 'population',
                target: 10,
                reward: { money: 1000, wood: 50 },
                completed: false
            },
            {
                id: 'first_business',
                title: 'Open for Business',
                description: 'Build your first shop or restaurant',
                type: 'building_category',
                category: ['clothingShop', 'electronicsShop', 'groceryStore', 'bookstore', 'bakery', 'chinese_restaurant', 'italian_restaurant', 'diner', 'sub_shop'],
                target: 1,
                reward: { money: 750 },
                completed: false
            },
            {
                id: 'money_5000',
                title: 'Entrepreneur',
                description: 'Have $5,000 in cash',
                type: 'money',
                target: 5000,
                reward: { money: 1000 },
                completed: false
            },

            // Mid game missions
            {
                id: 'population_50',
                title: 'Growing Town',
                description: 'Reach 50 residents',
                type: 'population',
                target: 50,
                reward: { money: 3000, bricks: 100 },
                completed: false
            },
            {
                id: 'apartment_building',
                title: 'High Rise',
                description: 'Build an apartment building',
                type: 'building_count',
                buildingType: 'apartment',
                target: 1,
                reward: { money: 2000 },
                completed: false
            },
            {
                id: 'money_15000',
                title: 'Wealthy Mayor',
                description: 'Have $15,000 in cash',
                type: 'money',
                target: 15000,
                reward: { money: 3000 },
                completed: false
            },
            {
                id: 'build_bank',
                title: 'Financial District',
                description: 'Build a bank',
                type: 'building_count',
                buildingType: 'bank',
                target: 1,
                reward: { money: 2500 },
                completed: false
            },
            {
                id: 'build_hotel',
                title: 'Tourist Welcome',
                description: 'Build a hotel',
                type: 'building_count',
                buildingType: 'hotel',
                target: 1,
                reward: { money: 3000 },
                completed: false
            },

            // Advanced missions
            {
                id: 'population_100',
                title: 'Thriving City',
                description: 'Reach 100 residents',
                type: 'population',
                target: 100,
                reward: { money: 10000, wood: 200, bricks: 200 },
                completed: false
            },
            {
                id: 'money_50000',
                title: 'Tycoon',
                description: 'Have $50,000 in cash',
                type: 'money',
                target: 50000,
                reward: { money: 10000 },
                completed: false
            },
            {
                id: 'emergency_services',
                title: 'Safe City',
                description: 'Build a fire station, police station, and hospital',
                type: 'building_set',
                buildings: ['fireStation', 'policeStation', 'hospital'],
                reward: { money: 15000 },
                completed: false
            },
            {
                id: 'education_hub',
                title: 'Smart City',
                description: 'Build a school and library',
                type: 'building_set',
                buildings: ['school', 'library'],
                reward: { money: 8000 },
                completed: false
            },
            {
                id: 'building_variety',
                title: 'Master Builder',
                description: 'Build at least 20 buildings',
                type: 'total_buildings',
                target: 20,
                reward: { money: 12000, wood: 300, bricks: 300 },
                completed: false
            },
            {
                id: 'unlock_second_street',
                title: 'City Expansion',
                description: 'Build 20 buildings to unlock 2nd street',
                type: 'unlock_street',
                target: 20,
                reward: { money: 15000 },
                completed: false,
                special: 'unlock_street_2' // Special flag for unlocking
            }
        ];
    }

    checkMissions() {
        for (let mission of this.missions) {
            if (mission.completed) continue;

            let progress = this.getMissionProgress(mission);
            let target = mission.target || 1;

            if (progress >= target) {
                this.completeMission(mission);
            }
        }
    }

    getMissionProgress(mission) {
        switch (mission.type) {
            case 'building_count':
                return this.scene.buildings.filter(b => b.type === mission.buildingType).length;

            case 'building_category':
                return this.scene.buildings.filter(b => mission.category.includes(b.type)).length;

            case 'building_set':
                let hasAll = mission.buildings.every(type =>
                    this.scene.buildings.some(b => b.type === type)
                );
                return hasAll ? 1 : 0;

            case 'population':
                const residentCount = this.scene.citizens ?
                    this.scene.citizens.filter(c => !c.isTourist).length : 0;
                return residentCount;

            case 'money':
                return Math.floor(this.scene.money);

            case 'total_buildings':
                return this.scene.buildings.length;

            case 'unlock_street':
                return this.scene.buildings.length;

            default:
                return 0;
        }
    }

    completeMission(mission) {
        mission.completed = true;
        this.completedMissions.push(mission);

        // Award rewards
        if (mission.reward) {
            if (mission.reward.money) {
                this.scene.money += mission.reward.money;
                this.scene.money = Math.round(this.scene.money);
            }
            if (mission.reward.wood) {
                this.scene.wood += mission.reward.wood;
            }
            if (mission.reward.bricks) {
                this.scene.bricks += mission.reward.bricks;
            }
        }

        // Handle special unlocks
        if (mission.special === 'unlock_street_2') {
            if (!this.scene.unlockedStreets) {
                this.scene.unlockedStreets = 1; // Start with street 1
            }
            this.scene.unlockedStreets = 2; // Unlock street 2

            // Show street 2 if it exists
            if (this.scene.streets && this.scene.streets[1]) {
                const street2 = this.scene.streets[1];
                street2.ground.setVisible(true);

                // Prompt user to name the new street
                const streetName = prompt('🎉 You unlocked a second street! What would you like to name it?', 'Main Street');
                if (streetName && streetName.trim()) {
                    street2.name = streetName.trim();
                    this.scene.streetNames[2] = streetName.trim();
                    this.scene.uiManager.addNotification(`🎉 ${streetName} unlocked! Press V for bird's eye view`);
                } else {
                    street2.name = 'Street 2';
                    this.scene.streetNames[2] = 'Street 2';
                    this.scene.uiManager.addNotification('🎉 SECOND STREET UNLOCKED! Check bird\'s eye view (V)');
                }
            }
        }

        // Show completion notification
        this.showMissionCompletePopup(mission);

        // Update UI if missions panel is open
        if (this.scene.missionsMenuOpen) {
            this.scene.uiManager.showMissionsPanel();
        }

        // Save game
        this.scene.saveSystem.saveGame();
    }

    showMissionCompletePopup(mission) {
        const popup = this.scene.add.container(this.scene.gameWidth / 2, this.scene.gameHeight / 2);
        popup.setScrollFactor(0).setDepth(99998);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -150, 500, 300, 10);
        bg.lineStyle(3, 0xFFD700, 1);
        bg.strokeRoundedRect(-250, -150, 500, 300, 10);
        popup.add(bg);

        // Trophy icon
        const trophy = this.scene.add.text(0, -100, '🏆', {
            fontSize: '60px'
        });
        trophy.setOrigin(0.5);
        popup.add(trophy);

        // Title
        const title = this.scene.add.text(0, -30, 'MISSION COMPLETE!', {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFD700'
        });
        title.setOrigin(0.5);
        popup.add(title);

        // Mission name
        const missionName = this.scene.add.text(0, 10, mission.title, {
            fontSize: '20px',
            color: '#ffffff'
        });
        missionName.setOrigin(0.5);
        popup.add(missionName);

        // Rewards
        let rewardText = 'Rewards: ';
        const rewards = [];
        if (mission.reward.money) rewards.push(`$${mission.reward.money}`);
        if (mission.reward.wood) rewards.push(`${mission.reward.wood} wood`);
        if (mission.reward.bricks) rewards.push(`${mission.reward.bricks} bricks`);
        rewardText += rewards.join(', ');

        const reward = this.scene.add.text(0, 50, rewardText, {
            fontSize: '18px',
            color: '#4CAF50',
            fontWeight: 'bold'
        });
        reward.setOrigin(0.5);
        popup.add(reward);

        // Close button
        const closeBtn = this.scene.add.text(0, 110, 'CONTINUE', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        closeBtn.on('pointerdown', () => {
            popup.destroy();
        });

        closeBtn.on('pointerover', () => {
            closeBtn.setStyle({ backgroundColor: '#66BB6A' });
        });

        closeBtn.on('pointerout', () => {
            closeBtn.setStyle({ backgroundColor: '#4CAF50' });
        });

        popup.add(closeBtn);

        // Auto-close after 8 seconds
        this.scene.time.delayedCall(8000, () => {
            if (popup && popup.active) {
                popup.destroy();
            }
        });

        // Also add to notification ticker
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🏆 Mission Complete: ${mission.title}`);
        }
    }

    getActiveMissions() {
        return this.missions.filter(m => !m.completed);
    }

    getCompletedMissions() {
        return this.completedMissions;
    }
}
