/**
 * WeatherSystem - Manages weather conditions and effects
 * Handles rain, snow, sunny weather, and seasonal transitions
 */
export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentWeather = 'sunny'; // sunny, rainy, snowy
        this.weatherParticles = [];
        this.clouds = []; // Cloud graphics
        this.nextWeatherChange = null;
        this.weatherDuration = 0; // How long current weather lasts (in game minutes)
        this.weatherStartTime = 0;
    }

    /**
     * Initialize weather system and set initial weather
     */
    initialize() {
        // Start with random weather
        this.changeWeather(this.getRandomWeather());
    }

    /**
     * Get a random weather type based on season
     */
    getRandomWeather() {
        const totalMinutes = Math.floor(this.scene.gameTime);
        const dayOfYear = Math.floor(totalMinutes / (24 * 60)) % 365;

        // Simple seasons: Winter (days 0-90, 330-365), Spring (91-180), Summer (181-270), Fall (271-329)
        let season = 'spring';
        if (dayOfYear < 90 || dayOfYear >= 330) {
            season = 'winter';
        } else if (dayOfYear >= 91 && dayOfYear <= 180) {
            season = 'spring';
        } else if (dayOfYear >= 181 && dayOfYear <= 270) {
            season = 'summer';
        } else {
            season = 'fall';
        }

        const rand = Math.random();

        if (season === 'winter') {
            // Winter: 30% snow, 20% rain, 50% sunny
            if (rand < 0.30) return 'snowy';
            if (rand < 0.50) return 'rainy';
            return 'sunny';
        } else if (season === 'spring') {
            // Spring: 5% snow, 35% rain, 60% sunny
            if (rand < 0.05) return 'snowy';
            if (rand < 0.40) return 'rainy';
            return 'sunny';
        } else if (season === 'summer') {
            // Summer: 15% rain, 85% sunny
            if (rand < 0.15) return 'rainy';
            return 'sunny';
        } else {
            // Fall: 30% rain, 70% sunny
            if (rand < 0.30) return 'rainy';
            return 'sunny';
        }
    }

    /**
     * Change to a new weather condition
     */
    changeWeather(newWeather) {
        if (this.currentWeather === newWeather) return;

        console.log(`🌦️ Weather changing from ${this.currentWeather} to ${newWeather}`);

        // Clear existing weather particles
        this.clearWeatherParticles();

        this.currentWeather = newWeather;
        this.weatherStartTime = this.scene.gameTime;

        // Set random duration (2-8 game hours)
        this.weatherDuration = 120 + Math.random() * 360; // 120-480 minutes

        // Create weather effects
        if (newWeather === 'rainy') {
            this.createRain();
            this.scene.uiManager.addNotification('🌧️ It\'s starting to rain!');
        } else if (newWeather === 'snowy') {
            this.createSnow();
            this.scene.uiManager.addNotification('❄️ It\'s starting to snow!');
        } else {
            this.scene.uiManager.addNotification('☀️ The weather has cleared up!');
        }
    }

    /**
     * Create clouds that cover the sun
     */
    createClouds() {
        const numClouds = 8; // Number of clouds

        for (let i = 0; i < numClouds; i++) {
            const x = (i * 1500) + Math.random() * 300;
            const y = 50 + Math.random() * 150; // Upper portion of sky

            const cloud = this.scene.add.graphics();
            cloud.fillStyle(0x909090, 0.7); // Gray clouds

            // Draw cloud using overlapping circles
            cloud.fillCircle(0, 0, 40);
            cloud.fillCircle(30, -10, 35);
            cloud.fillCircle(60, 0, 40);
            cloud.fillCircle(90, -5, 30);
            cloud.fillCircle(45, 10, 35);

            cloud.setPosition(x, y);
            cloud.setDepth(4); // Behind mountains (6) but above sky (1)
            cloud.setScrollFactor(0.3); // Slow parallax for distance effect

            // Store drift speed
            cloud.driftSpeed = 10 + Math.random() * 20; // Slow drift
            cloud.startX = x;

            this.clouds.push(cloud);
        }
    }

    /**
     * Create rain particles
     */
    createRain() {
        // Create clouds first
        this.createClouds();

        const numDrops = 150; // Number of raindrops visible at once

        for (let i = 0; i < numDrops; i++) {
            const x = Math.random() * 12000;
            const y = Math.random() * (this.scene.gameHeight - 200); // Don't rain on ground

            const raindrop = this.scene.add.graphics();
            raindrop.lineStyle(2, 0x4A90E2, 0.6);
            raindrop.lineBetween(0, 0, 0, 15); // Vertical line
            raindrop.setPosition(x, y);
            raindrop.setDepth(100); // Above everything
            raindrop.setScrollFactor(0.95); // Slight parallax

            // Store velocity and reset position
            raindrop.velocity = 400 + Math.random() * 200; // Fall speed
            raindrop.resetY = -20;
            raindrop.startX = x;

            this.weatherParticles.push(raindrop);
        }
    }

    /**
     * Create snow particles
     */
    createSnow() {
        // Create clouds first
        this.createClouds();

        const numFlakes = 100; // Number of snowflakes visible at once

        for (let i = 0; i < numFlakes; i++) {
            const x = Math.random() * 12000;
            const y = Math.random() * (this.scene.gameHeight - 200);

            const snowflake = this.scene.add.graphics();
            snowflake.fillStyle(0xFFFFFF, 0.8);
            snowflake.fillCircle(0, 0, 3);
            snowflake.setPosition(x, y);
            snowflake.setDepth(100); // Above everything
            snowflake.setScrollFactor(0.95); // Slight parallax

            // Store velocity and drift
            snowflake.velocity = 50 + Math.random() * 50; // Slow fall
            snowflake.drift = (Math.random() - 0.5) * 30; // Horizontal drift
            snowflake.resetY = -20;
            snowflake.startX = x;

            this.weatherParticles.push(snowflake);
        }
    }

    /**
     * Clear all weather particles and clouds
     */
    clearWeatherParticles() {
        for (let particle of this.weatherParticles) {
            particle.destroy();
        }
        this.weatherParticles = [];

        for (let cloud of this.clouds) {
            cloud.destroy();
        }
        this.clouds = [];
    }

    /**
     * Update weather particles and clouds
     */
    updateWeatherParticles(deltaTime) {
        // Update clouds (drift slowly across sky)
        for (let cloud of this.clouds) {
            cloud.x += cloud.driftSpeed * deltaTime;

            // Wrap around when off screen
            if (cloud.x > 12200) {
                cloud.x = -200;
            }
        }

        if (this.currentWeather === 'rainy') {
            // Update rain
            for (let drop of this.weatherParticles) {
                drop.y += drop.velocity * deltaTime;

                // Reset to top when off screen
                if (drop.y > this.scene.gameHeight - 100) {
                    drop.y = drop.resetY;
                    drop.x = drop.startX + (Math.random() - 0.5) * 200;
                }
            }
        } else if (this.currentWeather === 'snowy') {
            // Update snow
            for (let flake of this.weatherParticles) {
                flake.y += flake.velocity * deltaTime;
                flake.x += flake.drift * deltaTime;

                // Reset to top when off screen
                if (flake.y > this.scene.gameHeight - 100) {
                    flake.y = flake.resetY;
                    flake.x = flake.startX + (Math.random() - 0.5) * 200;
                }
            }
        }
    }

    /**
     * Update weather system
     */
    update(deltaTime) {
        // Update weather particles
        this.updateWeatherParticles(deltaTime);

        // Check if it's time to change weather
        const weatherElapsed = this.scene.gameTime - this.weatherStartTime;
        if (weatherElapsed >= this.weatherDuration) {
            this.changeWeather(this.getRandomWeather());
        }
    }

    /**
     * Get current weather type
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * Get income multiplier for entertainment buildings based on weather
     * Outdoor attractions (theme parks) are more affected than indoor (arcades)
     */
    getEntertainmentMultiplier(buildingType) {
        if (this.currentWeather === 'sunny') {
            return 1.0; // Normal income
        } else if (this.currentWeather === 'rainy') {
            // Rain hurts outdoor attractions more
            if (buildingType === 'themePark') {
                return 0.4; // 60% reduction for outdoor theme parks
            } else {
                return 0.9; // 10% reduction for indoor arcades
            }
        } else if (this.currentWeather === 'snowy') {
            // Snow hurts both but theme parks more
            if (buildingType === 'themePark') {
                return 0.2; // 80% reduction for outdoor theme parks
            } else {
                return 0.8; // 20% reduction for indoor arcades
            }
        }
        return 1.0;
    }

    /**
     * Force a specific weather (for testing or events)
     */
    setWeather(weatherType) {
        this.changeWeather(weatherType);
    }
}
