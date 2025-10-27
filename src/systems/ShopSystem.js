/**
 * ShopSystem - Manages shop operations
 * Handles entering/exiting, inventory management, employees, and income collection
 */
export class ShopSystem {
    constructor(scene) {
        this.scene = scene;
    }

    enterShop(shop) {
        console.log('Entering shop:', shop);

        // Automatically collect any accumulated income when entering
        let collectedIncome = 0;
        if (shop.accumulatedIncome && shop.accumulatedIncome > 0) {
            collectedIncome = Math.floor(shop.accumulatedIncome);
            this.scene.money += collectedIncome;
            this.scene.money = Math.round(this.scene.money);
            shop.accumulatedIncome = 0;
            shop.lastIncomeTime = Date.now();

            console.log(`💰 Collected $${collectedIncome} from shop! Total money: $${this.scene.money}`);
            this.scene.uiManager.updateMoneyUI();

            // Hide income indicator
            if (shop.incomeIndicator && shop.incomeIndicator.scene) {
                shop.incomeIndicator.setVisible(false);
            }
        }

        this.scene.insideShop = true;
        this.scene.currentShop = shop;

        // Update shop name label
        this.scene.shopNameLabel.setText(shop.type.toUpperCase());

        // Show shop interior
        this.scene.shopInteriorContainer.setVisible(true);

        // Show shop buttons (they're not in the container)
        this.scene.shopRestockButton.setVisible(true);
        this.scene.shopHireButton.setVisible(true);
        this.scene.shopWageText.setVisible(true);

        // Update inventory display
        this.updateShopInventoryUI();

        // Show collection message with current balance
        const shopTypeName = this.scene.buildingTypes[shop.type]?.name || 'Shop';
        this.scene.uiManager.showBuildingEntryMessage(shopTypeName, collectedIncome);

        // Hide shop prompt
        if (this.scene.shopPrompt) {
            this.scene.shopPrompt.setVisible(false);
        }

        // Disable player movement
        this.scene.player.setVelocityX(0);
        this.scene.player.setVelocityY(0);
    }

    exitShop() {
        console.log('Exiting shop');
        this.scene.insideShop = false;
        this.scene.currentShop = null;

        // Hide shop interior
        this.scene.shopInteriorContainer.setVisible(false);

        // Hide shop buttons (they're not in the container)
        this.scene.shopRestockButton.setVisible(false);
        this.scene.shopHireButton.setVisible(false);
        this.scene.shopWageText.setVisible(false);

        // Main resource UI stays visible
    }

