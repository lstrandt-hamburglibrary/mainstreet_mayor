export class EmergencyVehicleSystem {
    constructor(scene) {
        this.scene = scene;
        this.vehicles = [];
        this.lastSpawnCheck = 0;
    }

    update() {
        const currentTime = this.scene.gameTime || 0;
        const currentMinute = Math.floor(currentTime);
        const currentHour = Math.floor((currentTime % (60 * 24)) / 60);

        // Check for vehicle spawns every hour (60 game minutes)
        if (currentMinute - this.lastSpawnCheck >= 60) {
            this.checkEmergencyVehicleSpawns(currentHour);
            this.lastSpawnCheck = currentMinute;
        }

        // Update existing vehicles
        this.updateVehicles();
    }

    checkEmergencyVehicleSpawns(hour) {
        // Find all emergency buildings and check if they should spawn vehicles
        for (let building of this.scene.buildings) {
            const buildingType = this.scene.buildingTypes[building.type];

            if (buildingType && buildingType.specialType === 'emergency' && buildingType.vehicleSpawnChance) {
                // Random chance to spawn vehicle
                if (Math.random() < buildingType.vehicleSpawnChance) {
                    this.spawnEmergencyVehicle(building, buildingType);
                }
            }
        }
    }

    spawnEmergencyVehicle(building, buildingType) {
        const vehicleType = buildingType.vehicleType;

        // Determine spawn position (near the building)
        const spawnX = building.x + (Math.random() > 0.5 ? 200 : -200);
        const spawnY = this.scene.gameHeight - 120; // On the road

        // Determine direction (left or right)
        const direction = spawnX > building.x ? 1 : -1;

        // Create vehicle container
        const container = this.scene.add.container(spawnX, spawnY);

        // Draw vehicle based on type
        let vehicleGraphics = this.scene.add.graphics();
        let lightColors = [];
        let notification = '';

        switch (vehicleType) {
            case 'firetruck':
                this.drawFireTruck(vehicleGraphics);
                lightColors = [0xFF0000, 0xFFFFFF]; // Red and white
                notification = '🚒 Fire truck dispatched!';
                break;
            case 'policeCar':
                this.drawPoliceCar(vehicleGraphics);
                lightColors = [0xFF0000, 0x0000FF]; // Red and blue
                notification = '🚔 Police on patrol!';
                break;
            case 'ambulance':
                this.drawAmbulance(vehicleGraphics);
                lightColors = [0xFF0000, 0xFFFFFF]; // Red and white
                notification = '🚑 Ambulance responding!';
                break;
        }

        container.add(vehicleGraphics);

        // Add flashing lights
        const light1 = this.scene.add.circle(-20, -15, 4, lightColors[0]);
        const light2 = this.scene.add.circle(20, -15, 4, lightColors[1]);
        container.add([light1, light2]);

        // Set depth
        container.setDepth(10);

        // Scale based on direction
        container.setScale(direction, 1);

        // Create vehicle object
        const vehicle = {
            container: container,
            graphics: vehicleGraphics,
            lights: [light1, light2],
            lightColors: lightColors,
            x: spawnX,
            y: spawnY,
            direction: direction,
            speed: 150 + Math.random() * 100, // 150-250 pixels per second
            type: vehicleType,
            lightState: 0,
            lastLightToggle: Date.now()
        };

        this.vehicles.push(vehicle);

        // Show notification
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(notification);
        }
    }

    drawFireTruck(graphics) {
        // Scaled to match train/bus size (120 wide)
        const scale = 2;

        // Main body (red)
        graphics.fillStyle(0xD32F2F, 1);
        graphics.fillRect(-30*scale, -12*scale, 60*scale, 24*scale);

        // Cab section (darker red)
        graphics.fillStyle(0xB71C1C, 1);
        graphics.fillRect(15*scale, -12*scale, 15*scale, 24*scale);

        // Windows
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(18*scale, -8*scale, 10*scale, 8*scale);

        // Yellow stripe
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillRect(-30*scale, 0, 60*scale, 4*scale);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-15*scale, 12*scale, 5*scale);
        graphics.fillCircle(10*scale, 12*scale, 5*scale);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-15*scale, 12*scale, 3*scale);
        graphics.fillCircle(10*scale, 12*scale, 3*scale);
    }

    drawPoliceCar(graphics) {
        // Scaled to match train/bus size (120 wide)
        const scale = 2;

        // Main body (blue and white)
        graphics.fillStyle(0x1565C0, 1);
        graphics.fillRect(-25*scale, -10*scale, 50*scale, 20*scale);

        // Hood
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-25*scale, -10*scale, 50*scale, 8*scale);

        // Windows
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(-20*scale, -8*scale, 12*scale, 6*scale);
        graphics.fillRect(8*scale, -8*scale, 12*scale, 6*scale);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-12*scale, 10*scale, 4*scale);
        graphics.fillCircle(12*scale, 10*scale, 4*scale);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-12*scale, 10*scale, 2*scale);
        graphics.fillCircle(12*scale, 10*scale, 2*scale);

        // Badge decal
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(0, -5*scale, 3*scale);
    }

    drawAmbulance(graphics) {
        // Scaled to match train/bus size (120 wide)
        const scale = 2;

        // Main body (white)
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-28*scale, -12*scale, 56*scale, 24*scale);

        // Red stripe
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(-28*scale, -2*scale, 56*scale, 4*scale);

        // Cab section
        graphics.fillStyle(0xF0F0F0, 1);
        graphics.fillRect(16*scale, -12*scale, 12*scale, 24*scale);

        // Windows
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-24*scale, -8*scale, 10*scale, 8*scale);
        graphics.fillRect(18*scale, -8*scale, 8*scale, 8*scale);

        // Red cross
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(-3*scale, -8*scale, 6*scale, 16*scale);
        graphics.fillRect(-8*scale, -3*scale, 16*scale, 6*scale);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-14*scale, 12*scale, 5*scale);
        graphics.fillCircle(14*scale, 12*scale, 5*scale);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-14*scale, 12*scale, 3*scale);
        graphics.fillCircle(14*scale, 12*scale, 3*scale);
    }

    updateVehicles() {
        const deltaTime = 1/60; // Approximate frame time

        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];

            // Move vehicle
            vehicle.x += vehicle.direction * vehicle.speed * deltaTime;
            vehicle.container.x = vehicle.x;

            // Flashing lights animation
            const now = Date.now();
            if (now - vehicle.lastLightToggle > 200) { // Toggle every 200ms
                vehicle.lightState = 1 - vehicle.lightState;
                vehicle.lights[0].setFillStyle(vehicle.lightColors[vehicle.lightState]);
                vehicle.lights[1].setFillStyle(vehicle.lightColors[1 - vehicle.lightState]);
                vehicle.lastLightToggle = now;
            }

            // Remove vehicle if off-screen
            if (vehicle.x < -100 || vehicle.x > 12100) {
                this.removeVehicle(i);
            }
        }
    }

    removeVehicle(index) {
        const vehicle = this.vehicles[index];
        if (vehicle && vehicle.container) {
            vehicle.container.destroy();
        }
        this.vehicles.splice(index, 1);
    }

    destroy() {
        // Clean up all vehicles
        for (let vehicle of this.vehicles) {
            if (vehicle.container) {
                vehicle.container.destroy();
            }
        }
        this.vehicles = [];
    }
}
