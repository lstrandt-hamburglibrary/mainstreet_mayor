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

        // Spawn train at the leftmost station
        const leftmostStation = stations.reduce((min, station) =>
            station.x < min.x ? station : min
        , stations[0]);

        const groundLevel = this.scene.gameHeight - 100;
        const startX = -200; // Start off-screen left

        this.createTrain(startX, groundLevel - 50, 1, stations);

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification('🚂 Train arriving!');
        }
    }

    createTrain(startX, startY, direction, stations) {
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
