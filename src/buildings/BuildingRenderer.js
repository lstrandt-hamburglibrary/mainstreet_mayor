import { BuildingTypes, ColorSchemes } from '../config/GameConfig.js';

export class BuildingRenderer {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Utility function to darken a color by a factor
     * @param {number} color - Hex color value
     * @param {number} factor - Darkening factor (0-1, where 0.85 = 85% brightness)
     * @returns {number} - Darkened hex color
     */
    darkenColor(color, factor) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        return ((r * factor) << 16) | ((g * factor) << 8) | (b * factor);
    }

    /**
     * Main function to draw building details based on type
     * @param {Phaser.GameObjects.Graphics} graphics - Graphics object to draw on
     * @param {string} type - Building type key
     * @param {number} x - X position
     * @param {number} y - Y position (bottom of building)
     * @param {number} facadeVariation - Color variation index (0-3)
     */
    drawBuildingDetails(graphics, type, x, y, facadeVariation = 0) {
        const building = BuildingTypes[type];

        if (type === 'house') {
            this.drawHouse(graphics, building, x, y, facadeVariation);
        } else if (type === 'apartment') {
            this.drawApartment(graphics, building, x, y, facadeVariation);
        } else if (type === 'hotel') {
            this.drawHotel(graphics, building, x, y, facadeVariation);
        } else if (type === 'clothingShop') {
            this.drawClothingShop(graphics, building, x, y, facadeVariation);
        } else if (type === 'electronicsShop') {
            this.drawElectronicsShop(graphics, building, x, y, facadeVariation);
        } else if (type === 'groceryStore') {
            this.drawGroceryStore(graphics, building, x, y, facadeVariation);
        } else if (type === 'bookstore') {
            this.drawBookstore(graphics, building, x, y, facadeVariation);
        } else if (type === 'restaurant') {
            this.drawRestaurant(graphics, building, x, y, facadeVariation);
        } else if (type === 'bank') {
            this.drawBank(graphics, building, x, y, facadeVariation);
        } else if (type === 'market') {
            this.drawMarket(graphics, building, x, y, facadeVariation);
        } else if (type === 'lumbermill') {
            this.drawLumberMill(graphics, building, x, y, facadeVariation);
        } else if (type === 'brickfactory') {
            this.drawBrickFactory(graphics, building, x, y, facadeVariation);
        }
    }

    drawHouse(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.house[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;
        const windowWidth = 20;
        const windowHeight = 25;
        const spacing = 25;

        // Floor separator line
        graphics.lineStyle(3, 0x654321, 1);
        graphics.lineBetween(x - building.width/2, y - building.height/2, x + building.width/2, y - building.height/2);

        // Windows (2 columns, 3 rows)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const wx = x - spacing + (col * spacing * 2);
                const wy = y - building.height + 50 + (row * 50);

                // Window shadow
                graphics.fillStyle(0x000000, 0.3);
                graphics.fillRect(wx - windowWidth/2 + 2, wy + 2, windowWidth, windowHeight);

                // Window
                graphics.fillStyle(windowColor, 1);
                graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                // Window reflection
                graphics.fillStyle(0xFFFFFF, 0.3);
                graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                // Window frame
                graphics.lineStyle(2, 0x654321, 1);
                graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                // Window cross
                graphics.lineStyle(1, 0x654321, 1);
                graphics.lineBetween(wx, wy, wx, wy + windowHeight);
                graphics.lineBetween(wx - windowWidth/2, wy + windowHeight/2, wx + windowWidth/2, wy + windowHeight/2);
            }
        }

        // Door shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 20 + 3, y - 50 + 3, 40, 50);

        // Front door
        graphics.fillStyle(scheme.door, 1);
        graphics.fillRect(x - 20, y - 50, 40, 50);
        graphics.lineStyle(2, 0x654321, 1);
        graphics.strokeRect(x - 20, y - 50, 40, 50);

        // Door panels
        graphics.lineStyle(1, 0x654321, 1);
        graphics.strokeRect(x - 15, y - 45, 12, 20);
        graphics.strokeRect(x + 3, y - 45, 12, 20);

        // Doorknob with shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(x + 13, y - 24, 3);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(x + 12, y - 25, 3);
        graphics.fillStyle(0xFFFF99, 0.5);
        graphics.fillCircle(x + 11, y - 26, 1.5);

        // Peaked roof - shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillTriangle(
            x - building.width/2 - 10, y - building.height,
            x, y - building.height - 35,
            x + building.width/2 + 10, y - building.height
        );

        // Left side of roof
        graphics.fillStyle(scheme.roof, 1);
        graphics.fillTriangle(
            x - building.width/2 - 10, y - building.height,
            x, y - building.height - 35,
            x, y - building.height
        );

        // Right side of roof (darker)
        const darkerRoof = this.darkenColor(scheme.roof, 0.85);
        graphics.fillStyle(darkerRoof, 1);
        graphics.fillTriangle(
            x, y - building.height - 35,
            x + building.width/2 + 10, y - building.height,
            x, y - building.height
        );

        // Roof outline
        graphics.lineStyle(2, 0x654321, 1);
        graphics.strokeTriangle(
            x - building.width/2 - 10, y - building.height,
            x, y - building.height - 35,
            x + building.width/2 + 10, y - building.height
        );

        // Roof ridge line
        graphics.lineStyle(1, 0x000000, 0.5);
        graphics.lineBetween(x, y - building.height, x, y - building.height - 35);
    }

    drawApartment(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.apartment[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;
        const windowWidth = 18;
        const windowHeight = 20;
        const floorHeight = building.height / 4; // 90px per floor

        // Floor separator lines
        graphics.lineStyle(2, 0x654321, 1);
        for (let floor = 1; floor < 4; floor++) {
            const floorY = y - (floor * floorHeight);
            graphics.lineBetween(x - building.width/2, floorY, x + building.width/2, floorY);
        }

        // Draw units (2 per floor, 4 floors = 8 units)
        for (let floor = 0; floor < 4; floor++) {
            for (let unit = 0; unit < 2; unit++) {
                const unitX = x - 50 + (unit * 100);
                const unitY = y - building.height + (floor * floorHeight) + 20;

                // Windows for each unit
                for (let win = 0; win < 2; win++) {
                    const wx = unitX - 15 + (win * 30);
                    const wy = unitY + 15;

                    // Window shadow
                    graphics.fillStyle(0x000000, 0.3);
                    graphics.fillRect(wx - windowWidth/2 + 1, wy + 1, windowWidth, windowHeight);

                    // Window
                    graphics.fillStyle(windowColor, 1);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                    // Window reflection
                    graphics.fillStyle(0xFFFFFF, 0.3);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                    // Window frame
                    graphics.lineStyle(1, 0x654321, 1);
                    graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);
                }
            }
        }

        // Main entrance
        const entranceWidth = 50;
        const entranceHeight = 70;
        const entranceY = y - entranceHeight;

        // Door frame shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, entranceWidth, entranceHeight);

        // Door frame
        graphics.fillStyle(scheme.door, 1);
        graphics.fillRect(x - entranceWidth/2, entranceY, entranceWidth, entranceHeight);

        // Glass doors
        graphics.fillStyle(0x87CEEB, 0.7);
        graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, (entranceWidth/2) - 5, entranceHeight - 6);
        graphics.fillRect(x + 2, entranceY + 3, (entranceWidth/2) - 5, entranceHeight - 6);

        // Glass reflection
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, (entranceWidth/2) - 5, (entranceHeight - 6)/2);
        graphics.fillRect(x + 2, entranceY + 3, (entranceWidth/2) - 5, (entranceHeight - 6)/2);

        // Door divider
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(x - 2, entranceY, 4, entranceHeight);

        // Door handles
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(x - 10, entranceY + entranceHeight/2, 3);
        graphics.fillCircle(x + 10, entranceY + entranceHeight/2, 3);

        // Flat roof
        graphics.fillStyle(0x696969, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawHotel(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.hotel[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;
        const windowWidth = 20;
        const windowHeight = 22;
        const floorHeight = building.height / 5; // 80px per floor

        // Floor separator lines
        graphics.lineStyle(2, 0x654321, 1);
        for (let floor = 1; floor < 5; floor++) {
            const floorY = y - (floor * floorHeight);
            graphics.lineBetween(x - building.width/2, floorY, x + building.width/2, floorY);
        }

        // Draw rooms (2 per floor, 5 floors = 10 rooms)
        for (let floor = 0; floor < 5; floor++) {
            for (let room = 0; room < 2; room++) {
                const roomX = x - 60 + (room * 120);
                const roomY = y - building.height + (floor * floorHeight) + 25;

                // Windows for each room
                for (let win = 0; win < 2; win++) {
                    const wx = roomX - 20 + (win * 40);
                    const wy = roomY + 15;

                    // Window shadow
                    graphics.fillStyle(0x000000, 0.3);
                    graphics.fillRect(wx - windowWidth/2 + 1, wy + 1, windowWidth, windowHeight);

                    // Window
                    graphics.fillStyle(windowColor, 1);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight);

                    // Window reflection
                    graphics.fillStyle(0xFFFFFF, 0.3);
                    graphics.fillRect(wx - windowWidth/2, wy, windowWidth, windowHeight/2);

                    // Window frame
                    graphics.lineStyle(1, 0x654321, 1);
                    graphics.strokeRect(wx - windowWidth/2, wy, windowWidth, windowHeight);
                }
            }
        }

        // Main entrance
        const entranceWidth = 60;
        const entranceHeight = 75;
        const entranceY = y - entranceHeight;

        // Door frame shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - entranceWidth/2 + 3, entranceY + 3, entranceWidth, entranceHeight);

        // Door frame
        graphics.fillStyle(scheme.doorFrame, 1);
        graphics.fillRect(x - entranceWidth/2, entranceY, entranceWidth, entranceHeight);

        // Glass revolving door
        graphics.fillStyle(0x87CEEB, 0.6);
        graphics.fillRect(x - entranceWidth/2 + 5, entranceY + 5, entranceWidth - 10, entranceHeight - 10);

        // Glass reflection
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillRect(x - entranceWidth/2 + 5, entranceY + 5, entranceWidth - 10, (entranceHeight - 10)/2);

        // Revolving door dividers
        graphics.fillStyle(0xC0C0C0, 1);
        graphics.fillRect(x - 2, entranceY + 5, 4, entranceHeight - 10);
        graphics.fillRect(x - entranceWidth/2 + 5, entranceY + entranceHeight/2 - 2, entranceWidth - 10, 4);

        // Hotel sign
        graphics.fillStyle(scheme.accent, 1);
        graphics.fillRect(x - 40, y - building.height + 10, 80, 20);
        graphics.lineStyle(2, 0x654321, 1);
        graphics.strokeRect(x - 40, y - building.height + 10, 80, 20);

        // Flat roof
        graphics.fillStyle(0x696969, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawClothingShop(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.clothingShop[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;

        // Large storefront window
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 70 + 3, y - 140 + 3, 140, 80);

        graphics.fillStyle(windowColor, 1);
        graphics.fillRect(x - 70, y - 140, 140, 80);

        // Window reflection
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRect(x - 70, y - 140, 140, 40);

        graphics.lineStyle(3, 0x000000, 1);
        graphics.strokeRect(x - 70, y - 140, 140, 80);

        // Window dividers
        graphics.lineStyle(2, 0x000000, 1);
        graphics.lineBetween(x - 35, y - 140, x - 35, y - 60);
        graphics.lineBetween(x + 35, y - 140, x + 35, y - 60);

        // Mannequins
        graphics.fillStyle(0xC0C0C0, 0.6);
        graphics.fillCircle(x - 40, y - 115, 8);
        graphics.fillRect(x - 46, y - 105, 12, 20);
        graphics.fillRect(x - 48, y - 85, 16, 20);
        graphics.fillCircle(x + 40, y - 115, 8);
        graphics.fillRect(x + 34, y - 105, 12, 20);
        graphics.fillRect(x + 32, y - 85, 16, 20);

        // Upper windows
        for (let col = 0; col < 3; col++) {
            const wx = x - 50 + (col * 50);
            const wy = y - building.height + 25;

            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx - 10 + 2, wy + 2, 20, 40);

            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx - 10, wy, 20, 40);

            graphics.fillStyle(0xFFFFFF, 0.2);
            graphics.fillRect(wx - 10, wy, 20, 20);

            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(wx - 10, wy, 20, 40);
        }

        // Awning
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 75, y - 140, 150, 8);

        graphics.fillStyle(scheme.awning, 1);
        graphics.fillRect(x - 75, y - 148, 150, 8);

        graphics.fillStyle(0xC2185B, 1);
        graphics.beginPath();
        graphics.moveTo(x - 75, y - 140);
        graphics.lineTo(x + 75, y - 140);
        graphics.lineTo(x + 70, y - 135);
        graphics.lineTo(x - 70, y - 135);
        graphics.closePath();
        graphics.fillPath();

        // Glass door
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 20 + 3, y - 55 + 3, 40, 55);

        graphics.fillStyle(0x87CEEB, 0.4);
        graphics.fillRect(x - 20, y - 55, 40, 55);

        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRect(x - 20, y - 55, 40, 27);

        graphics.lineStyle(2, 0xC0C0C0, 1);
        graphics.strokeRect(x - 20, y - 55, 40, 55);

        // Door handle
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(x + 10, y - 28, 4);

        // Roof
        graphics.fillStyle(0x696969, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawElectronicsShop(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.electronicsShop[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;

        // Modern grid display
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const wx = x - 50 + (col * 40);
                const wy = y - 130 + (row * 35);

                graphics.fillStyle(0x000000, 0.4);
                graphics.fillRect(wx + 2, wy + 2, 35, 30);

                graphics.fillStyle(windowColor, 1);
                graphics.fillRect(wx, wy, 35, 30);

                // Screen glow
                graphics.fillStyle(0x2196F3, 0.3);
                graphics.fillRect(wx + 2, wy + 2, 31, 26);

                graphics.lineStyle(2, 0x000000, 1);
                graphics.strokeRect(wx, wy, 35, 30);
            }
        }

        // Neon accent
        graphics.fillStyle(0x00E5FF, 0.8);
        graphics.fillRect(x - 70, y - 135, 140, 3);

        // Upper windows
        for (let col = 0; col < 2; col++) {
            const wx = x - 35 + (col * 70);
            const wy = y - building.height + 30;

            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx - 15 + 2, wy + 2, 30, 30);

            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx - 15, wy, 30, 30);

            graphics.fillStyle(0x2196F3, 0.2);
            graphics.fillRect(wx - 15, wy, 30, 15);

            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(wx - 15, wy, 30, 30);
        }

        // Awning
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 70, y - 140, 140, 8);

        graphics.fillStyle(scheme.awning, 1);
        graphics.fillRect(x - 70, y - 148, 140, 8);

        const darkerAwning = this.darkenColor(scheme.awning, 0.85);
        graphics.fillStyle(darkerAwning, 1);
        graphics.beginPath();
        graphics.moveTo(x - 70, y - 140);
        graphics.lineTo(x + 70, y - 140);
        graphics.lineTo(x + 65, y - 135);
        graphics.lineTo(x - 65, y - 135);
        graphics.closePath();
        graphics.fillPath();

        // Glass door
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 20 + 3, y - 55 + 3, 40, 55);

        graphics.fillStyle(0x87CEEB, 0.3);
        graphics.fillRect(x - 20, y - 55, 40, 55);

        graphics.lineStyle(2, 0x424242, 1);
        graphics.strokeRect(x - 20, y - 55, 40, 55);
        graphics.lineBetween(x, y - 55, x, y);

        // Door handle
        graphics.fillStyle(0xC0C0C0, 1);
        graphics.fillRect(x + 8, y - 30, 3, 15);

        // Roof
        graphics.fillStyle(0x616161, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawGroceryStore(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.groceryStore[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;

        // Market-style windows
        for (let col = 0; col < 4; col++) {
            const wx = x - 60 + (col * 40);
            const wy = y - 125;

            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx + 2, wy + 2, 30, 40);

            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx, wy, 30, 40);

            graphics.fillStyle(0xFFFFFF, 0.2);
            graphics.fillRect(wx, wy, 30, 20);

            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(wx, wy, 30, 40);
            graphics.lineBetween(wx, wy + 20, wx + 30, wy + 20);
        }

        // Produce crates (left)
        graphics.fillStyle(0x8D6E63, 1);
        graphics.lineStyle(2, 0x5D4037, 1);
        graphics.strokeRect(x - 85, y - 30, 20, 25);
        graphics.strokeRect(x - 85, y - 25, 20, 20);

        // Produce (apples)
        graphics.fillStyle(0xF44336, 1);
        graphics.fillCircle(x - 80, y - 18, 5);
        graphics.fillCircle(x - 72, y - 18, 5);
        graphics.fillCircle(x - 76, y - 24, 5);

        // Produce crates (right)
        graphics.lineStyle(2, 0x5D4037, 1);
        graphics.strokeRect(x + 65, y - 30, 20, 25);
        graphics.strokeRect(x + 65, y - 25, 20, 20);

        // Produce (oranges)
        graphics.fillStyle(0xFF9800, 1);
        graphics.fillCircle(x + 70, y - 18, 5);
        graphics.fillCircle(x + 78, y - 18, 5);
        graphics.fillCircle(x + 74, y - 24, 5);

        // Upper windows
        for (let col = 0; col < 3; col++) {
            const wx = x - 45 + (col * 45);
            const wy = y - building.height + 30;

            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx - 12 + 2, wy + 2, 24, 30);

            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx - 12, wy, 24, 30);

            graphics.fillStyle(0xFFFFFF, 0.2);
            graphics.fillRect(wx - 12, wy, 24, 15);

            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(wx - 12, wy, 24, 30);
        }

        // Awning
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 70, y - 125, 140, 8);

        graphics.fillStyle(scheme.awning, 1);
        graphics.fillRect(x - 70, y - 133, 140, 8);

        graphics.fillStyle(scheme.awningDark, 1);
        graphics.beginPath();
        graphics.moveTo(x - 70, y - 125);
        graphics.lineTo(x + 70, y - 125);
        graphics.lineTo(x + 65, y - 120);
        graphics.lineTo(x - 65, y - 120);
        graphics.closePath();
        graphics.fillPath();

        // Awning stripes
        const darkerStripe = this.darkenColor(scheme.awningDark, 0.7);
        graphics.lineStyle(2, darkerStripe, 1);
        for (let i = 0; i < 7; i++) {
            graphics.lineBetween(x - 70 + (i * 23), y - 133, x - 70 + (i * 23), y - 125);
        }

        // Wood door
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 20 + 3, y - 55 + 3, 40, 55);

        graphics.fillStyle(0x8D6E63, 1);
        graphics.fillRect(x - 20, y - 55, 40, 55);

        graphics.lineStyle(2, 0x5D4037, 1);
        graphics.strokeRect(x - 20, y - 55, 40, 55);

        // Door handle
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(x + 10, y - 28, 4);

        // Roof
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawBookstore(graphics, building, x, y, facadeVariation) {
        const scheme = ColorSchemes.bookstore[facadeVariation % 4];

        // Building base
        graphics.fillStyle(scheme.building, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);

        const windowColor = scheme.window;

        // Storefront window
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 65 + 3, y - 125 + 3, 130, 65);

        graphics.fillStyle(windowColor, 1);
        graphics.fillRect(x - 65, y - 125, 130, 65);

        // Window reflection
        graphics.fillStyle(0xFFFFFF, 0.15);
        graphics.fillRect(x - 65, y - 125, 130, 32);

        graphics.lineStyle(3, 0x4E342E, 1);
        graphics.strokeRect(x - 65, y - 125, 130, 65);

        // Window panes
        graphics.lineStyle(2, 0x4E342E, 1);
        graphics.lineBetween(x - 65, y - 103, x + 65, y - 103);
        graphics.lineBetween(x - 22, y - 125, x - 22, y - 60);
        graphics.lineBetween(x + 22, y - 125, x + 22, y - 60);

        // Book stacks
        graphics.fillStyle(0x8B4513, 0.6);
        graphics.fillRect(x - 50, y - 85, 8, 20);
        graphics.fillRect(x - 40, y - 80, 8, 15);
        graphics.fillRect(x - 30, y - 88, 8, 23);
        graphics.fillRect(x + 25, y - 85, 8, 20);
        graphics.fillRect(x + 35, y - 80, 8, 15);
        graphics.fillRect(x + 45, y - 88, 8, 23);

        // Upper windows with shutters
        for (let col = 0; col < 2; col++) {
            const wx = x - 35 + (col * 70);
            const wy = y - building.height + 30;

            // Left shutter
            graphics.fillStyle(scheme.shutter, 1);
            graphics.fillRect(wx - 30, wy, 10, 35);
            graphics.lineStyle(1, 0x4E342E, 1);
            graphics.strokeRect(wx - 30, wy, 10, 35);
            for (let i = 0; i < 7; i++) {
                graphics.lineBetween(wx - 30, wy + (i * 5), wx - 20, wy + (i * 5));
            }

            // Window
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx - 15 + 2, wy + 2, 30, 35);

            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx - 15, wy, 30, 35);

            graphics.fillStyle(0xFFFFFF, 0.15);
            graphics.fillRect(wx - 15, wy, 30, 17);

            graphics.lineStyle(2, 0x4E342E, 1);
            graphics.strokeRect(wx - 15, wy, 30, 35);
            graphics.lineBetween(wx, wy, wx, wy + 35);

            // Right shutter
            graphics.fillStyle(scheme.shutter, 1);
            graphics.fillRect(wx + 20, wy, 10, 35);
            graphics.lineStyle(1, 0x4E342E, 1);
            graphics.strokeRect(wx + 20, wy, 10, 35);
            for (let i = 0; i < 7; i++) {
                graphics.lineBetween(wx + 20, wy + (i * 5), wx + 30, wy + (i * 5));
            }
        }

        // Awning
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 70, y - 125, 140, 8);

        graphics.fillStyle(scheme.awning, 1);
        graphics.fillRect(x - 70, y - 133, 140, 8);

        graphics.fillStyle(scheme.awningDark, 1);
        graphics.beginPath();
        graphics.moveTo(x - 70, y - 125);
        graphics.lineTo(x + 70, y - 125);
        graphics.lineTo(x + 65, y - 120);
        graphics.lineTo(x - 65, y - 120);
        graphics.closePath();
        graphics.fillPath();

        // Wood door
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 20 + 3, y - 55 + 3, 40, 55);

        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(x - 20, y - 55, 40, 55);

        // Door panels
        graphics.lineStyle(2, 0x4E342E, 1);
        graphics.strokeRect(x - 20, y - 55, 40, 55);
        graphics.strokeRect(x - 15, y - 48, 30, 20);
        graphics.strokeRect(x - 15, y - 25, 30, 20);

        // Brass handle
        graphics.fillStyle(0xB8860B, 1);
        graphics.fillCircle(x + 10, y - 28, 4);
        graphics.fillStyle(0xFFD700, 0.6);
        graphics.fillCircle(x + 9, y - 29, 2);

        // Roof
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(x - building.width/2 - 5, y - building.height - 10, building.width + 10, 10);
    }

    drawRestaurant(graphics, building, x, y, facadeVariation) {
        const windowColor = 0xFFF8DC;

        // Arched windows
        for (let col = 0; col < 3; col++) {
            const wx = x - 50 + (col * 50);
            const wy = y - building.height + 40;

            // Shadow
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillRect(wx - 15 + 2, wy + 2, 30, 40);
            graphics.fillCircle(wx + 2, wy + 2, 15);

            // Window rectangle
            graphics.fillStyle(windowColor, 1);
            graphics.fillRect(wx - 15, wy, 30, 40);
            graphics.fillCircle(wx, wy, 15);

            // Reflection
            graphics.fillStyle(0xFFFFFF, 0.25);
            graphics.fillRect(wx - 15, wy, 30, 20);
            graphics.fillCircle(wx, wy, 7);

            // Frame
            graphics.lineStyle(2, 0x8B4513, 1);
            graphics.strokeRect(wx - 15, wy, 30, 40);
            graphics.strokeCircle(wx, wy, 15);
        }

        // Entrance shadow
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRect(x - 30 + 4, y - 70 + 4, 60, 70);

        // Entrance
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(x - 30, y - 70, 60, 70);
        graphics.lineStyle(3, 0x654321, 1);
        graphics.strokeRect(x - 30, y - 70, 60, 70);

        // Double doors
        graphics.lineStyle(2, 0x654321, 1);
        graphics.lineBetween(x, y - 70, x, y);
        graphics.fillStyle(windowColor, 1);
        graphics.fillRect(x - 20, y - 60, 15, 30);
        graphics.fillRect(x + 5, y - 60, 15, 30);

        // Door glass reflection
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRect(x - 20, y - 60, 15, 15);
        graphics.fillRect(x + 5, y - 60, 15, 15);

        // Door handles
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillCircle(x - 7, y - 34, 3);
        graphics.fillCircle(x + 9, y - 34, 3);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(x - 8, y - 35, 3);
        graphics.fillCircle(x + 8, y - 35, 3);
        graphics.fillStyle(0xFFFF99, 0.5);
        graphics.fillCircle(x - 9, y - 36, 1.5);
        graphics.fillCircle(x + 7, y - 36, 1.5);

        // Restaurant sign
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - 65 + 2, y - 105 + 2, 130, 20);

        graphics.fillStyle(0x8B0000, 1);
        graphics.fillRect(x - 65, y - 105, 130, 20);

        graphics.fillStyle(0x660000, 1);
        graphics.beginPath();
        graphics.moveTo(x - 65, y - 85);
        graphics.lineTo(x + 65, y - 85);
        graphics.lineTo(x + 63, y - 80);
        graphics.lineTo(x - 63, y - 80);
        graphics.closePath();
        graphics.fillPath();

        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeRect(x - 65, y - 105, 130, 20);

        // Peaked roof
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillTriangle(
            x - building.width/2 - 8, y - building.height,
            x, y - building.height - 30,
            x + building.width/2 + 8, y - building.height
        );

        graphics.fillStyle(0xA0522D, 1);
        graphics.fillTriangle(
            x - building.width/2 - 8, y - building.height,
            x, y - building.height - 30,
            x, y - building.height
        );

        graphics.fillStyle(0x8B4513, 1);
        graphics.fillTriangle(
            x, y - building.height - 30,
            x + building.width/2 + 8, y - building.height,
            x, y - building.height
        );

        graphics.lineStyle(2, 0x654321, 1);
        graphics.strokeTriangle(
            x - building.width/2 - 8, y - building.height,
            x, y - building.height - 30,
            x + building.width/2 + 8, y - building.height
        );

        graphics.lineStyle(1, 0x000000, 0.5);
        graphics.lineBetween(x, y - building.height, x, y - building.height - 30);

        // Decorative trim
        graphics.fillStyle(0x654321, 1);
        graphics.beginPath();
        graphics.moveTo(x - building.width/2 - 8, y - building.height);
        graphics.lineTo(x - building.width/2 - 15, y - building.height + 5);
        graphics.lineTo(x + building.width/2 + 15, y - building.height + 5);
        graphics.lineTo(x + building.width/2 + 8, y - building.height);
        graphics.closePath();
        graphics.fillPath();
    }

    // Note: Bank, Market, LumberMill, BrickFactory don't have color variations yet
    // They use default colors from BuildingTypes

    drawBank(graphics, building, x, y, facadeVariation) {
        // TODO: Implement bank building design
        // For now, draw a simple placeholder
        graphics.fillStyle(building.color, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);
    }

    drawMarket(graphics, building, x, y, facadeVariation) {
        // TODO: Implement market building design
        graphics.fillStyle(building.color, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);
    }

    drawLumberMill(graphics, building, x, y, facadeVariation) {
        // TODO: Implement lumber mill building design
        graphics.fillStyle(building.color, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);
    }

    drawBrickFactory(graphics, building, x, y, facadeVariation) {
        // TODO: Implement brick factory building design
        graphics.fillStyle(building.color, 1);
        graphics.fillRect(x - building.width/2, y - building.height, building.width, building.height);
    }
}
