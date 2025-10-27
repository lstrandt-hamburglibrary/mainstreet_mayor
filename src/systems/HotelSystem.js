/**
 * HotelSystem - Manages hotel operations
 * Handles entering/exiting, room management, employees, maids, and income collection
 */
export class HotelSystem {
    constructor(scene) {
        this.scene = scene;
    }

    enterHotel(hotel) {
        console.log('Entering hotel:', hotel);

        // Automatically collect any accumulated income when entering
        let collectedIncome = 0;
        if (hotel.accumulatedIncome && hotel.accumulatedIncome > 0) {
            collectedIncome = Math.floor(hotel.accumulatedIncome);
            this.scene.money += collectedIncome;
            this.scene.money = Math.round(this.scene.money);
            hotel.accumulatedIncome = 0;

            console.log(`💰 Collected $${collectedIncome} from hotel! Total money: $${this.scene.money}`);
            this.scene.updateMoneyUI();

            // Hide income indicator
            if (hotel.incomeIndicator && hotel.incomeIndicator.scene) {
                hotel.incomeIndicator.setVisible(false);
            }
        }

        this.scene.insideHotel = true;
        this.scene.currentHotel = hotel;

        // Show hotel interior
        this.scene.hotelInteriorContainer.setVisible(true);

        // Update hotel info
        this.updateHotelUI();

        // Show collection message with current balance
        this.scene.showBuildingEntryMessage('Hotel', collectedIncome);

        // Hide hotel prompt
        if (this.scene.hotelPrompt) {
            this.scene.hotelPrompt.setVisible(false);
        }

        // Disable player movement
        this.scene.player.setVelocityX(0);
        this.scene.player.setVelocityY(0);
    }

    exitHotel() {
        console.log('Exiting hotel');
        this.scene.insideHotel = false;
        this.scene.currentHotel = null;

        // Hide hotel interior
        this.scene.hotelInteriorContainer.setVisible(false);

        // Main resource UI stays visible
    }

    updateHotelUI() {
        if (!this.scene.currentHotel || !this.scene.currentHotel.rooms) {
            console.log('No hotel or rooms data');
            return;
        }

        // Count dirty and clean rooms
        let dirtyCount = 0;
        let cleanCount = 0;
        let occupiedCount = 0;

        for (let room of this.scene.currentHotel.rooms) {
            if (room.status === 'dirty') dirtyCount++;
            else if (room.status === 'clean') cleanCount++;
            else if (room.status === 'occupied') occupiedCount++;
        }

        const hotelType = this.scene.buildingTypes.hotel;
        const totalCost = dirtyCount * hotelType.cleaningCost;

        // Update info text
        const employeeStatus = this.scene.currentHotel.hasEmployee ? '✓ Front Desk' : '✗ No Front Desk';
        const autoCleanInfo = this.scene.currentHotel.hasEmployee ? '(Cleans 1 room/day)' : '';
        const maidStatus = this.scene.currentHotel.hasMaid ? '✓ Maid' : '✗ No Maid';
        const maidCleanInfo = this.scene.currentHotel.hasMaid ? '(Cleans immediately after checkout)' : '';

        const infoLines = [
            `Total Rooms: ${this.scene.currentHotel.rooms.length}`,
            `Occupied: ${occupiedCount} | Clean: ${cleanCount} | Dirty: ${dirtyCount}`,
            ``,
            `${employeeStatus} ${autoCleanInfo}`,
            `${maidStatus} ${maidCleanInfo}`,
            `Cleaning Cost: $${hotelType.cleaningCost} per room`
        ];
        this.scene.hotelInfoText.setText(infoLines.join('\n'));

        // Show/hide employee sprite at front desk
        if (this.scene.hotelEmployeeSprite) {
            this.scene.hotelEmployeeSprite.setVisible(this.scene.currentHotel.hasEmployee);
        }

        // Show/hide maid sprite
        if (this.scene.hotelMaidSprite) {
            this.scene.hotelMaidSprite.setVisible(this.scene.currentHotel.hasMaid);
        }

        // Update clean button (only show if NO maid - maid cleans automatically!)
        if (dirtyCount > 0 && !this.scene.currentHotel.hasMaid) {
            this.scene.hotelCleanButton.setText(`🧹 CLEAN ALL DIRTY ROOMS ($${totalCost})`);
            if (this.scene.money >= totalCost) {
                this.scene.hotelCleanButton.setStyle({ backgroundColor: '#E91E63' });
                this.scene.hotelCleanButton.setInteractive();
            } else {
                this.scene.hotelCleanButton.setText(`🧹 CLEAN ALL DIRTY ROOMS ($${totalCost}) - NOT ENOUGH MONEY`);
                this.scene.hotelCleanButton.setStyle({ backgroundColor: '#D32F2F' });
                this.scene.hotelCleanButton.disableInteractive();
            }
            this.scene.hotelCleanButton.setVisible(true);
        } else {
            this.scene.hotelCleanButton.setVisible(false);
        }

        // Update hire button / wage display
        const hiringCost = 1000;
        if (this.scene.currentHotel.hasEmployee) {
            this.scene.hotelHireButton.setVisible(false);
            this.scene.hotelWageText.setText(`Front Desk Daily Wage: $${this.scene.currentHotel.dailyWage || 50}`);
            this.scene.hotelWageText.setVisible(true);
        } else {
            this.scene.hotelWageText.setVisible(false);
            this.scene.hotelHireButton.setVisible(true);
            if (this.scene.money < hiringCost) {
                this.scene.hotelHireButton.setText(`HIRE EMPLOYEE ($${hiringCost}) - NOT ENOUGH MONEY`);
                this.scene.hotelHireButton.setStyle({ backgroundColor: '#D32F2F' });
                this.scene.hotelHireButton.disableInteractive();
            } else {
                this.scene.hotelHireButton.setText(`HIRE EMPLOYEE ($${hiringCost})`);
                this.scene.hotelHireButton.setStyle({ backgroundColor: '#1976D2' });
                this.scene.hotelHireButton.setInteractive();
            }
        }

        // Update maid hire button / wage display
        if (this.scene.currentHotel.hasMaid) {
            this.scene.hotelHireMaidButton.setVisible(false);
            this.scene.hotelMaidWageText.setText(`Maid Daily Wage: $${this.scene.currentHotel.maidDailyWage || 50}`);
            this.scene.hotelMaidWageText.setVisible(true);
        } else {
            this.scene.hotelMaidWageText.setVisible(false);
            this.scene.hotelHireMaidButton.setVisible(true);
            if (this.scene.money < hiringCost) {
                this.scene.hotelHireMaidButton.setText(`HIRE MAID ($${hiringCost}) - NOT ENOUGH MONEY`);
                this.scene.hotelHireMaidButton.setStyle({ backgroundColor: '#D32F2F' });
                this.scene.hotelHireMaidButton.disableInteractive();
            } else {
                this.scene.hotelHireMaidButton.setText(`HIRE MAID ($${hiringCost})`);
                this.scene.hotelHireMaidButton.setStyle({ backgroundColor: '#7B1FA2' });
                this.scene.hotelHireMaidButton.setInteractive();
            }
        }
    }

