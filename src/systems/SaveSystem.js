/**
 * SaveSystem - Manages game saving and loading
 * Handles localStorage persistence, save data serialization, and building restoration
 */
export class SaveSystem {
    constructor(scene) {
        this.scene = scene;
    }

    saveGame() {
        try {
            const saveData = {
                money: this.scene.money,
                wood: this.scene.wood,
                bricks: this.scene.bricks,
                bankBalance: this.scene.bankBalance,
                loanAmount: this.scene.loanAmount,
                gameTime: this.scene.gameTime,
                timeSpeed: this.scene.timeSpeed,
                buildings: this.scene.buildings.map(b => ({
                    type: b.type,
                    x: b.x,
                    y: b.y,
                    accumulatedIncome: b.accumulatedIncome || 0,
                    lastIncomeTime: b.lastIncomeTime || Date.now(),
                    storedResources: b.storedResources || 0,
                    lastResourceTime: b.lastResourceTime || Date.now(),
                    placedDistrict: b.placedDistrict || null,
                    districtBonus: b.districtBonus || 1.0,
                    facadeVariation: b.facadeVariation || 0,
                    // Save apartment units
                    units: b.units || undefined,
                    // Save hotel rooms
                    rooms: b.rooms || undefined,
                    lastNightCheck: b.lastNightCheck || undefined,
                    lastAutoClean: b.lastAutoClean || undefined,
                    hasMaid: b.hasMaid,
                    maidDailyWage: b.maidDailyWage,
                    lastMaidWageCheck: b.lastMaidWageCheck,
                    lastMaidClean: b.lastMaidClean,
                    // Save shop inventory
                    inventory: b.inventory || undefined,
                    hasEmployee: b.hasEmployee,
                    isOpen: b.isOpen,
                    dailyWage: b.dailyWage,
                    lastWageCheck: b.lastWageCheck,
                    // Save restaurant tables
                    tables: b.tables || undefined,
                    hasDayWaiter: b.hasDayWaiter,
                    hasNightWaiter: b.hasNightWaiter,
                    dayWaiterWage: b.dayWaiterWage,
                    nightWaiterWage: b.nightWaiterWage,
                    mealPrice: b.mealPrice
                })),
                population: this.scene.population,
                populationCapacity: this.scene.populationCapacity,
                pendingCitizens: this.scene.pendingCitizens
            };
            localStorage.setItem('mainstreetmayor_save', JSON.stringify(saveData));
            console.log(`Game saved! ${this.scene.buildings.length} buildings:`, this.scene.buildings.map(b => `${b.type} at x=${b.x}`));
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
            this.scene.money = saveData.money;
            this.scene.wood = saveData.wood;
            this.scene.bricks = saveData.bricks;

            // Restore bank data
            this.scene.bankBalance = saveData.bankBalance || 0;
            this.scene.loanAmount = saveData.loanAmount || 0;

            // Restore population data
            this.scene.population = saveData.population || 20;
            this.scene.populationCapacity = saveData.populationCapacity || 20;
            this.scene.pendingCitizens = saveData.pendingCitizens || 0;

            // Restore time data
            this.scene.gameTime = saveData.gameTime || 0;
            this.scene.timeSpeed = saveData.timeSpeed || 1;
            this.scene.lastRealTime = Date.now(); // Reset to current time on load

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
                        buildingData.lastWageCheck,
                        buildingData.lastAutoClean,
                        buildingData.facadeVariation || 0,
                        buildingData.hasMaid,
                        buildingData.maidDailyWage,
                        buildingData.lastMaidWageCheck,
                        buildingData.lastMaidClean,
                        buildingData.tables,
                        buildingData.hasDayWaiter,
                        buildingData.hasNightWaiter,
                        buildingData.dayWaiterWage,
                        buildingData.nightWaiterWage,
                        buildingData.mealPrice
                    );
                });
                console.log(`Successfully loaded ${this.scene.buildings.length} buildings`);
            }

            console.log('Game loaded!');
            return true;
        } catch (e) {
            console.error('Error loading save data:', e);
            return false;
        }
    }

    loadBuilding(type, x, y, accumulatedIncome = 0, lastIncomeTime = Date.now(), storedResources = 0, lastResourceTime = Date.now(), units = null, rooms = null, lastNightCheck = null, placedDistrict = null, districtBonus = 1.0, inventory = null, hasEmployee = null, isOpen = null, dailyWage = null, lastWageCheck = null, lastAutoClean = null, facadeVariation = 0, hasMaid = null, maidDailyWage = null, lastMaidWageCheck = null, lastMaidClean = null, tables = null, hasDayWaiter = null, hasNightWaiter = null, dayWaiterWage = null, nightWaiterWage = null, mealPrice = null) {
        const building = this.scene.buildingTypes[type];
        if (!building) {
            console.error(`Building type ${type} not found!`);
            return;
        }

        // Always use current ground level instead of saved Y coordinate
        const buildingY = this.scene.gameHeight - 100;

        console.log(`Drawing ${type} at x=${x}, y=${buildingY}, width=${building.width}, height=${building.height}`);

        const newBuilding = this.scene.add.graphics();
        newBuilding.setDepth(10); // Buildings are on top of background
        newBuilding.fillStyle(building.color, 1);
        newBuilding.fillRect(x - building.width/2, buildingY - building.height, building.width, building.height);
        newBuilding.lineStyle(3, 0x000000, 1);
        newBuilding.strokeRect(x - building.width/2, buildingY - building.height, building.width, building.height);

        // Draw detailed building features (windows, doors, roof, etc.)
        try {
            this.scene.buildingRenderer.drawBuildingDetails(newBuilding, type, x, buildingY, facadeVariation);
            console.log(`Successfully drew details for ${type}`);
        } catch (error) {
            console.error(`Error drawing details for ${type}:`, error);
        }

        // Add building-specific signs (no floating labels)
        if (type === 'house') {
            // Add "HOUSE" sign above door
            const houseSign = this.scene.add.text(x, buildingY - 60, 'HOUSE', {
                fontSize: '12px',
                color: '#FFFFFF',
                backgroundColor: '#8B4513',
                padding: { x: 5, y: 3 },
                fontStyle: 'bold',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'apartment') {
            // Add "APARTMENTS" sign at top (above windows)
            const aptSign = this.scene.add.text(x, buildingY - building.height + 5, 'APARTMENTS', {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#FFD700',
                padding: { x: 8, y: 4 },
                fontStyle: 'bold',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'bank') {
            // Add dollar sign symbol
            const dollarSign = this.scene.add.text(x, buildingY - building.height / 2, '$', {
                fontSize: '80px',
                color: '#FFD700',
                fontStyle: 'bold',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);

            // Add columns to make it look more like a bank
            newBuilding.fillStyle(0xFFFFFF, 0.3);
            newBuilding.fillRect(x - building.width/2 + 20, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x - building.width/2 + 60, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 80, buildingY - building.height + 40, 20, building.height - 80);
            newBuilding.fillRect(x + building.width/2 - 40, buildingY - building.height + 40, 20, building.height - 80);
        } else if (this.scene.isShop(type)) {
            // Add shop name text sign above awning
            const shopName = this.scene.buildingTypes[type].name.toUpperCase();
            const shopSign = this.scene.add.text(x, buildingY - 140, shopName, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);
        } else if (this.scene.isRestaurant(type)) {
            // Add restaurant name text on the red sign
            const restaurantName = this.scene.buildingTypes[type].name.toUpperCase();
            const restaurantSign = this.scene.add.text(x, buildingY - 95, restaurantName, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold',
                fontFamily: 'Arial',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'hotel') {
            // Add "HOTEL" text on the gold sign
            const hotelSign = this.scene.add.text(x, buildingY - building.height + 20, 'HOTEL', {
                fontSize: '14px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: 'Arial',
                resolution: 2
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'market') {
            // Add market awning
            const awning = this.scene.add.text(x, buildingY - building.height / 2, '🏪', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'lumbermill') {
            // Add tree/wood icon
            const woodIcon = this.scene.add.text(x, buildingY - building.height / 2, '🌲', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        } else if (type === 'brickfactory') {
            // Add brick icon
            const brickIcon = this.scene.add.text(x, buildingY - building.height / 2, '🧱', {
                fontSize: '60px'
            }).setOrigin(0.5).setDepth(11);
        }

        // Add loaded building with income and resource tracking (use buildingY for current ground level)
        const buildingData = {
            graphics: newBuilding,
            type: type,
            x: x,
            y: buildingY,
            accumulatedIncome: accumulatedIncome,
            lastIncomeTime: lastIncomeTime,
            storedResources: storedResources,
            lastResourceTime: lastResourceTime,
            placedDistrict: placedDistrict,
            districtBonus: districtBonus,
            facadeVariation: facadeVariation
        };

        // Add visual indicator if building is in correct district
        const inCorrectDistrict = placedDistrict === building.district;
        if (inCorrectDistrict) {
            const bonusIndicator = this.scene.add.text(x, buildingY - building.height - 30, '⭐', {
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
            buildingData.lastNightCheck = lastNightCheck || this.scene.gameTime;
            buildingData.hasEmployee = hasEmployee !== null ? hasEmployee : false;
            buildingData.dailyWage = dailyWage !== null ? dailyWage : 0;
            buildingData.lastWageCheck = lastWageCheck !== null ? lastWageCheck : this.scene.gameTime;
            buildingData.lastAutoClean = lastAutoClean !== null ? lastAutoClean : this.scene.gameTime;
            buildingData.hasMaid = hasMaid !== null ? hasMaid : false;
            buildingData.maidDailyWage = maidDailyWage !== null ? maidDailyWage : 0;
            buildingData.lastMaidWageCheck = lastMaidWageCheck !== null ? lastMaidWageCheck : this.scene.gameTime;
            buildingData.lastMaidClean = lastMaidClean !== null ? lastMaidClean : this.scene.gameTime;
        }

        // Initialize shop inventory if it's a shop (use saved data or defaults)
        if (this.scene.isShop(type)) {
            buildingData.inventory = inventory || {
                stock: 50,
                maxStock: 100,
                restockCost: 5,
                salesPerCustomer: 5
            };
            buildingData.hasEmployee = hasEmployee !== null ? hasEmployee : false;
            buildingData.isOpen = isOpen !== null ? isOpen : false;
            buildingData.dailyWage = dailyWage !== null ? dailyWage : 0;
            buildingData.lastWageCheck = lastWageCheck !== null ? lastWageCheck : this.scene.gameTime;
        }

        // Restore restaurant tables or initialize if missing
        if (this.scene.isRestaurant(type)) {
            if (tables) {
                buildingData.tables = tables;
            } else {
                // Create tables if restaurant doesn't have them (for old saves)
                console.log('🍽️ Initializing tables for existing restaurant');
                buildingData.tables = [];
                for (let i = 0; i < 6; i++) {
                    buildingData.tables.push({
                        status: 'available',
                        customer: null,
                        mealStartTime: null,
                        mealDuration: 0
                    });
                }
            }
            buildingData.hasDayWaiter = hasDayWaiter !== null ? hasDayWaiter : false;
            buildingData.hasNightWaiter = hasNightWaiter !== null ? hasNightWaiter : false;
            buildingData.dayWaiterWage = dayWaiterWage !== null ? dayWaiterWage : 0;
            buildingData.nightWaiterWage = nightWaiterWage !== null ? nightWaiterWage : 0;
            buildingData.mealPrice = mealPrice !== null ? mealPrice : 25;
            buildingData.lastWageCheck = lastWageCheck !== null ? lastWageCheck : this.scene.gameTime;
        }

        // Add window lights for nighttime
        const buildingType = this.scene.buildingTypes[type];
        this.scene.addWindowLights(buildingData, buildingType);

        this.scene.buildings.push(buildingData);
    }
}
