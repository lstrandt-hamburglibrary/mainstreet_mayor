/**
 * CitizenSystem - Manages citizen spawning, movement, and behavior
 * Handles citizen AI, building visits, shopping, dining, and bus system integration
 */
export class CitizenSystem {
    constructor(scene) {
        this.scene = scene;
    }

    spawnCitizens() {
        // Spawn 20 initial citizens at random locations
        const groundLevel = this.scene.gameHeight - 100;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 12000;
            this.createCitizen(x, groundLevel - 30);
        }
    }

    spawnNewCitizen() {
        // Spawn a new citizen near a random residential building
        const groundLevel = this.scene.gameHeight - 100;

        // Find all residential buildings
        const residentialBuildings = this.scene.buildings.filter(b =>
            this.scene.buildingTypes[b.type]?.district === 'residential'
        );

        let spawnX;
        if (residentialBuildings.length > 0) {
            // Spawn near a random residential building
            const randomBuilding = residentialBuildings[Math.floor(Math.random() * residentialBuildings.length)];
            spawnX = randomBuilding.x + (Math.random() * 400 - 200); // Within 200px of building
        } else {
            // No residential buildings yet, spawn randomly
            spawnX = Math.random() * 12000;
        }

        this.createCitizen(spawnX, groundLevel - 30);
    }

    spawnTourist(x) {
        // Spawn a tourist (temporary visitor) at a bus stop
        const groundLevel = this.scene.gameHeight - 100;
        const spawnX = x + (Math.random() * 100 - 50); // Near bus stop

        this.createCitizen(spawnX, groundLevel - 30);

        // Mark the last spawned citizen as a tourist
        const tourist = this.scene.citizens[this.scene.citizens.length - 1];
        tourist.isTourist = true;
        // Stay for 180-300 game minutes (3-5 game hours)
        tourist.touristTimeRemaining = 180 + Math.random() * 120;
        tourist.touristStartTime = this.scene.gameTime;
        tourist.spawnedAtStop = x; // Remember where they arrived

        // Try to book a hotel room
        this.bookHotelForTourist(tourist);
    }

    bookHotelForTourist(tourist) {
        // Find ALL hotels with available clean rooms (search entire map)
        const nearbyHotels = this.scene.buildings.filter(b =>
            b.type === 'hotel' &&
            b.rooms
        );

        console.log(`🏨 Tourist at x=${Math.floor(tourist.x)}, found ${nearbyHotels.length} hotels in town`);

        // Look for a hotel with an available clean room
        for (let hotel of nearbyHotels) {
            const cleanRooms = hotel.rooms.filter(r => r.status === 'clean');
            const availableRooms = hotel.rooms.filter(r => r.status === 'clean' && !r.isOccupied);
            console.log(`🏨 Hotel at x=${hotel.x}: ${cleanRooms.length} clean rooms, ${availableRooms.length} available (not occupied)`);

            const availableRoom = hotel.rooms.find(r => r.status === 'clean' && !r.isOccupied);
            if (availableRoom) {
                // Book the room
                availableRoom.status = 'occupied';
                availableRoom.isOccupied = true;
                availableRoom.nightsOccupied = 0;
                availableRoom.guest = tourist;

                tourist.hotelRoom = availableRoom;
                tourist.hotel = hotel;

                console.log('🏨 Tourist checked into hotel room!');
                this.scene.uiManager.addNotification('🏨 Tourist checked into hotel');

                // Update hotel UI if player is viewing this hotel
                console.log(`🏨 Checking if need to update UI: insideHotel=${this.scene.insideHotel}, currentHotel=${this.scene.currentHotel ? 'yes' : 'no'}, matchesThisHotel=${this.scene.currentHotel === hotel}`);
                if (this.scene.insideHotel && this.scene.currentHotel === hotel) {
                    console.log('🏨 Updating hotel UI!');
                    this.scene.hotelSystem.updateHotelUI();
                }

                return true;
            }
        }

        console.log('🏨 No available hotel rooms for tourist');
        return false;
    }

    createCitizen(startX, startY) {
        const citizen = this.scene.add.container(startX, startY);
        citizen.setDepth(11); // Above buildings (10), below buses (12)

        // Randomize citizen appearance
        const skinTones = [0xFFDBAC, 0xF1C27D, 0xE0AC69, 0xC68642, 0x8D5524, 0x5C3317];
        const shirtColors = [0x2196F3, 0xF44336, 0x4CAF50, 0xFF9800, 0x9C27B0, 0x00BCD4, 0xE91E63];
        const pantColors = [0x1565C0, 0x424242, 0x795548, 0x5D4037];

        const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
        const pantColor = pantColors[Math.floor(Math.random() * pantColors.length)];

        // Shadow
        const shadow = this.scene.add.ellipse(0, 28, 20, 6, 0x000000, 0.3);
        citizen.add(shadow);

        // Legs
        const leftLeg = this.scene.add.graphics();
        leftLeg.fillStyle(pantColor, 1);
        leftLeg.fillRoundedRect(-6, 6, 6, 14, 2);
        citizen.add(leftLeg);

        const rightLeg = this.scene.add.graphics();
        rightLeg.fillStyle(pantColor, 1);
        rightLeg.fillRoundedRect(0, 6, 6, 14, 2);
        citizen.add(rightLeg);

        // Shoes
        const leftShoe = this.scene.add.ellipse(-3, 22, 8, 4, 0x000000);
        const rightShoe = this.scene.add.ellipse(3, 22, 8, 4, 0x000000);
        citizen.add(leftShoe);
        citizen.add(rightShoe);

        // Body (shirt)
        const body = this.scene.add.graphics();
        body.fillStyle(shirtColor, 1);
        body.fillRoundedRect(-8, -12, 16, 20, 3);
        citizen.add(body);

        // Arms
        const leftArm = this.scene.add.graphics();
        leftArm.fillStyle(shirtColor, 1);
        leftArm.fillRoundedRect(-12, -6, 4, 10, 2);
        citizen.add(leftArm);

        const rightArm = this.scene.add.graphics();
        rightArm.fillStyle(shirtColor, 1);
        rightArm.fillRoundedRect(8, -6, 4, 10, 2);
        citizen.add(rightArm);

        // Hands
        const leftHand = this.scene.add.circle(-10, 6, 3, skinTone);
        const rightHand = this.scene.add.circle(10, 6, 3, skinTone);
        citizen.add(leftHand);
        citizen.add(rightHand);

        // Neck
        const neck = this.scene.add.rectangle(0, -14, 4, 3, skinTone);
        citizen.add(neck);

        // Head
        const head = this.scene.add.circle(0, -20, 8, skinTone);
        citizen.add(head);

        // Eyes
        const leftEye = this.scene.add.circle(-3, -21, 1.5, 0x000000);
        const rightEye = this.scene.add.circle(3, -21, 1.5, 0x000000);
        citizen.add(leftEye);
        citizen.add(rightEye);

        // Random hair color and style
        const hairColors = [0x000000, 0x3E2723, 0x5D4037, 0xFFD700, 0xF44336];
        const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        const hair = this.scene.add.circle(0, -24, 6, hairColor);
        citizen.add(hair);

        // Store citizen data
        const targetBuilding = this.scene.buildings.length > 0
            ? this.scene.buildings[Math.floor(Math.random() * this.scene.buildings.length)]
            : null;

        this.scene.citizens.push({
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

    updateCitizens() {
        const deltaTime = 1/60; // Approximate 60 FPS

        for (let citizen of this.scene.citizens) {
            // Handle tourist timer - tourists leave after their time is up (based on game time)
            if (citizen.isTourist && citizen.touristTimeRemaining !== undefined) {
                const timeElapsed = this.scene.gameTime - citizen.touristStartTime;
                if (timeElapsed >= citizen.touristTimeRemaining) {
                    // Check out of hotel immediately when time expires
                    if (citizen.hotelRoom && citizen.hotel && !citizen.hasCheckedOut) {
                        citizen.hotelRoom.isOccupied = false;
                        citizen.hotelRoom.status = 'dirty';
                        citizen.hotelRoom.guest = null;
                        console.log('🏨 Tourist checked out - room is now dirty');

                        // If maid is hired, clean the room immediately
                        if (citizen.hotel.hasMaid) {
                            citizen.hotelRoom.status = 'clean';
                            console.log('🧹 Maid immediately cleaned room after tourist checkout!');
                        }

                        // Update hotel UI if player is viewing this hotel
                        if (this.scene.insideHotel && this.scene.currentHotel === citizen.hotel) {
                            this.scene.hotelSystem.updateHotelUI();
                        }

                        // Mark as checked out so we don't do this again
                        citizen.hasCheckedOut = true;
                    }

                    // Time to leave - head to nearest bus stop
                    let nearestStop = null;
                    let nearestDistance = Infinity;
                    if (this.scene.busStops && this.scene.busStops.length > 0) {
                        for (let stop of this.scene.busStops) {
                            const dist = Math.abs(citizen.x - stop.x);
                            if (dist < nearestDistance) {
                                nearestDistance = dist;
                                nearestStop = stop;
                            }
                        }
                    }

                    if (nearestStop && !citizen.targetBusStop) {
                        // Interrupt whatever they're doing and head to bus stop
                        if (citizen.state === 'visiting') {
                            // If visiting, exit the building immediately
                            citizen.container.setVisible(true);

                            // Clean up occupied table if dining
                            if (citizen.occupiedTable) {
                                citizen.occupiedTable.status = 'dirty';
                                citizen.occupiedTable.customer = null;
                                citizen.occupiedTable.mealStartTime = null;
                                citizen.occupiedTable.mealDuration = 0;
                                citizen.occupiedTable = null;
                            }

                            // Reset position to building exit if they have a target building
                            if (citizen.targetBuilding) {
                                citizen.x = citizen.targetBuilding.x + (Math.random() * 100 - 50);
                                citizen.container.x = citizen.x;
                            }
                        }

                        if (citizen.state === 'waiting') {
                            // Remove from current bus stop waiting list
                            for (let stop of this.scene.busStops) {
                                const index = stop.waitingCitizens.indexOf(citizen);
                                if (index > -1) {
                                    stop.waitingCitizens.splice(index, 1);
                                    break;
                                }
                            }
                        }

                        // Clear any current targets
                        citizen.targetBuilding = null;
                        citizen.isShoppingVisit = false;
                        citizen.isDiningVisit = false;
                        citizen.isEntertainmentVisit = false;
                        citizen.isServiceVisit = false;

                        // Head to bus stop
                        citizen.targetBusStop = nearestStop;
                        citizen.state = 'walking';
                        citizen.direction = citizen.x < nearestStop.x ? 1 : -1;
                        console.log('👋 Tourist time expired - heading to bus stop to leave town');
                    }
                }
            }

            if (citizen.state === 'walking') {
                // Walk in current direction
                const distance = citizen.walkSpeed * deltaTime;
                citizen.x += distance * citizen.direction;
                citizen.container.x = citizen.x;

                // Randomly decide to go to a bus stop
                if (Math.random() < 0.001 && this.scene.busStops && this.scene.busStops.length > 0) { // 0.1% chance per frame
                    // Find nearest bus stop
                    let nearestStop = null;
                    let nearestDistance = Infinity;
                    for (let stop of this.scene.busStops) {
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
                if (Math.random() < 0.001 && this.scene.buildings.length > 0) { // Increased from 0.0005 to 0.001 (2x more frequent)
                    // Find nearby shops that are open and have stock
                    const allShops = this.scene.buildings.filter(b => this.scene.isShop(b.type));
                    console.log(`🛍️ Checking ${allShops.length} shops for visit...`);
                    allShops.forEach(s => {
                        console.log(`  ${s.type}: isOpen=${s.isOpen}, hasInventory=${!!s.inventory}, stock=${s.inventory?.stock}, needsStock=${s.inventory?.salesPerCustomer}`);
                    });

                    const nearbyShops = this.scene.buildings.filter(b =>
                        this.scene.isShop(b.type) &&
                        b.isOpen &&
                        b.inventory &&
                        b.inventory.stock >= b.inventory.salesPerCustomer
                    );
                    console.log(`  -> ${nearbyShops.length} shops are available for visit (town-wide search)`);

                    // Get current hour for restaurant shift check
                    const totalMinutes = Math.floor(this.scene.gameTime);
                    const hour = Math.floor((totalMinutes % (24 * 60)) / 60);
                    const isDayTime = hour >= 6 && hour < 20; // 6am-8pm is day shift

                    // Find nearby restaurants with available tables and appropriate waiter
                    const nearbyRestaurants = this.scene.buildings.filter(b =>
                        this.scene.isRestaurant(b.type) &&
                        Math.abs(b.x - citizen.x) < 800 &&
                        b.tables &&
                        b.tables.some(t => t.status === 'available') &&
                        ((isDayTime && b.hasDayWaiter) || (!isDayTime && b.hasNightWaiter))
                    );

                    // Find nearby entertainment (arcades - always open) - search whole town
                    const nearbyEntertainment = this.scene.buildings.filter(b =>
                        this.scene.isEntertainment(b.type)
                    );

                    // Find nearby services (libraries, museums) - search whole town
                    const nearbyServices = this.scene.buildings.filter(b =>
                        this.scene.isService(b.type)
                    );

                    // Choose target building (25% shop, 25% restaurant, 20% entertainment, 20% service, 10% any)
                    let targetBuilding = null;
                    const randomChoice = Math.random();

                    if (randomChoice < 0.25 && nearbyShops.length > 0) {
                        // 25% chance to visit shop
                        targetBuilding = nearbyShops[Math.floor(Math.random() * nearbyShops.length)];
                        console.log(`🛍️ Citizen heading to shop: ${targetBuilding.type} at x=${targetBuilding.x}`);
                        citizen.isShoppingVisit = true;
                        citizen.isDiningVisit = false;
                        citizen.isEntertainmentVisit = false;
                        citizen.isServiceVisit = false;
                    } else if (randomChoice < 0.50 && nearbyRestaurants.length > 0) {
                        // 25% chance to visit restaurant
                        targetBuilding = nearbyRestaurants[Math.floor(Math.random() * nearbyRestaurants.length)];
                        citizen.isShoppingVisit = false;
                        citizen.isDiningVisit = true;
                        citizen.isEntertainmentVisit = false;
                        citizen.isServiceVisit = false;
                    } else if (randomChoice < 0.70 && nearbyEntertainment.length > 0) {
                        // 20% chance to visit entertainment
                        targetBuilding = nearbyEntertainment[Math.floor(Math.random() * nearbyEntertainment.length)];
                        citizen.isShoppingVisit = false;
                        citizen.isDiningVisit = false;
                        citizen.isEntertainmentVisit = true;
                        citizen.isServiceVisit = false;
                    } else if (randomChoice < 0.90 && nearbyServices.length > 0) {
                        // 20% chance to visit service
                        targetBuilding = nearbyServices[Math.floor(Math.random() * nearbyServices.length)];
                        citizen.isShoppingVisit = false;
                        citizen.isDiningVisit = false;
                        citizen.isEntertainmentVisit = false;
                        citizen.isServiceVisit = true;
                    } else {
                        // 10% chance to visit any building
                        const nearbyBuildings = this.scene.buildings.filter(b =>
                            Math.abs(b.x - citizen.x) < 500
                        );
                        if (nearbyBuildings.length > 0) {
                            targetBuilding = nearbyBuildings[Math.floor(Math.random() * nearbyBuildings.length)];
                            citizen.isShoppingVisit = false;
                            citizen.isDiningVisit = false;
                            citizen.isEntertainmentVisit = false;
                            citizen.isServiceVisit = false;
                        }
                    }

                    if (targetBuilding) {
                        citizen.targetBuilding = targetBuilding;
                        citizen.direction = citizen.x < targetBuilding.x ? 1 : -1;
                    }
                }

                // Check if reached target building
                if (citizen.targetBuilding) {
                    // Safety check: make sure building still exists
                    if (!this.scene.buildings.includes(citizen.targetBuilding)) {
                        citizen.targetBuilding = null;
                        citizen.direction = Math.random() > 0.5 ? 1 : -1;
                    } else {
                        const distanceToBuilding = Math.abs(citizen.x - citizen.targetBuilding.x);
                        if (distanceToBuilding < 50) {
                            // Special handling for restaurants - find available table
                            if (citizen.isDiningVisit && this.scene.isRestaurant(citizen.targetBuilding.type) && citizen.targetBuilding.tables) {
                                const availableTable = citizen.targetBuilding.tables.find(t => t.status === 'available');
                                if (availableTable) {
                                    // Occupy the table
                                    availableTable.status = 'occupied';
                                    availableTable.customer = citizen;
                                    availableTable.mealStartTime = this.scene.gameTime;
                                    availableTable.mealDuration = 15 + Math.random() * 20; // 15-35 game minutes

                                    citizen.state = 'visiting';
                                    citizen.visitTimer = availableTable.mealDuration / 60; // Convert game minutes to real seconds
                                    citizen.occupiedTable = availableTable;
                                    citizen.container.setVisible(false); // Hide while dining
                                    console.log(`🍽️ Customer seated at restaurant, will dine for ${Math.floor(availableTable.mealDuration)} game minutes`);
                                } else {
                                    // No tables available, leave
                                    citizen.targetBuilding = null;
                                    citizen.direction = Math.random() > 0.5 ? 1 : -1;
                                }
                            } else {
                                // Regular building visit
                                citizen.state = 'visiting';
                                citizen.visitTimer = 5 + Math.random() * 10; // Visit for 5-15 seconds
                                citizen.container.setVisible(false); // Hide while inside building
                            }
                        }
                    }
                }
            } else if (citizen.state === 'waiting') {
                // Citizen is waiting at bus stop - just stand still
                citizen.waitTimer += deltaTime;

                // Small chance to give up waiting and start walking again
                if (citizen.waitTimer > 30 && Math.random() < 0.01) {
                    citizen.state = 'walking';
                    // Remove from bus stop waiting list
                    for (let stop of this.scene.busStops) {
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
                    // Safety check: make sure building still exists
                    if (citizen.targetBuilding && !this.scene.buildings.includes(citizen.targetBuilding)) {
                        citizen.targetBuilding = null;
                        citizen.state = 'walking';
                        citizen.container.setVisible(true);
                        citizen.direction = Math.random() > 0.5 ? 1 : -1;
                        continue;
                    }

                    // Process shop purchase if this was a shopping visit
                    if (citizen.isShoppingVisit && citizen.targetBuilding && this.scene.isShop(citizen.targetBuilding.type)) {
                        const shop = citizen.targetBuilding;
                        if (shop.inventory && shop.isOpen && shop.inventory.stock >= shop.inventory.salesPerCustomer) {
                            // Customer makes a purchase
                            shop.inventory.stock -= shop.inventory.salesPerCustomer;
                            const salePrice = shop.inventory.salesPerCustomer * 15; // $15 per unit sold

                            // Add to shop's accumulated income (collect when entering shop)
                            shop.accumulatedIncome = (shop.accumulatedIncome || 0) + salePrice;
                            console.log(`🛍️ Customer bought items at ${shop.type}. Stock now: ${shop.inventory.stock}. Shop income: $${Math.floor(shop.accumulatedIncome)}`);

                            const shopName = this.scene.buildingTypes[shop.type].name;
                            this.scene.uiManager.addNotification(`🛍️ Purchase at ${shopName} - $${salePrice}`);

                            // Update UI if player is currently viewing this shop
                            if (this.scene.insideShop && this.scene.currentShop === shop) {
                                this.scene.shopSystem.updateShopInventoryUI();
                            }
                        }
                        citizen.isShoppingVisit = false;
                    }

                    // Process restaurant payment if this was a dining visit
                    if (citizen.isDiningVisit && citizen.targetBuilding && this.scene.isRestaurant(citizen.targetBuilding.type)) {
                        const restaurant = citizen.targetBuilding;
                        const mealPrice = restaurant.mealPrice || 25;

                        // Customer pays for meal
                        restaurant.accumulatedIncome = (restaurant.accumulatedIncome || 0) + mealPrice;
                        console.log(`🍽️ Customer paid $${mealPrice} for meal. Restaurant income: $${Math.floor(restaurant.accumulatedIncome)}`);

                        const restaurantName = this.scene.buildingTypes[restaurant.type].name;
                        this.scene.uiManager.addNotification(`🍽️ Meal at ${restaurantName} - $${mealPrice}`);

                        // Mark table as dirty if citizen has an occupied table
                        if (citizen.occupiedTable) {
                            citizen.occupiedTable.status = 'dirty';
                            citizen.occupiedTable.customer = null;
                            citizen.occupiedTable.mealStartTime = null;
                            citizen.occupiedTable.mealDuration = 0;
                            citizen.occupiedTable = null;
                            console.log(`🍽️ Table marked as dirty after customer left`);

                            // Update UI if player is currently viewing this restaurant
                            if (this.scene.insideRestaurant && this.scene.currentRestaurant === restaurant) {
                                this.scene.restaurantSystem.updateRestaurantUI();
                            }
                        }

                        citizen.isDiningVisit = false;
                    }

                    // Process entertainment payment if this was an entertainment visit
                    if (citizen.isEntertainmentVisit && citizen.targetBuilding && this.scene.isEntertainment(citizen.targetBuilding.type)) {
                        const entertainment = citizen.targetBuilding;
                        const buildingType = this.scene.buildingTypes[entertainment.type];
                        let totalIncome = buildingType.ticketPrice || buildingType.gamePlayPrice || 10;

                        // Movie theater specific: add concession sales
                        if (entertainment.type === 'movieTheater' && Math.random() < buildingType.concessionChance) {
                            totalIncome += buildingType.concessionPrice;
                        }

                        // Customer pays for entertainment
                        entertainment.accumulatedIncome = (entertainment.accumulatedIncome || 0) + totalIncome;
                        console.log(`🎡 Customer visited ${entertainment.type}. Income: $${Math.floor(entertainment.accumulatedIncome)}`);

                        const icon = entertainment.type === 'themePark' ? '🎡' : entertainment.type === 'movieTheater' ? '🎬' : '🕹️';
                        const name = entertainment.type === 'themePark' ? 'Theme Park' : entertainment.type === 'movieTheater' ? 'Movie Theater' : 'Arcade';
                        this.scene.uiManager.addNotification(`${icon} ${name} visit - $${totalIncome}`);

                        citizen.isEntertainmentVisit = false;
                    }

                    // Process library/museum payment if this was a service visit
                    if (citizen.isServiceVisit && citizen.targetBuilding && this.scene.isService(citizen.targetBuilding.type)) {
                        const service = citizen.targetBuilding;
                        const buildingType = this.scene.buildingTypes[service.type];
                        let totalIncome = 0;

                        if (service.type === 'library') {
                            // 15% chance of late fee
                            if (Math.random() < (buildingType.lateFeeChance || 0.15)) {
                                const lateFee = buildingType.lateFeeAmount || 5;
                                totalIncome += lateFee;
                                console.log(`📚 Customer paid $${lateFee} late fee at library`);
                            }
                        } else if (service.type === 'museum') {
                            // Admission ticket (always)
                            totalIncome += buildingType.admissionPrice || 15;

                            // 40% chance of gift shop purchase
                            if (Math.random() < (buildingType.giftShopChance || 0.40)) {
                                const giftShopPrice = buildingType.giftShopPrice || 20;
                                totalIncome += giftShopPrice;
                                console.log(`🎁 Customer bought from museum gift shop: $${giftShopPrice}`);
                            }

                            // 30% chance of cafe purchase
                            if (Math.random() < (buildingType.cafeChance || 0.30)) {
                                const cafePrice = buildingType.cafePrice || 12;
                                totalIncome += cafePrice;
                                console.log(`☕ Customer visited museum cafe: $${cafePrice}`);
                            }

                            console.log(`🏛️ Customer visit to museum. Total: $${totalIncome}`);
                        }

                        if (totalIncome > 0) {
                            service.accumulatedIncome = (service.accumulatedIncome || 0) + totalIncome;
                            console.log(`${service.type} income: $${Math.floor(service.accumulatedIncome)}`);

                            const serviceName = this.scene.buildingTypes[service.type].name;
                            const icon = service.type === 'library' ? '📚' : '🏛️';
                            this.scene.uiManager.addNotification(`${icon} ${serviceName} visit - $${totalIncome}`);
                        }

                        citizen.isServiceVisit = false;
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