    cleanHotelRooms() {
        if (!this.scene.currentHotel || !this.scene.currentHotel.rooms) {
            console.log('No hotel to clean');
            return;
        }

        // Count dirty rooms
        let dirtyCount = 0;
        for (let room of this.scene.currentHotel.rooms) {
            if (room.status === 'dirty') dirtyCount++;
        }

        if (dirtyCount === 0) {
            console.log('No dirty rooms to clean');
            return;
        }

        const hotelType = this.scene.buildingTypes.hotel;
        const totalCost = dirtyCount * hotelType.cleaningCost;

        if (this.scene.money < totalCost) {
            console.log(`❌ Not enough money! Need $${totalCost}, have $${this.scene.money}`);
            return;
        }

        // Clean all dirty rooms
        for (let room of this.scene.currentHotel.rooms) {
            if (room.status === 'dirty') {
                room.status = 'clean';
            }
        }

        // Deduct money
        this.scene.money -= totalCost;
        this.scene.money = Math.round(this.scene.money);
        console.log(`🧹 Cleaned ${dirtyCount} rooms for $${totalCost}. Cash remaining: $${this.scene.money}`);

        // Update UI
        this.updateHotelUI();

        // Save game
        this.scene.saveGame();
    }

    hireHotelEmployee() {
        if (!this.scene.currentHotel) {
            console.log('No hotel to hire for');
            return;
        }

        if (this.scene.currentHotel.hasEmployee) {
            console.log('Hotel already has an employee');
            return;
        }

        const hiringCost = 1000;
        if (this.scene.money < hiringCost) {
            console.log(`❌ Not enough money to hire! Need $${hiringCost}, have $${this.scene.money}`);
            return;
        }

        // Hire employee
        this.scene.money -= hiringCost;
        this.scene.money = Math.round(this.scene.money);
        this.scene.currentHotel.hasEmployee = true;
        this.scene.currentHotel.dailyWage = 50; // $50 per game day
        this.scene.currentHotel.lastWageCheck = this.scene.gameTime;
        this.scene.currentHotel.lastAutoClean = this.scene.gameTime;

        console.log(`✓ Hired hotel employee for $${hiringCost}. Daily wage: $${this.scene.currentHotel.dailyWage}`);

        // Update UI
        this.updateHotelUI();

        // Save game
        this.scene.saveGame();
    }

    hireHotelMaid() {
        if (!this.scene.currentHotel) {
            console.log('No hotel to hire maid for');
            return;
        }

        if (this.scene.currentHotel.hasMaid) {
            console.log('Hotel already has a maid');
            return;
        }

        const hiringCost = 1000;
        if (this.scene.money < hiringCost) {
            console.log(`❌ Not enough money to hire maid! Need $${hiringCost}, have $${this.scene.money}`);
            return;
        }

        // Hire maid
        this.scene.money -= hiringCost;
        this.scene.money = Math.round(this.scene.money);
        this.scene.currentHotel.hasMaid = true;
        this.scene.currentHotel.maidDailyWage = 50; // $50 per game day
        this.scene.currentHotel.lastMaidWageCheck = this.scene.gameTime;
        this.scene.currentHotel.lastMaidClean = this.scene.gameTime;

        console.log(`✓ Hired hotel maid for $${hiringCost}. Daily wage: $${this.scene.currentHotel.maidDailyWage}`);

        // Update UI
        this.updateHotelUI();

        // Save game
        this.scene.saveGame();
    }
}
