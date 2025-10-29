/**
 * EventSystem - Manages town events like parades, festivals, and sales
 * Handles airplane announcements, event scheduling, and special effects
 */
export class EventSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEvent = null;
        this.airplane = null;
        this.nextEventTime = null;
    }

    /**
     * Create airplane with advertising banner
     * @param {string} message - Message to display on banner
     * @param {number} startY - Y position for airplane
     */
    createAirplane(message, startY) {
        // Start off-screen to the left
        const startX = -200;
        const y = startY || this.scene.gameHeight * 0.2; // Upper part of sky

        // Create airplane container
        const airplane = this.scene.add.container(startX, y);
        airplane.setDepth(5); // Behind mountains (6) but above sky (1)

        // Airplane body (small propeller plane)
        const body = this.scene.add.graphics();

        // Fuselage (main body)
        body.fillStyle(0xE53935, 1); // Red plane
        body.fillRect(0, -8, 50, 16);

        // Nose cone
        body.beginPath();
        body.moveTo(50, -8);
        body.lineTo(60, 0);
        body.lineTo(50, 8);
        body.closePath();
        body.fillPath();

        // Wings
        body.fillStyle(0xE53935, 1);
        body.fillRect(15, -30, 30, 8); // Top wing
        body.fillRect(15, 14, 30, 8);  // Bottom wing

        // Tail
        body.fillRect(-15, -12, 15, 4);
        body.fillRect(-15, -20, 8, 12); // Vertical stabilizer

        // Propeller (will animate)
        const propeller = this.scene.add.graphics();
        propeller.lineStyle(3, 0x424242, 1);
        propeller.lineBetween(-5, -15, -5, 15); // Vertical blade
        propeller.lineBetween(-20, 0, 10, 0);   // Horizontal blade
        propeller.x = -5;
        propeller.y = 0;

        // Windows
        body.fillStyle(0x81D4FA, 1);
        body.fillCircle(20, -2, 4);
        body.fillCircle(32, -2, 4);

        airplane.add(body);
        airplane.add(propeller);

        // Create banner with message
        const bannerWidth = message.length * 12 + 40;
        const banner = this.scene.add.container(0, 0);

        // Banner background
        const bannerBg = this.scene.add.rectangle(-20, 0, bannerWidth, 30, 0xFFFFFF, 1);
        bannerBg.setStrokeStyle(2, 0x000000);
        banner.add(bannerBg);

        // Banner text
        const bannerText = this.scene.add.text(-20, 0, message, {
            fontSize: '16px',
            color: '#000000',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        banner.add(bannerText);

        // Position banner behind plane
        banner.x = -80;
        banner.y = 0;
        airplane.add(banner);

        // Store references
        airplane.propeller = propeller;
        airplane.banner = banner;
        airplane.speed = 150; // pixels per second

        this.airplane = airplane;
        return airplane;
    }

    /**
     * Update airplane position and animation
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateAirplane(deltaTime) {
        if (!this.airplane) return;

        // Move airplane across screen
        this.airplane.x += this.airplane.speed * deltaTime;

        // Spin propeller
        if (this.airplane.propeller) {
            this.airplane.propeller.rotation += deltaTime * 20; // Fast spin
        }

        // Remove airplane when it's off-screen
        if (this.airplane.x > 12200) { // Past the end of the street
            this.airplane.destroy();
            this.airplane = null;
        }
    }

    /**
     * Start a holiday parade event
     */
    startHolidayParade() {
        console.log('🎄 Starting Holiday Parade!');

        // Announce with airplane
        this.createAirplane('🎄 HOLIDAY PARADE TODAY! 🎄', this.scene.gameHeight * 0.2);

        // Create parade after airplane passes (5 seconds)
        this.scene.time.delayedCall(5000, () => {
            this.createParadeFloats();
        });

        // Add notification
        this.scene.uiManager.addNotification('🎄 Holiday Parade starting! Watch the street!');

        // Set active event
        this.activeEvent = {
            type: 'holiday_parade',
            startTime: this.scene.gameTime,
            duration: 480, // 8 game hours (8 * 60 minutes)
            incomeMultiplier: 1.5 // 50% more income during parade
        };
    }

    /**
     * Create parade floats that move down the street
     */
    createParadeFloats() {
        console.log('🎪 Creating parade floats!');

        const groundY = this.scene.gameHeight - 140; // On the street
        const floats = [];

        // Float 1: Christmas Tree Float
        const treeFloat = this.scene.add.container(-200, groundY);
        treeFloat.setDepth(10);

        const treePlatform = this.scene.add.graphics();
        treePlatform.fillStyle(0x8B4513, 1);
        treePlatform.fillRect(-50, 0, 100, 30);
        treePlatform.lineStyle(3, 0x000000, 1);
        treePlatform.strokeRect(-50, 0, 100, 30);
        treeFloat.add(treePlatform);

        // Christmas tree
        const tree = this.scene.add.graphics();
        tree.fillStyle(0x2E7D32, 1);
        tree.fillTriangle(-30, 0, 0, -60, 30, 0);
        tree.fillTriangle(-25, -20, 0, -70, 25, -20);
        tree.fillTriangle(-20, -40, 0, -80, 20, -40);
        // Gold star on top (simple 5-pointed star using lines)
        tree.fillStyle(0xFFD700, 1);
        tree.beginPath();
        tree.moveTo(0, -85);
        tree.lineTo(-3, -78);
        tree.lineTo(-10, -78);
        tree.lineTo(-4, -73);
        tree.lineTo(-6, -66);
        tree.lineTo(0, -70);
        tree.lineTo(6, -66);
        tree.lineTo(4, -73);
        tree.lineTo(10, -78);
        tree.lineTo(3, -78);
        tree.closePath();
        tree.fillPath();
        treeFloat.add(tree);

        // Ornaments
        tree.fillStyle(0xFF0000, 1);
        tree.fillCircle(-10, -20, 4);
        tree.fillCircle(12, -30, 4);
        tree.fillStyle(0x0000FF, 1);
        tree.fillCircle(8, -45, 4);
        tree.fillCircle(-15, -50, 4);

        floats.push(treeFloat);

        // Float 2: Santa Float (200px behind)
        const santaFloat = this.scene.add.container(-400, groundY);
        santaFloat.setDepth(10);

        const santaPlatform = this.scene.add.graphics();
        santaPlatform.fillStyle(0xDC143C, 1);
        santaPlatform.fillRect(-50, 0, 100, 30);
        santaPlatform.lineStyle(3, 0x000000, 1);
        santaPlatform.strokeRect(-50, 0, 100, 30);
        santaFloat.add(santaPlatform);

        // Simple Santa figure
        const santa = this.scene.add.graphics();
        // Red suit
        santa.fillStyle(0xDC143C, 1);
        santa.fillRect(-15, -50, 30, 50);
        // White trim
        santa.fillStyle(0xFFFFFF, 1);
        santa.fillRect(-15, -50, 30, 8);
        santa.fillRect(-15, -10, 30, 8);
        // Head
        santa.fillStyle(0xFFDBB3, 1);
        santa.fillCircle(0, -65, 12);
        // Hat
        santa.fillStyle(0xDC143C, 1);
        santa.fillTriangle(-12, -65, 0, -85, 12, -65);
        santa.fillStyle(0xFFFFFF, 1);
        santa.fillCircle(0, -85, 4);
        santaFloat.add(santa);

        floats.push(santaFloat);

        // Float 3: Snowman Float (200px behind)
        const snowmanFloat = this.scene.add.container(-600, groundY);
        snowmanFloat.setDepth(10);

        const snowmanPlatform = this.scene.add.graphics();
        snowmanPlatform.fillStyle(0x81D4FA, 1);
        snowmanPlatform.fillRect(-50, 0, 100, 30);
        snowmanPlatform.lineStyle(3, 0x000000, 1);
        snowmanPlatform.strokeRect(-50, 0, 100, 30);
        snowmanFloat.add(snowmanPlatform);

        // Snowman
        const snowman = this.scene.add.graphics();
        snowman.fillStyle(0xFFFFFF, 1);
        snowman.fillCircle(0, -15, 18); // Bottom
        snowman.fillCircle(0, -40, 14); // Middle
        snowman.fillCircle(0, -60, 10); // Head
        snowman.lineStyle(2, 0x000000, 1);
        snowman.strokeCircle(0, -15, 18);
        snowman.strokeCircle(0, -40, 14);
        snowman.strokeCircle(0, -60, 10);
        // Eyes
        snowman.fillStyle(0x000000, 1);
        snowman.fillCircle(-4, -62, 2);
        snowman.fillCircle(4, -62, 2);
        // Nose
        snowman.fillStyle(0xFF6347, 1);
        snowman.fillTriangle(0, -58, 8, -58, 0, -56);
        // Hat
        snowman.fillStyle(0x000000, 1);
        snowman.fillRect(-8, -70, 16, 4);
        snowman.fillRect(-6, -80, 12, 10);
        snowmanFloat.add(snowman);

        floats.push(snowmanFloat);

        // Store floats for animation
        this.paradeFloats = floats;
        this.paradeFloatSpeed = 50; // Slow parade speed
    }

    /**
     * Update parade floats
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateParadeFloats(deltaTime) {
        if (!this.paradeFloats) return;

        for (let float of this.paradeFloats) {
            // Move float to the right
            float.x += this.paradeFloatSpeed * deltaTime;

            // Remove float when it's off-screen
            if (float.x > 12200) {
                float.destroy();
                this.paradeFloats = this.paradeFloats.filter(f => f !== float);
            }
        }

        // End parade when all floats are gone
        if (this.paradeFloats.length === 0) {
            this.endEvent();
        }
    }

    /**
     * Update active events
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update airplane if exists
        this.updateAirplane(deltaTime);

        // Update parade floats if exists
        this.updateParadeFloats(deltaTime);

        // Check if event should end based on duration
        if (this.activeEvent) {
            const eventDuration = this.scene.gameTime - this.activeEvent.startTime;
            if (eventDuration >= this.activeEvent.duration) {
                this.endEvent();
            }
        }
    }

    /**
     * End the current event
     */
    endEvent() {
        if (!this.activeEvent) return;

        console.log(`🎪 Event ended: ${this.activeEvent.type}`);
        this.scene.uiManager.addNotification('Event ended! Thanks for participating!');

        this.activeEvent = null;
    }

    /**
     * Get current event income multiplier
     */
    getIncomeMultiplier() {
        if (this.activeEvent && this.activeEvent.incomeMultiplier) {
            return this.activeEvent.incomeMultiplier;
        }
        return 1.0;
    }
}