    updateShopInventoryUI() {
        if (!this.scene.currentShop || !this.scene.currentShop.inventory) {
            console.log('No shop or inventory data');
            return;
        }

        const inv = this.scene.currentShop.inventory;

        // Money is shown in main resource UI (always visible)
        // this.shopMoneyText is hidden - no need to update it

        // Update stock level display
        const stockPercent = Math.floor((inv.stock / inv.maxStock) * 100);
        let stockColor = '#4CAF50'; // Green
        if (stockPercent < 30) stockColor = '#F44336'; // Red
        else if (stockPercent < 60) stockColor = '#FF9800'; // Orange

        this.scene.shopStockText.setText(`Stock: ${inv.stock}/${inv.maxStock} (${stockPercent}%)`);
        this.scene.shopStockText.setStyle({ backgroundColor: stockColor });

        // Update employee status
        const employeeStatus = this.scene.currentShop.hasEmployee ? 'Employee: YES' : 'Employee: NO';
        const employeeColor = this.scene.currentShop.hasEmployee ? '#4CAF50' : '#F44336';
        this.scene.shopEmployeeText.setText(employeeStatus);
        this.scene.shopEmployeeText.setStyle({ backgroundColor: employeeColor });

        // Update shop open/closed status
        const totalMinutes = Math.floor(this.scene.gameTime);
        const hour = Math.floor((totalMinutes % (24 * 60)) / 60);
        const openHours = '7am-9pm';

        let shopStatus = this.scene.currentShop.isOpen ? `OPEN (${openHours})` : `CLOSED (${openHours})`;
        if (!this.scene.currentShop.hasEmployee) {
            shopStatus = 'CLOSED (No Employee)';
        }

        const statusColor = this.scene.currentShop.isOpen ? '#4CAF50' : '#9E9E9E';
        this.scene.shopStatusText.setText(shopStatus);
        this.scene.shopStatusText.setStyle({ backgroundColor: statusColor });

        // Update hire employee button
        const hiringCost = 1000;
        if (this.scene.currentShop.hasEmployee) {
            this.scene.shopHireButton.setVisible(false);
            this.scene.shopWageText.setText(`Daily Wage: $${this.scene.currentShop.dailyWage || 50}`);
            this.scene.shopWageText.setVisible(true);
        } else {
            this.scene.shopWageText.setVisible(false);
            this.scene.shopHireButton.setVisible(true);
            if (this.scene.money < hiringCost) {
                this.scene.shopHireButton.setText(`HIRE EMPLOYEE ($${hiringCost}) - NOT ENOUGH MONEY`);
                this.scene.shopHireButton.setStyle({ backgroundColor: '#D32F2F' });
                this.scene.shopHireButton.disableInteractive();
            } else {
                this.scene.shopHireButton.setText(`HIRE EMPLOYEE ($${hiringCost})`);
                this.scene.shopHireButton.setStyle({ backgroundColor: '#1976D2' });
                this.scene.shopHireButton.setInteractive();
            }
        }

        // Update restock button
        const restockAmount = inv.maxStock - inv.stock;
        const restockCost = restockAmount * inv.restockCost;

        if (restockAmount === 0) {
            this.scene.shopRestockButton.setText('FULLY STOCKED');
            this.scene.shopRestockButton.setStyle({ backgroundColor: '#9E9E9E' });
            this.scene.shopRestockButton.disableInteractive();
        } else if (this.scene.money < restockCost) {
            this.scene.shopRestockButton.setText(`RESTOCK ($${restockCost}) - NOT ENOUGH MONEY`);
            this.scene.shopRestockButton.setStyle({ backgroundColor: '#D32F2F' });
            this.scene.shopRestockButton.disableInteractive();
        } else {
            this.scene.shopRestockButton.setText(`RESTOCK ${restockAmount} units ($${restockCost})`);
            this.scene.shopRestockButton.setStyle({ backgroundColor: '#2E7D32' });
            this.scene.shopRestockButton.setInteractive();
        }
    }

    restockShop() {
        if (!this.scene.currentShop || !this.scene.currentShop.inventory) {
            console.log('No shop or inventory data');
            return;
        }

        const inv = this.scene.currentShop.inventory;
        const restockAmount = inv.maxStock - inv.stock;
        const restockCost = restockAmount * inv.restockCost;

        // Check if already fully stocked
        if (restockAmount === 0) {
            console.log('Shop already fully stocked');
            return;
        }

        // Check if player has enough money
        if (this.scene.money < restockCost) {
            console.log('Not enough money to restock');
            return;
        }

        // Restock the shop
        inv.stock = inv.maxStock;
        this.scene.money -= restockCost;
        this.scene.money = Math.round(this.scene.money);

        console.log(`Restocked shop for $${restockCost}. New stock: ${inv.stock}`);

        // Update UI
        this.scene.uiManager.updateMoneyUI();
        this.updateShopInventoryUI();
    }

    hireEmployee() {
        if (!this.scene.currentShop) {
            console.log('No current shop');
            return;
        }

        const hiringCost = 1000;

        // Check if already has employee
        if (this.scene.currentShop.hasEmployee) {
            console.log('Shop already has an employee');
            return;
        }

        // Check if player has enough money
        if (this.scene.money < hiringCost) {
            console.log('Not enough money to hire employee');
            return;
        }

        // Hire the employee
        this.scene.currentShop.hasEmployee = true;
        this.scene.currentShop.isOpen = true;
        this.scene.currentShop.dailyWage = 50; // $50 per day
        this.scene.money -= hiringCost;
        this.scene.money = Math.round(this.scene.money);

        console.log(`Hired employee for $${hiringCost}. Shop is now open. Daily wage: $${this.scene.currentShop.dailyWage}`);

        // Update UI
        this.scene.uiManager.updateMoneyUI();
        this.updateShopInventoryUI();
    }
}
