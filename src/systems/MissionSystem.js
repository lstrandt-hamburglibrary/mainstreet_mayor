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
            },

            // Street 3 unlock
            {
                id: 'unlock_third_street',
                title: 'Growing Metropolis',
                description: 'Build 35 buildings to unlock 3rd street',
                type: 'unlock_street',
                target: 35,
                reward: { money: 25000, wood: 500, bricks: 500 },
                completed: false,
                special: 'unlock_street_3'
            },

            // Street 4 unlock
            {
                id: 'unlock_fourth_street',
                title: 'Urban Sprawl',
                description: 'Build 55 buildings to unlock 4th street',
                type: 'unlock_street',
                target: 55,
                reward: { money: 40000, wood: 750, bricks: 750 },
                completed: false,
                special: 'unlock_street_4'
            },

            // Street 5 unlock
            {
                id: 'unlock_fifth_street',
                title: 'Major City',
                description: 'Build 80 buildings to unlock 5th street',
                type: 'unlock_street',
                target: 80,
                reward: { money: 60000, wood: 1000, bricks: 1000 },
                completed: false,
                special: 'unlock_street_5'
            },

            // Street 6 unlock
            {
                id: 'unlock_sixth_street',
                title: 'Metropolitan Hub',
                description: 'Build 110 buildings to unlock 6th street',
                type: 'unlock_street',
                target: 110,
                reward: { money: 85000, wood: 1500, bricks: 1500 },
                completed: false,
                special: 'unlock_street_6'
            },

            // Street 7 unlock
            {
                id: 'unlock_seventh_street',
                title: 'Mega City',
                description: 'Build 145 buildings to unlock 7th street',
                type: 'unlock_street',
                target: 145,
                reward: { money: 115000, wood: 2000, bricks: 2000 },
                completed: false,
                special: 'unlock_street_7'
            },

            // Street 8 unlock
            {
                id: 'unlock_eighth_street',
                title: 'Urban Giant',
                description: 'Build 185 buildings to unlock 8th street',
                type: 'unlock_street',
                target: 185,
                reward: { money: 150000, wood: 2500, bricks: 2500 },
                completed: false,
                special: 'unlock_street_8'
            },

            // Street 9 unlock
            {
                id: 'unlock_ninth_street',
                title: 'City Empire',
                description: 'Build 230 buildings to unlock 9th street',
                type: 'unlock_street',
                target: 230,
                reward: { money: 200000, wood: 3000, bricks: 3000 },
                completed: false,
                special: 'unlock_street_9'
            },

            // Street 10 unlock (final)
            {
                id: 'unlock_tenth_street',
                title: 'Ultimate Metropolis',
                description: 'Build 280 buildings to unlock 10th street',
                type: 'unlock_street',
                target: 280,
                reward: { money: 300000, wood: 5000, bricks: 5000 },
                completed: false,
                special: 'unlock_street_10'
            },

            // Tourism and Entertainment missions
            {
                id: 'tourist_town',
                title: 'Tourist Attraction',
                description: 'Have 20 tourists visit your city',
                type: 'tourist_count',
                target: 20,
                reward: { money: 5000 },
                completed: false
            },
            {
                id: 'entertainment_district',
                title: 'Entertainment Capital',
                description: 'Build a movie theater, bowling alley, and museum',
                type: 'building_set',
                buildings: ['movieTheater', 'bowling', 'museum'],
                reward: { money: 10000 },
                completed: false
            },
            {
                id: 'build_stadium',
                title: 'Sports City',
                description: 'Build a stadium',
                type: 'building_count',
                buildingType: 'stadium',
                target: 1,
                reward: { money: 8000, wood: 100, bricks: 100 },
                completed: false
            },
            {
                id: 'recreation_hub',
                title: 'Recreational Paradise',
                description: 'Build a park, playground, and gym',
                type: 'building_set',
                buildings: ['park', 'playground', 'gym'],
                reward: { money: 6000 },
                completed: false
            },

            // Transportation missions
            {
                id: 'build_train_station',
                title: 'All Aboard!',
                description: 'Build a train station',
                type: 'building_count',
                buildingType: 'trainStation',
                target: 1,
                reward: { money: 5000, wood: 75, bricks: 75 },
                completed: false
            },
            {
                id: 'transit_hub',
                title: 'Public Transit Hub',
                description: 'Build 2 train stations to expand rail network',
                type: 'building_count',
                buildingType: 'trainStation',
                target: 2,
                reward: { money: 12000 },
                completed: false
            },

            // Commercial and economic missions
            {
                id: 'shopping_center',
                title: 'Shopping District',
                description: 'Build 5 different types of shops',
                type: 'shop_variety',
                target: 5,
                reward: { money: 7000 },
                completed: false
            },
            {
                id: 'restaurant_row',
                title: 'Restaurant Row',
                description: 'Build 3 different restaurants',
                type: 'restaurant_variety',
                target: 3,
                reward: { money: 5000 },
                completed: false
            },
            {
                id: 'industrial_park',
                title: 'Industrial Park',
                description: 'Build lumber mill, brick factory, and market',
                type: 'building_set',
                buildings: ['lumbermill', 'brickfactory', 'market'],
                reward: { money: 8000, wood: 150, bricks: 150 },
                completed: false
            },
            {
                id: 'money_100000',
                title: 'Millionaire Mayor',
                description: 'Have $100,000 in cash',
                type: 'money',
                target: 100000,
                reward: { money: 25000 },
                completed: false
            },

            // Population milestones
            {
                id: 'population_200',
                title: 'Booming Metropolis',
                description: 'Reach 200 residents',
                type: 'population',
                target: 200,
                reward: { money: 30000, wood: 500, bricks: 500 },
                completed: false
            },
            {
                id: 'population_500',
                title: 'Major City',
                description: 'Reach 500 residents',
                type: 'population',
                target: 500,
                reward: { money: 100000, wood: 1000, bricks: 1000 },
                completed: false
            },

            // Luxury and high-end missions
            {
                id: 'luxury_city',
                title: 'Luxury Living',
                description: 'Build 3 hotels and a bank',
                type: 'luxury_buildings',
                target: 4,
                reward: { money: 20000 },
                completed: false
            },
            {
                id: 'diverse_city',
                title: 'Diverse Metropolis',
                description: 'Build at least 15 different building types',
                type: 'building_diversity',
                target: 15,
                reward: { money: 18000, wood: 400, bricks: 400 },
                completed: false
            },

            // New building type missions
            {
                id: 'automotive_district',
                title: 'Automotive District',
                description: 'Build a gas station and car dealership',
                type: 'building_set',
                buildings: ['gasStation', 'carDealership'],
                reward: { money: 6000 },
                completed: false
            },
            {
                id: 'culture_city',
                title: 'Cultural Center',
                description: 'Build art gallery, museum, and library',
                type: 'building_set',
                buildings: ['artGallery', 'museum', 'library'],
                reward: { money: 12000 },
                completed: false
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

            case 'tourist_count':
                // Count total tourists that have visited (current + those who left)
                const currentTourists = this.scene.citizens ?
                    this.scene.citizens.filter(c => c.isTourist).length : 0;
                // This is approximate - in future could track total tourists served
                return currentTourists;

            case 'shop_variety':
                // Count different types of shops
                const shopTypes = ['clothingShop', 'electronicsShop', 'groceryStore', 'bookstore',
                                   'gasStation', 'hardwareStore', 'petStore', 'pharmacy'];
                const uniqueShops = new Set();
                for (let building of this.scene.buildings) {
                    if (shopTypes.includes(building.type)) {
                        uniqueShops.add(building.type);
                    }
                }
                return uniqueShops.size;

            case 'restaurant_variety':
                // Count different types of restaurants
                const restaurantTypes = ['bakery', 'chinese_restaurant', 'italian_restaurant',
                                         'diner', 'sub_shop', 'coffeeShop'];
                const uniqueRestaurants = new Set();
                for (let building of this.scene.buildings) {
                    if (restaurantTypes.includes(building.type)) {
                        uniqueRestaurants.add(building.type);
                    }
                }
                return uniqueRestaurants.size;

            case 'luxury_buildings':
                // Count hotels and banks
                return this.scene.buildings.filter(b =>
                    b.type === 'hotel' || b.type === 'bank'
                ).length;

            case 'building_diversity':
                // Count unique building types
                const uniqueTypes = new Set();
                for (let building of this.scene.buildings) {
                    uniqueTypes.add(building.type);
                }
                return uniqueTypes.size;

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

        // Handle special unlocks - Generic street unlock system
        if (mission.special && mission.special.startsWith('unlock_street_')) {
            // Extract street number from special flag (e.g., 'unlock_street_2' -> 2)
            const streetNumber = parseInt(mission.special.split('_')[2]);

            if (!this.scene.unlockedStreets) {
                this.scene.unlockedStreets = 1; // Start with street 1
            }

            // Unlock the new street
            this.scene.unlockedStreets = streetNumber;

            // Show the street if it exists
            const streetIndex = streetNumber - 1;
            if (this.scene.streets && this.scene.streets[streetIndex]) {
                const newStreet = this.scene.streets[streetIndex];
                newStreet.ground.setVisible(true);

                // Prompt user to name the new street
                const ordinal = this.getOrdinal(streetNumber);
                const streetName = prompt(`🎉 You unlocked a ${ordinal} street! What would you like to name it?`, `Street ${streetNumber}`);
                if (streetName && streetName.trim()) {
                    newStreet.name = streetName.trim();
                    this.scene.streetNames[streetNumber] = streetName.trim();
                    this.scene.uiManager.addNotification(`🎉 ${streetName} unlocked! Press Page Up to visit`);
                } else {
                    newStreet.name = `Street ${streetNumber}`;
                    this.scene.streetNames[streetNumber] = `Street ${streetNumber}`;
                    this.scene.uiManager.addNotification(`🎉 STREET ${streetNumber} UNLOCKED! Press Page Up to visit`);
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

    getOrdinal(num) {
        // Convert number to ordinal string (2 -> "2nd", 3 -> "3rd", etc.)
        const ordinals = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
        if (num <= 10) {
            return ordinals[num];
        }
        // Fallback for numbers > 10
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return num + 'th';
        }
        switch (lastDigit) {
            case 1: return num + 'st';
            case 2: return num + 'nd';
            case 3: return num + 'rd';
            default: return num + 'th';
        }
    }
}
