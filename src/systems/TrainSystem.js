export class TrainSystem {
    constructor(scene) {
        this.scene = scene;
        this.trains = [];
        this.lastTrainSpawn = 0;
        this.TRAIN_INTERVAL = 180; // Spawn train every 180 game minutes (3 hours)
        this.TRAIN_CAPACITY = 80; // Can hold 80 passengers!
        this.TRAIN_SPEED = 200; // Faster than buses
        this.RAIL_FARE = 3; // $3 per passenger
        this.totalRevenue = 0; // Track total rail revenue
        this.totalPassengers = 0; // Track total passengers served

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 400; // Game time units between prompts
        this.promptedUpgrades = new Set();
        this.averageCapacityUsage = 0; // Track how full trains typically are
    }

    update() {
        const currentTime = this.scene.gameTime || 0;

        // Spawn trains periodically
        if (currentTime - this.lastTrainSpawn >= this.TRAIN_INTERVAL) {
            this.spawnTrain();
            this.lastTrainSpawn = currentTime;
        }

        // Update existing trains
        this.updateTrains();
    }

    spawnTrain() {
        // Find all train stations
        const stations = this.scene.buildings.filter(b => b.type === 'trainStation');

        if (stations.length === 0) {
            return; // No stations, no trains
        }

        // Randomly pick a street to spawn the train on (from unlocked streets)
        const randomStreetIndex = Math.floor(Math.random() * this.scene.unlockedStreets);
        const street = this.scene.streets[randomStreetIndex];

        if (!street) {
            return; // Street doesn't exist
        }

        console.log(`🚂 Spawning train on street ${randomStreetIndex + 1} with ${stations.length} station(s)`);

        const trainY = street.platformY - 50;
        const startX = -200; // Start off-screen left

        this.createTrain(startX, trainY, 1, stations, randomStreetIndex + 1);

        if (this.scene.uiManager) {
            const streetName = street.name || `Street ${randomStreetIndex + 1}`;
            this.scene.uiManager.addNotification(`🚂 Train arriving on ${streetName}!`);
        }
    }

    createTrain(startX, startY, direction, stations, streetNumber = 1) {
        const container = this.scene.add.container(startX, startY);
        container.setDepth(12);

        // Train engine (front car)
        const engine = this.scene.add.graphics();

        // Main engine body (red)
        engine.fillStyle(0xD32F2F, 1);
        engine.fillRect(-60, -45, 120, 90);

        // Engine nose (darker red)
        engine.fillStyle(0xB71C1C, 1);
        engine.beginPath();
        engine.moveTo(60, -45);
        engine.lineTo(80, -30);
        engine.lineTo(80, 30);
        engine.lineTo(60, 45);
        engine.closePath();
        engine.fillPath();

        // Yellow stripe
        engine.fillStyle(0xFFEB3B, 1);
        engine.fillRect(-60, -5, 120, 10);

        // Windows (engine)
        engine.fillStyle(0x87CEEB, 1);
        engine.fillRect(20, -35, 30, 25);
        engine.fillRect(-50, -35, 30, 25);

        // Wheels
        engine.fillStyle(0x424242, 1);
        for (let i = 0; i < 4; i++) {
            const wx = -40 + (i * 30);
            engine.fillCircle(wx, 45, 8);
            engine.fillStyle(0x212121, 1);
            engine.fillCircle(wx, 45, 5);
            engine.fillStyle(0x424242, 1);
        }

        container.add(engine);

        // Passenger cars (3 cars behind engine)
        for (let car = 0; car < 3; car++) {
            const carX = -200 - (car * 140); // Position behind engine
            const carGraphics = this.scene.add.graphics();

            // Car body (blue)
            carGraphics.fillStyle(0x1976D2, 1);
            carGraphics.fillRect(carX - 60, -40, 120, 80);

            // Windows (multiple)
            carGraphics.fillStyle(0x87CEEB, 1);
            for (let w = 0; w < 4; w++) {
                const wx = carX - 45 + (w * 30);
                carGraphics.fillRect(wx, -30, 20, 25);
            }

            // White stripe
            carGraphics.fillStyle(0xFFFFFF, 1);
            carGraphics.fillRect(carX - 60, -5, 120, 10);

            // Wheels
            carGraphics.fillStyle(0x424242, 1);
            for (let i = 0; i < 3; i++) {
                const wx = carX - 40 + (i * 40);
                carGraphics.fillCircle(wx, 40, 8);
                carGraphics.fillStyle(0x212121, 1);
                carGraphics.fillCircle(wx, 40, 5);
                carGraphics.fillStyle(0x424242, 1);
            }

            container.add(carGraphics);
        }

        // Create train data
        const train = {
            container: container,
            x: startX,
            y: startY,
            direction: direction,
            speed: this.TRAIN_SPEED,
            passengers: [],
            stations: stations,
            currentStationIndex: 0,
            isAtStation: false,
            stopTimer: 0,
            maxCapacity: this.TRAIN_CAPACITY
        };

        this.trains.push(train);
    }

    updateTrains() {
        const deltaTime = 1/60;

        for (let i = this.trains.length - 1; i >= 0; i--) {
            const train = this.trains[i];

            if (!train.isAtStation) {
                // Move train
                train.x += train.direction * train.speed * deltaTime;
                train.container.x = train.x;

                // Check if approaching a station
                if (train.currentStationIndex < train.stations.length) {
                    const nextStation = train.stations[train.currentStationIndex];
                    const distance = Math.abs(train.x - nextStation.x);

                    if (distance < 50) {
                        // Arrived at station
                        train.isAtStation = true;
                        train.stopTimer = 0;
                        this.boardPassengers(train, nextStation);
                    }
                }

                // Check if train has passed all stations and should leave
                if (train.currentStationIndex >= train.stations.length && train.x > 12200) {
                    // Train has left the city - remove it
                    this.removeTrain(i);
                    continue;
                }
            } else {
                // At station - wait for passengers
                train.stopTimer += deltaTime;

                if (train.stopTimer >= 3) { // Stop for 3 seconds
                    train.isAtStation = false;
                    train.currentStationIndex++;
                }
            }
        }
    }

    boardPassengers(train, station) {
        if (!station.waitingCitizens) {
            station.waitingCitizens = [];
        }

        // Find citizens waiting at this station
        const stationX = station.x;
        const waitingCitizens = this.scene.citizens.filter(citizen =>
            citizen.targetTrainStation === station &&
            Math.abs(citizen.x - stationX) < 100
        );

        let boardedCount = 0;
        const availableSeats = train.maxCapacity - train.passengers.length;

        for (let citizen of waitingCitizens) {
            if (boardedCount >= availableSeats) {
                break; // Train is full
            }

            // Board the citizen
            train.passengers.push({
                citizen: citizen,
                isTourist: citizen.isTourist || false
            });

            // Hide the citizen
            if (citizen.container) {
                citizen.container.setVisible(false);
            }

            citizen.state = 'riding_train';
            boardedCount++;
        }

        if (boardedCount > 0) {
            // Collect rail fares
            const fareCollected = boardedCount * this.RAIL_FARE;
            this.totalRevenue += fareCollected;
            this.totalPassengers += boardedCount;

            // Add money to the city
            this.scene.money += fareCollected;

            // Track capacity usage for milestone checking
            const capacityUsage = train.passengers.length / train.maxCapacity;
            this.averageCapacityUsage = (this.averageCapacityUsage * 0.8) + (capacityUsage * 0.2);

            console.log(`🚂 Train picked up ${boardedCount} passengers at station (${train.passengers.length}/${train.maxCapacity} capacity)`);
            console.log(`💰 Collected $${fareCollected} in rail fares (Total: $${this.totalRevenue})`);

            if (this.scene.uiManager) {
                this.scene.uiManager.addNotification(`🚂 ${boardedCount} passengers boarded (+$${fareCollected})`);
            }
        }

        // If this is the last station, all passengers will leave the city
        if (train.currentStationIndex === train.stations.length - 1) {
            this.unloadAllPassengers(train);
        }
    }

    checkMilestones() {
        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        // Celebrate revenue milestones
        const revenueMilestones = [500, 1000, 2500, 5000, 10000];
        for (let milestone of revenueMilestones) {
            if (this.totalRevenue >= milestone && !this.promptedUpgrades.has(`revenue-${milestone}`)) {
                this.showInfoPopup(
                    '🚂 Rail Success!',
                    `Your train system has generated $${this.totalRevenue} in total revenue! ${this.totalPassengers} passengers have traveled by rail.`
                );
                this.promptedUpgrades.add(`revenue-${milestone}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }
        }

        // Suggest more stations if trains are consistently full
        const stations = this.scene.buildings.filter(b => b.type === 'trainStation');
        if (this.averageCapacityUsage > 0.7 &&
            stations.length < 3 &&
            this.totalPassengers > 50 &&
            !this.promptedUpgrades.has(`expand-${stations.length}`)) {

            this.showInfoPopup(
                '🚂 High Demand!',
                `Trains are running at ${Math.round(this.averageCapacityUsage * 100)}% capacity! Consider building more train stations to handle the growing demand.`
            );
            this.promptedUpgrades.add(`expand-${stations.length}`);
            this.lastUpgradePrompt = currentTime;
            return;
        }
    }

    showInfoPopup(title, message) {
        // Create popup
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -100, 500, 200, 10);
        bg.lineStyle(3, 0x795548, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        // Title
        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#795548',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        // Message
        const messageText = this.scene.add.text(0, -10, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        // OK button
        const okBtn = this.createPopupButton(popup, 0, 60, '✓ OK', () => {
            popup.destroy();
        }, '#4CAF50');

        // Auto-close after 8 seconds
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

    unloadAllPassengers(train) {
        if (train.passengers.length === 0) return;

        const departingCount = train.passengers.length;
        console.log(`🚂 Train departing with ${departingCount} passengers (tourists leaving city)`);

        // Remove all passengers (they're leaving the city permanently)
        for (let passenger of train.passengers) {
            const citizen = passenger.citizen;

            // Remove from citizens array
            const citizenIndex = this.scene.citizens.indexOf(citizen);
            if (citizenIndex !== -1) {
                this.scene.citizens.splice(citizenIndex, 1);
            }

            // Destroy the visual
            if (citizen.container) {
                citizen.container.destroy();
            }
        }

        // Update population
        this.scene.population = this.scene.citizens.length;

        train.passengers = [];

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`🚂 Train departed with ${departingCount} passengers!`);
        }
    }

    removeTrain(index) {
        const train = this.trains[index];
        if (train && train.container) {
            train.container.destroy();
        }
        this.trains.splice(index, 1);
    }

    // Called when a citizen wants to leave via train
    sendCitizenToNearestStation(citizen) {
        const stations = this.scene.buildings.filter(b => b.type === 'trainStation');
        if (stations.length === 0) return false;

        // Find nearest station
        let nearestStation = stations[0];
        let nearestDistance = Math.abs(citizen.x - nearestStation.x);

        for (let station of stations) {
            const distance = Math.abs(citizen.x - station.x);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestStation = station;
            }
        }

        // Send citizen to station
        citizen.targetTrainStation = nearestStation;
        citizen.targetX = nearestStation.x;
        citizen.state = 'walking';
        citizen.waitingForTrain = true;

        if (!nearestStation.waitingCitizens) {
            nearestStation.waitingCitizens = [];
        }
        nearestStation.waitingCitizens.push(citizen);

        return true;
    }

    destroy() {
        for (let train of this.trains) {
            if (train.container) {
                train.container.destroy();
            }
        }
        this.trains = [];
    }
}
