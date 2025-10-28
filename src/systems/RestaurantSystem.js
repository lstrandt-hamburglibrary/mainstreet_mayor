/**
 * RestaurantSystem - Manages restaurant operations
 * Handles entering/exiting, tables display, waiters, and income collection
 */
export class RestaurantSystem {
    constructor(scene) {
        this.scene = scene;
    }

    enterRestaurant(restaurant) {
        console.log('Entering restaurant');

        // Automatically collect any accumulated income when entering
        let collectedIncome = 0;
        if (restaurant.accumulatedIncome && restaurant.accumulatedIncome > 0) {
            collectedIncome = Math.floor(restaurant.accumulatedIncome);
            this.scene.money += collectedIncome;
            this.scene.money = Math.round(this.scene.money);
            restaurant.accumulatedIncome = 0;
            restaurant.lastIncomeTime = Date.now();

            console.log(`💰 Collected $${collectedIncome} from restaurant! Total money: $${this.scene.money}`);
            this.scene.uiManager.updateMoneyUI();

            // Hide income indicator
            if (restaurant.incomeIndicator && restaurant.incomeIndicator.scene) {
                restaurant.incomeIndicator.setVisible(false);
            }
        }

        this.scene.insideRestaurant = true;
        this.scene.currentRestaurant = restaurant;

        // Show restaurant interior
        this.scene.restaurantInteriorContainer.setVisible(true);

        // Update restaurant UI
        this.updateRestaurantUI();

        // Show collection message with current balance
        const restaurantName = this.scene.buildingTypes[restaurant.type]?.name || 'Restaurant';
        this.scene.uiManager.showBuildingEntryMessage(restaurantName, collectedIncome);

        // Hide restaurant prompt
        if (this.scene.restaurantPrompt) {
            this.scene.restaurantPrompt.setVisible(false);
        }

        // Disable player movement
        this.scene.player.setVelocityX(0);
        this.scene.player.setVelocityY(0);
    }

    exitRestaurant() {
        console.log('Exiting restaurant');
        this.scene.insideRestaurant = false;
        this.scene.currentRestaurant = null;

        // Clear restaurant tables display
        if (this.scene.restaurantTablesContainer) {
            this.scene.restaurantTablesContainer.removeAll(true);
        }

        // Hide restaurant interior
        this.scene.restaurantInteriorContainer.setVisible(false);

        // Main resource UI stays visible
    }

