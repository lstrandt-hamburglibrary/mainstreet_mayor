/**
 * UIManager - Manages all UI updates and displays
 * Handles resource displays, prompts, menus, and notifications
 */
export class UIManager {
    constructor(scene) {
        this.scene = scene;
    }

    updateMoneyUI() {
        // Update resource UI with current money, wood, bricks
        let resourceText = `💰 Cash: $${Math.round(this.scene.money)}  🪵 ${this.scene.wood}  🧱 ${this.scene.bricks}  👥 ${this.scene.population}/${this.scene.populationCapacity}`;
        if (this.scene.creativeMode) resourceText += `  [CREATIVE MODE]`;
        if (this.scene.bankBalance > 0) resourceText += `\n🏦 Bank: $${Math.round(this.scene.bankBalance)}`;
        if (this.scene.loanAmount > 0) resourceText += `\n💳 Debt: $${Math.round(this.scene.loanAmount)}`;
        this.scene.resourceUI.setText(resourceText);

        // Main resource UI always shows current money (no need for separate cash on hand display)
    }

    updateSpeedButtons() {
        // Update speed button styles to highlight active speed
        const activeColor = '#2E7D32';  // Green for active
        const inactiveColor = '#424242'; // Gray for inactive

        // Update speed buttons
        this.scene.speed1xButton.setStyle({ backgroundColor: this.scene.timeSpeed === 1 ? activeColor : inactiveColor });
        this.scene.speed2xButton.setStyle({ backgroundColor: this.scene.timeSpeed === 2 ? activeColor : inactiveColor });
        this.scene.speed3xButton.setStyle({ backgroundColor: this.scene.timeSpeed === 3 ? activeColor : inactiveColor });

        // Dim all buttons if paused
        if (this.scene.isPaused) {
            this.scene.speed1xButton.setStyle({ backgroundColor: inactiveColor });
            this.scene.speed2xButton.setStyle({ backgroundColor: inactiveColor });
            this.scene.speed3xButton.setStyle({ backgroundColor: inactiveColor });
        }
    }

    showBuildingEntryMessage(buildingName, collectedIncome) {
        // Create temporary collection message if needed
        if (!this.scene.buildingEntryMessage) {
            this.scene.buildingEntryMessage = this.scene.add.text(this.scene.gameWidth / 2, 100, '', {
                fontSize: '20px',
                color: '#FFFFFF',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(20000);
        }

        // Build temporary message (entered + collected)
        let tempMessage = `Entered ${buildingName}`;
        if (collectedIncome > 0) {
            tempMessage += `\n💰 Collected: $${collectedIncome}`;
        }

        // Show temporary message
        this.scene.buildingEntryMessage.setText(tempMessage);
        this.scene.buildingEntryMessage.setVisible(true);

        // Main resource UI stays visible (shows cash, wood, bricks, population)

        // Hide temporary message after 4 seconds
        this.scene.time.delayedCall(4000, () => {
            if (this.scene.buildingEntryMessage) {
                this.scene.buildingEntryMessage.setVisible(false);
            }
        });
    }

    updateMailboxUI() {
        // Safety check: only update if menu exists and is visible
        if (!this.scene.mailboxUI || !this.scene.mailboxUI.visible || !this.scene.mailboxMenuOpen) {
            return;
        }

        if (this.scene.pendingApplications.length === 0) {
            this.scene.closeMailboxMenu();
            return;
        }

        const currentBatch = this.scene.pendingApplications[0];
        const applications = currentBatch.applications;
        const currentApp = applications[this.scene.currentApplicationIndex];

        let menuText = `=== RENTAL APPLICATION ===\n`;
        menuText += `Unit: Apartment #${currentBatch.unitIndex + 1}\n`;
        menuText += `Application ${this.scene.currentApplicationIndex + 1} of ${applications.length}\n\n`;
        menuText += `Applicant: ${currentApp.name}\n`;
        menuText += `Occupation: ${currentApp.job}\n`;
        menuText += `Employment: ${currentApp.employmentLength} months\n`;
        menuText += `Credit Score: ${currentApp.creditScore}\n`;
        menuText += `Monthly Rent Offer: $${currentApp.rentOffer}/min\n\n`;

        // Credit rating
        let rating = '';
        if (currentApp.creditScore >= 750) rating = '⭐ Excellent (Very Low Risk)';
        else if (currentApp.creditScore >= 650) rating = '✓ Good (Low Risk)';
        else if (currentApp.creditScore >= 550) rating = '⚠ Fair (Moderate Risk)';
        else rating = '❌ Poor (HIGH RISK!)';
        menuText += `Rating: ${rating}\n\n`;

        menuText += `← → : View other applications\n`;
        menuText += `ENTER : Accept this applicant\n`;
        menuText += `ESC : Close mailbox\n`;

        try {
            this.scene.mailboxUI.setText(menuText);
        } catch (error) {
            console.error('Error updating mailbox UI:', error);
        }
    }

    updateBankUI() {
        let menuText = '=== MAIN STREET BANK ===\n';
        menuText += `💰 Cash on Hand: $${Math.round(this.scene.money)}\n`;
        menuText += `🏦 Bank Balance: $${Math.round(this.scene.bankBalance)}\n`;
        menuText += `💳 Loan Debt: $${Math.round(this.scene.loanAmount)}\n\n`;
        menuText += '1: Deposit $100\n';
        menuText += '2: Withdraw $100\n';
        menuText += '3: Borrow $500 (10% interest)\n';
        menuText += 'E/Enter: Close';
        this.scene.bankUI.setText(menuText);
    }

    updateResourceBuildingUI() {
        let menuText = '';

        if (this.scene.nearResourceBuilding.type === 'market') {
            menuText = '=== MARKET ===\n';
            menuText += `💰 Cash: $${Math.round(this.scene.money)}\n`;
            menuText += `🪵 Wood: ${this.scene.wood}\n`;
            menuText += `🧱 Bricks: ${this.scene.bricks}\n\n`;
            menuText += '1: Buy 10 Wood ($50)\n';
            menuText += '2: Buy 10 Bricks ($75)\n';
            menuText += 'E/Enter: Close';
        } else if (this.scene.nearResourceBuilding.type === 'lumbermill') {
            const available = Math.floor(this.scene.nearResourceBuilding.storedResources);
            menuText = '=== LUMBER MILL ===\n';
            menuText += `🪵 Available: ${available} wood\n`;
            menuText += `Your Wood: ${this.scene.wood}\n\n`;
            if (available >= 1) {
                menuText += `1: Collect ${available} Wood (Free!)\n`;
            } else {
                menuText += '⏳ Regenerating... (1 wood/min)\n';
            }
            menuText += 'E/Enter: Close';
        } else if (this.scene.nearResourceBuilding.type === 'brickfactory') {
            const available = Math.floor(this.scene.nearResourceBuilding.storedResources);
            menuText = '=== BRICK FACTORY ===\n';
            menuText += `🧱 Available: ${available} bricks\n`;
            menuText += `Your Bricks: ${this.scene.bricks}\n\n`;
            if (available >= 1) {
                menuText += `1: Collect ${available} Bricks (Free!)\n`;
            } else {
                menuText += '⏳ Regenerating... (1 brick/min)\n';
            }
            menuText += 'E/Enter: Close';
        }

        this.scene.resourceBuildingUI.setText(menuText);
    }
}
