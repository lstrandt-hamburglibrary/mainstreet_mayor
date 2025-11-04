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
        // Main body (red)
        graphics.fillStyle(0xD32F2F, 1);
        graphics.fillRect(-30, -12, 60, 24);

        // Cab section (darker red)
        graphics.fillStyle(0xB71C1C, 1);
        graphics.fillRect(15, -12, 15, 24);

        // Windows
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(18, -8, 10, 8);

        // Yellow stripe
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillRect(-30, 0, 60, 4);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-15, 12, 5);
        graphics.fillCircle(10, 12, 5);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-15, 12, 3);
        graphics.fillCircle(10, 12, 3);
    }

    drawPoliceCar(graphics) {
        // Main body (blue and white)
        graphics.fillStyle(0x1565C0, 1);
        graphics.fillRect(-25, -10, 50, 20);

        // Hood
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-25, -10, 50, 8);

        // Windows
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(-20, -8, 12, 6);
        graphics.fillRect(8, -8, 12, 6);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-12, 10, 4);
        graphics.fillCircle(12, 10, 4);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-12, 10, 2);
        graphics.fillCircle(12, 10, 2);

        // Badge decal
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(0, -5, 3);
    }

    drawAmbulance(graphics) {
        // Main body (white)
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-28, -12, 56, 24);

        // Red stripe
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(-28, -2, 56, 4);

        // Cab section
        graphics.fillStyle(0xF0F0F0, 1);
        graphics.fillRect(16, -12, 12, 24);

        // Windows
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-24, -8, 10, 8);
        graphics.fillRect(18, -8, 8, 8);

        // Red cross
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(-3, -8, 6, 16);
        graphics.fillRect(-8, -3, 16, 6);

        // Wheels
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-14, 12, 5);
        graphics.fillCircle(14, 12, 5);

        // Wheel rims
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-14, 12, 3);
        graphics.fillCircle(14, 12, 3);
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