    drawRestaurantTables() {
        // Clear existing tables
        this.scene.restaurantTablesContainer.removeAll(true);

        if (!this.scene.currentRestaurant || !this.scene.currentRestaurant.tables) {
            console.log('⚠️ Restaurant has no tables data!');
            return;
        }

        console.log(`🍽️ Drawing ${this.scene.currentRestaurant.tables.length} restaurant tables`);

        // Draw tables in a grid layout
        const numTables = this.scene.currentRestaurant.tables.length;
        const tablesPerRow = 4;
        const tableWidth = 60;
        const tableHeight = 50;
        const spacing = 100;
        const startX = 300;
        const startY = this.scene.gameHeight / 2 - 50;

        for (let i = 0; i < numTables; i++) {
            const table = this.scene.currentRestaurant.tables[i];
            const row = Math.floor(i / tablesPerRow);
            const col = i % tablesPerRow;
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            // Determine table color based on status
            let tableColor = 0x8B4513; // Default brown
            let statusText = '';
            if (table.status === 'available') {
                tableColor = 0x4CAF50; // Green
                statusText = 'Available';
            } else if (table.status === 'occupied') {
                tableColor = 0xF44336; // Red
                statusText = 'Occupied';
            } else if (table.status === 'dirty') {
                tableColor = 0x757575; // Gray
                statusText = 'Dirty';
            }

            // Draw table
            const tableGraphic = this.scene.add.graphics();
            tableGraphic.fillStyle(tableColor, 1);
            tableGraphic.fillRoundedRect(x - tableWidth/2, y - tableHeight/2, tableWidth, tableHeight, 5);
            tableGraphic.lineStyle(3, 0x3E2723, 1);
            tableGraphic.strokeRoundedRect(x - tableWidth/2, y - tableHeight/2, tableWidth, tableHeight, 5);
            this.scene.restaurantTablesContainer.add(tableGraphic);

            // Add table number
            const tableNumText = this.scene.add.text(x, y - 15, `#${i + 1}`, {
                fontSize: '12px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.scene.restaurantTablesContainer.add(tableNumText);

            // Add status text
            const tableStatusText = this.scene.add.text(x, y + 10, statusText, {
                fontSize: '10px',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            this.scene.restaurantTablesContainer.add(tableStatusText);
        }
    }

    updateRestaurantUI() {
        if (!this.scene.currentRestaurant || !this.scene.currentRestaurant.tables) {
            console.log('No restaurant or tables data');
            return;
        }

        // Draw/update tables visually
        this.drawRestaurantTables();

        // Count table statuses
        let availableCount = 0;
        let occupiedCount = 0;
        let dirtyCount = 0;

        for (let table of this.scene.currentRestaurant.tables) {
            if (table.status === 'available') availableCount++;
            else if (table.status === 'occupied') occupiedCount++;
            else if (table.status === 'dirty') dirtyCount++;
        }

        // Update info text
        const dayWaiterStatus = this.scene.currentRestaurant.hasDayWaiter ? '✓ Day Waiter (6am-8pm)' : '✗ No Day Waiter';
        const nightWaiterStatus = this.scene.currentRestaurant.hasNightWaiter ? '✓ Night Waiter (8pm-6am)' : '✗ No Night Waiter';

        const infoLines = [
            `Total Tables: ${this.scene.currentRestaurant.tables.length}`,
            `Available: ${availableCount} | Occupied: ${occupiedCount} | Dirty: ${dirtyCount}`,
            ``,
            `${dayWaiterStatus}`,
            `${nightWaiterStatus}`,
            `Meal Price: $${this.scene.currentRestaurant.mealPrice || 25}`
        ];
        this.scene.restaurantInfoText.setText(infoLines.join('\n'));

        // Show/hide waiter sprite (show if either waiter is hired)
        if (this.scene.restaurantWaiterSprite) {
            this.scene.restaurantWaiterSprite.setVisible(this.scene.currentRestaurant.hasDayWaiter || this.scene.currentRestaurant.hasNightWaiter);
        }

        // Update hire buttons and wage text
        if (this.scene.currentRestaurant.hasDayWaiter) {
            this.scene.restaurantHireDayButton.setVisible(false);
        } else {
            this.scene.restaurantHireDayButton.setVisible(true);
        }

        if (this.scene.currentRestaurant.hasNightWaiter) {
            this.scene.restaurantHireNightButton.setVisible(false);
        } else {
            this.scene.restaurantHireNightButton.setVisible(true);
        }

        // Show total wages if any waiter is hired
        const totalWages = (this.scene.currentRestaurant.dayWaiterWage || 0) + (this.scene.currentRestaurant.nightWaiterWage || 0);
        if (totalWages > 0) {
            this.scene.restaurantWageText.setText(`Total Daily Wages: $${totalWages}`);
            this.scene.restaurantWageText.setVisible(true);
        } else {
            this.scene.restaurantWageText.setVisible(false);
        }
    }

    hireRestaurantWaiter(shift) {
        if (!this.scene.currentRestaurant) {
            console.log('No restaurant to hire waiter for');
            return;
        }

        if (shift === 'day' && this.scene.currentRestaurant.hasDayWaiter) {
            console.log('Restaurant already has a day waiter');
            return;
        }

        if (shift === 'night' && this.scene.currentRestaurant.hasNightWaiter) {
            console.log('Restaurant already has a night waiter');
            return;
        }

        const hiringCost = 800;
        if (this.scene.money < hiringCost) {
            console.log(`❌ Not enough money to hire ${shift} waiter! Need $${hiringCost}, have $${this.scene.money}`);
            return;
        }

        // Hire waiter
        this.scene.money -= hiringCost;
        this.scene.money = Math.round(this.scene.money);
        const dailyWage = 40; // $40 per game day

        if (shift === 'day') {
            this.scene.currentRestaurant.hasDayWaiter = true;
            this.scene.currentRestaurant.dayWaiterWage = dailyWage;
            console.log(`✓ Hired DAY waiter for $${hiringCost}. Daily wage: $${dailyWage}`);
        } else if (shift === 'night') {
            this.scene.currentRestaurant.hasNightWaiter = true;
            this.scene.currentRestaurant.nightWaiterWage = dailyWage;
            console.log(`✓ Hired NIGHT waiter for $${hiringCost}. Daily wage: $${dailyWage}`);
        }

        this.scene.uiManager.updateMoneyUI();
        this.updateRestaurantUI();

        // Save game
        this.scene.saveGame();
    }
}
