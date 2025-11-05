export class SchoolSystem {
    constructor(scene) {
        this.scene = scene;
        this.schools = [];

        // Student name pools for generation
        this.firstNames = [
            'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
            'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
            'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
            'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery',
            'Sebastian', 'Ella', 'Jack', 'Scarlett', 'Aiden', 'Grace', 'Owen', 'Chloe',
            'Samuel', 'Victoria', 'Joseph', 'Riley', 'John', 'Aria', 'David', 'Lily',
            'Wyatt', 'Aubrey', 'Carter', 'Zoey', 'Julian', 'Penelope', 'Luke', 'Layla',
            'Grayson', 'Nora', 'Isaac', 'Hannah', 'Oliver', 'Addison', 'Jayden', 'Ellie'
        ];

        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
            'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
            'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
            'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
        ];

        // School interior state
        this.insideSchool = false;
        this.currentSchool = null;
        this.nearSchool = null;
        this.interiorUI = null;

        // Announcements
        this.announcements = [];
        this.lastAnnouncementTime = 0;

        // Active events
        this.activeEvents = [];

        // Milestone tracking
        this.lastUpgradePrompt = 0;
        this.PROMPT_COOLDOWN = 350;
        this.promptedUpgrades = new Set();
    }

    initializeSchool(building) {
        const school = {
            building: building,
            students: [],
            staff: {
                principal: this.generateName(),
                teachers: []
            },
            educationLevel: 1, // 1-5 scale, affects city-wide benefits
            funding: 0,
            events: [],
            achievements: {
                principalsList: [],
                perfectAttendance: [],
                sportsChampions: [],
                scienceFairWinners: []
            },
            calendar: {
                nextGraduation: null,
                nextScienceFair: null,
                nextFundraiser: null,
                nextAssembly: null
            },
            stats: {
                totalGraduates: 0,
                totalFundsRaised: 0,
                averageGPA: 0,
                attendanceRate: 0
            }
        };

        // Generate initial students (50-150 depending on building size)
        const studentCount = 75 + Math.floor(Math.random() * 75);
        for (let i = 0; i < studentCount; i++) {
            school.students.push(this.generateStudent());
        }

        // Generate teachers (1 per 20 students)
        const teacherCount = Math.ceil(studentCount / 20);
        for (let i = 0; i < teacherCount; i++) {
            school.staff.teachers.push({
                name: this.generateName(),
                subject: this.getRandomSubject(),
                experience: Math.floor(Math.random() * 20) + 1
            });
        }

        // Schedule initial events
        this.scheduleEvents(school);

        this.schools.push(school);
        building.schoolData = school;

        return school;
    }

    generateName() {
        const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        return `${first} ${last}`;
    }

    generateStudent() {
        const grade = Math.floor(Math.random() * 6) + 6; // Grades 6-12 (middle & high school)
        const gpa = (Math.random() * 2) + 2.0; // GPA 2.0-4.0

        return {
            name: this.generateName(),
            grade: grade,
            gpa: parseFloat(gpa.toFixed(2)),
            attendance: 85 + Math.floor(Math.random() * 15), // 85-100%
            clubs: this.getRandomClubs(),
            achievements: [],
            personality: this.getRandomPersonality(),
            graduationYear: this.scene.gameTime ?
                Math.floor(this.scene.gameTime / (60 * 24 * 365)) + (12 - grade) :
                new Date().getFullYear() + (12 - grade)
        };
    }

    getRandomClubs() {
        const allClubs = [
            'Drama Club', 'Debate Team', 'Science Club', 'Math Team', 'Art Club',
            'Robotics', 'Chess Club', 'Band', 'Choir', 'Soccer', 'Basketball',
            'Volleyball', 'Track & Field', 'Swimming', 'Student Council', 'Yearbook',
            'Environmental Club', 'Coding Club', 'Photography', 'Cooking Club'
        ];

        const clubCount = Math.floor(Math.random() * 3); // 0-2 clubs
        const clubs = [];
        for (let i = 0; i < clubCount; i++) {
            const club = allClubs[Math.floor(Math.random() * allClubs.length)];
            if (!clubs.includes(club)) {
                clubs.push(club);
            }
        }
        return clubs;
    }

    getRandomPersonality() {
        const traits = [
            'outgoing', 'shy', 'studious', 'athletic', 'creative', 'leader',
            'helpful', 'curious', 'energetic', 'focused', 'friendly', 'determined'
        ];
        return traits[Math.floor(Math.random() * traits.length)];
    }

    getRandomSubject() {
        const subjects = [
            'Math', 'Science', 'English', 'History', 'Art', 'Music',
            'Physical Education', 'Computer Science', 'Foreign Language', 'Chemistry',
            'Physics', 'Biology', 'Literature', 'Geography'
        ];
        return subjects[Math.floor(Math.random() * subjects.length)];
    }

    scheduleEvents(school) {
        const currentDay = this.scene.gameTime ? Math.floor(this.scene.gameTime / (60 * 24)) : 0;

        // Schedule graduation (end of school year, ~180 days)
        school.calendar.nextGraduation = currentDay + (180 - (currentDay % 180));

        // Schedule science fair (random, 30-60 days from now)
        school.calendar.nextScienceFair = currentDay + 30 + Math.floor(Math.random() * 30);

        // Schedule fundraiser (random, 7-21 days from now)
        school.calendar.nextFundraiser = currentDay + 7 + Math.floor(Math.random() * 14);

        // Schedule assembly (random, 14-30 days from now)
        school.calendar.nextAssembly = currentDay + 14 + Math.floor(Math.random() * 16);
    }

    update() {
        if (!this.scene.gameTime) return;

        const currentDay = Math.floor(this.scene.gameTime / (60 * 24));
        const currentMinute = Math.floor(this.scene.gameTime);

        // Check for player near school
        this.checkSchoolProximity();

        // Process each school
        for (let school of this.schools) {
            // Update student performance periodically
            if (currentMinute % (60 * 24) === 0) { // Daily updates
                this.updateStudentPerformance(school);
            }

            // Generate random announcements during school hours
            if (currentMinute % 180 === 0 && currentMinute - this.lastAnnouncementTime > 180) { // Every 3 hours
                const hour = Math.floor((this.scene.gameTime % (60 * 24)) / 60);
                if (hour >= 7 && hour < 15) { // During school hours
                    this.generateRandomAnnouncement(school);
                    this.lastAnnouncementTime = currentMinute;
                }
            }

            // Check for scheduled events
            this.checkScheduledEvents(school, currentDay);
        }
    }

    checkSchoolProximity() {
        if (!this.scene.player) return;

        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y;
        let nearestSchool = null;
        let minDistance = 150;

        for (let building of this.scene.buildings) {
            if (building.type === 'school' && building.schoolData) {
                const distance = Phaser.Math.Distance.Between(
                    playerX, playerY,
                    building.x, building.y
                );

                if (distance < minDistance) {
                    nearestSchool = building;
                    minDistance = distance;
                }
            }
        }

        this.nearSchool = nearestSchool;
    }

    updateStudentPerformance(school) {
        // Randomly update some students' achievements
        for (let student of school.students) {
            // Small chance to make principal's list (GPA > 3.5)
            if (student.gpa >= 3.5 && Math.random() < 0.1) {
                if (!school.achievements.principalsList.includes(student.name)) {
                    school.achievements.principalsList.push(student.name);
                    student.achievements.push('Principal\'s List');
                    this.addAnnouncement(school, `🌟 ${student.name} made the Principal's List!`);
                }
            }

            // Perfect attendance
            if (student.attendance === 100 && Math.random() < 0.05) {
                if (!school.achievements.perfectAttendance.includes(student.name)) {
                    school.achievements.perfectAttendance.push(student.name);
                    student.achievements.push('Perfect Attendance');
                    this.addAnnouncement(school, `⭐ ${student.name} has perfect attendance!`);
                }
            }

            // Small GPA fluctuation
            if (Math.random() < 0.3) {
                student.gpa += (Math.random() - 0.5) * 0.1;
                student.gpa = Math.max(0, Math.min(4.0, student.gpa));
                student.gpa = parseFloat(student.gpa.toFixed(2));
            }
        }

        // Update school stats
        this.calculateSchoolStats(school);
    }

    calculateSchoolStats(school) {
        const totalStudents = school.students.length;
        if (totalStudents === 0) return;

        let totalGPA = 0;
        let totalAttendance = 0;

        for (let student of school.students) {
            totalGPA += student.gpa;
            totalAttendance += student.attendance;
        }

        school.stats.averageGPA = parseFloat((totalGPA / totalStudents).toFixed(2));
        school.stats.attendanceRate = parseFloat((totalAttendance / totalStudents).toFixed(1));
    }

    generateRandomAnnouncement(school) {
        const types = [
            'achievement',
            'event',
            'reminder',
            'club',
            'sports'
        ];

        const type = types[Math.floor(Math.random() * types.length)];
        let announcement = '';

        switch (type) {
            case 'achievement':
                const achiever = school.students[Math.floor(Math.random() * school.students.length)];
                const achievements = [
                    `won the regional spelling bee`,
                    `scored the winning goal in yesterday's game`,
                    `received a scholarship award`,
                    `won first place in the art competition`,
                    `was selected for the All-State band`
                ];
                announcement = `🎉 ${achiever.name} ${achievements[Math.floor(Math.random() * achievements.length)]}!`;
                break;

            case 'event':
                const events = [
                    'The school play opens this Friday!',
                    'Basketball game tonight at 7 PM!',
                    'Book fair is this week in the library!',
                    'Picture day is tomorrow!',
                    'Parent-teacher conferences next week!'
                ];
                announcement = `📢 ${events[Math.floor(Math.random() * events.length)]}`;
                break;

            case 'reminder':
                const reminders = [
                    'Don\'t forget to return library books!',
                    'Lunch menu has been updated!',
                    'School spirit day tomorrow - wear blue!',
                    'Early dismissal this Friday!',
                    'No homework this weekend!'
                ];
                announcement = `💬 ${reminders[Math.floor(Math.random() * reminders.length)]}`;
                break;

            case 'club':
                const randomClub = this.getRandomClubs()[0] || 'Chess Club';
                announcement = `🎯 ${randomClub} meeting after school today!`;
                break;

            case 'sports':
                const teams = ['Basketball', 'Soccer', 'Volleyball', 'Track', 'Swimming'];
                const team = teams[Math.floor(Math.random() * teams.length)];
                announcement = `⚽ ${team} team practice at 3:30 PM!`;
                break;
        }

        this.addAnnouncement(school, announcement);
    }

    checkScheduledEvents(school, currentDay) {
        // Check for graduation
        if (currentDay >= school.calendar.nextGraduation) {
            this.triggerGraduation(school);
            school.calendar.nextGraduation = currentDay + 180; // Next year
        }

        // Check for science fair
        if (currentDay >= school.calendar.nextScienceFair) {
            this.triggerScienceFair(school);
            school.calendar.nextScienceFair = currentDay + 30 + Math.floor(Math.random() * 30);
        }

        // Check for fundraiser
        if (currentDay >= school.calendar.nextFundraiser) {
            this.triggerFundraiser(school);
            school.calendar.nextFundraiser = currentDay + 7 + Math.floor(Math.random() * 14);
        }

        // Check for assembly
        if (currentDay >= school.calendar.nextAssembly) {
            this.triggerAssembly(school);
            school.calendar.nextAssembly = currentDay + 14 + Math.floor(Math.random() * 16);
        }
    }

    triggerGraduation(school) {
        const currentYear = this.scene.gameTime ?
            Math.floor(this.scene.gameTime / (60 * 24 * 365)) :
            new Date().getFullYear();

        // Find graduating students (grade 12)
        const graduates = school.students.filter(s => s.grade === 12);

        if (graduates.length > 0) {
            school.stats.totalGraduates += graduates.length;

            // Remove graduates and add new 6th graders
            school.students = school.students.filter(s => s.grade !== 12);

            // Promote all students
            for (let student of school.students) {
                student.grade += 1;
            }

            // Add new students to maintain population
            for (let i = 0; i < graduates.length; i++) {
                const newStudent = this.generateStudent();
                newStudent.grade = 6; // New 6th graders
                school.students.push(newStudent);
            }

            this.addAnnouncement(school, `🎓 ${graduates.length} students graduated! Congratulations to the class of ${currentYear}!`);

            // Create active event
            this.createActiveEvent(school, 'graduation', graduates.length);
        }
    }

    triggerScienceFair(school) {
        // Select random participants
        const participantCount = Math.floor(school.students.length * 0.3); // 30% participate
        const participants = [];

        for (let i = 0; i < participantCount; i++) {
            const student = school.students[Math.floor(Math.random() * school.students.length)];
            if (!participants.includes(student)) {
                participants.push(student);
            }
        }

        this.addAnnouncement(school, `🔬 Science Fair today! ${participantCount} projects on display. Visit to judge!`);
        this.createActiveEvent(school, 'scienceFair', participantCount, participants);
    }

    triggerFundraiser(school) {
        const fundraiserTypes = [
            { name: 'Bake Sale', goal: 500, icon: '🧁' },
            { name: 'Car Wash', goal: 750, icon: '🚗' },
            { name: 'Book Fair', goal: 1000, icon: '📚' },
            { name: 'Talent Show', goal: 1200, icon: '🎭' },
            { name: 'Charity Run', goal: 1500, icon: '🏃' },
            { name: 'Raffle', goal: 800, icon: '🎟️' }
        ];

        const fundraiser = fundraiserTypes[Math.floor(Math.random() * fundraiserTypes.length)];

        this.addAnnouncement(school, `${fundraiser.icon} ${fundraiser.name} happening now! Goal: $${fundraiser.goal}. Press E to donate!`);
        this.createActiveEvent(school, 'fundraiser', fundraiser.goal, fundraiser);
    }

    triggerAssembly(school) {
        const assemblyTopics = [
            'Anti-Bullying Week',
            'College Preparation',
            'Career Day Speakers',
            'Student of the Month Awards',
            'Fire Safety Presentation',
            'Mental Health Awareness',
            'Environmental Awareness',
            'Music Performance'
        ];

        const topic = assemblyTopics[Math.floor(Math.random() * assemblyTopics.length)];
        this.addAnnouncement(school, `📣 School Assembly: ${topic}`);
    }

    createActiveEvent(school, type, data, extraData = null) {
        const event = {
            school: school,
            type: type,
            data: data,
            extraData: extraData,
            active: true,
            expiresAt: this.scene.gameTime + (60 * 4) // 4 hours
        };

        this.activeEvents.push(event);
    }

    addAnnouncement(school, message) {
        this.announcements.push({
            school: school,
            message: message,
            time: this.scene.gameTime || 0
        });

        // Show in-game notification
        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(message);
        }

        // Keep only last 50 announcements
        if (this.announcements.length > 50) {
            this.announcements.shift();
        }
    }

    checkMilestones() {
        if (this.schools.length === 0) return;

        const currentTime = this.scene.gameTime || 0;
        if (currentTime - this.lastUpgradePrompt < this.PROMPT_COOLDOWN) return;

        const population = this.scene.population || 0;

        for (let school of this.schools) {
            const schoolId = this.schools.indexOf(school);

            // Suggest funding when education level is close to upgrade
            const fundingNeeded = 5000 * school.educationLevel;
            const fundingProgress = school.funding / fundingNeeded;

            if (fundingProgress >= 0.5 && fundingProgress < 1 &&
                school.educationLevel < 5 &&
                !this.promptedUpgrades.has(`funding-${schoolId}-${school.educationLevel}`)) {

                const amountNeeded = fundingNeeded - school.funding;
                this.showUpgradePrompt(
                    '🏫 School Improvement!',
                    `The school is ${Math.round(fundingProgress * 100)}% of the way to Education Level ${school.educationLevel + 1}. Donate $${amountNeeded} to help reach the goal?`,
                    amountNeeded,
                    () => this.donateFunding(school, amountNeeded)
                );
                this.promptedUpgrades.add(`funding-${schoolId}-${school.educationLevel}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Suggest hiring teachers if student-to-teacher ratio is too high
            const studentTeacherRatio = school.students.length / school.staff.teachers.length;
            if (studentTeacherRatio > 25 &&
                !this.promptedUpgrades.has(`teacher-${schoolId}-${school.staff.teachers.length}`)) {

                this.showUpgradePrompt(
                    '👨‍🏫 Need More Teachers!',
                    `Student-to-teacher ratio is ${Math.round(studentTeacherRatio)}:1. Hire an additional teacher to improve education quality?`,
                    300,
                    () => this.hireTeacher(school)
                );
                this.promptedUpgrades.add(`teacher-${schoolId}-${school.staff.teachers.length}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }

            // Celebrate graduation milestones
            const graduateMilestones = [50, 100, 250, 500, 1000];
            for (let milestone of graduateMilestones) {
                if (school.stats.totalGraduates >= milestone &&
                    !this.promptedUpgrades.has(`graduates-${schoolId}-${milestone}`)) {

                    this.showInfoPopup(
                        '🎓 Graduation Milestone!',
                        `The school has graduated ${school.stats.totalGraduates} students! This contributes to the city's educated workforce.`
                    );
                    this.promptedUpgrades.add(`graduates-${schoolId}-${milestone}`);
                    this.lastUpgradePrompt = currentTime;
                    return;
                }
            }

            // Suggest expanding facilities if overcrowded
            if (school.students.length > 200 &&
                population > 80 &&
                !this.promptedUpgrades.has(`expansion-${schoolId}`)) {

                this.showInfoPopup(
                    '🏫 School Overcrowding!',
                    `The school has ${school.students.length} students! Consider building another school to reduce overcrowding.`
                );
                this.promptedUpgrades.add(`expansion-${schoolId}`);
                this.lastUpgradePrompt = currentTime;
                return;
            }
        }
    }

    donateFunding(school, amount) {
        school.funding += amount;
        school.stats.totalFundsRaised += amount;

        // Check for level up
        const fundingNeeded = 5000 * school.educationLevel;
        if (school.funding >= fundingNeeded && school.educationLevel < 5) {
            school.educationLevel++;
            if (this.scene.uiManager) {
                this.scene.uiManager.addNotification(`⭐ School reached Education Level ${school.educationLevel}!`);
            }
        }

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`💝 Donated $${amount} to school!`);
        }
    }

    hireTeacher(school) {
        school.staff.teachers.push({
            name: this.generateName(),
            subject: this.getRandomSubject(),
            experience: 1
        });

        if (this.scene.uiManager) {
            this.scene.uiManager.addNotification(`👨‍🏫 New teacher hired!`);
        }
    }

    showUpgradePrompt(title, message, cost, onAccept) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -120, 500, 240, 10);
        bg.lineStyle(3, 0xFFC107, 1);
        bg.strokeRoundedRect(-250, -120, 500, 240, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -90, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFC107',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        const messageText = this.scene.add.text(0, -30, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        const costText = this.scene.add.text(0, 30, `Cost: $${cost}`, {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4CAF50'
        });
        costText.setOrigin(0.5);
        popup.add(costText);

        const acceptBtn = this.createPopupButton(popup, -80, 80, '✓ Yes', () => {
            if (this.scene.money >= cost) {
                this.scene.money -= cost;
                onAccept();
                popup.destroy();
            } else {
                if (this.scene.uiManager) {
                    this.scene.uiManager.addNotification(`❌ Not enough money! Need $${cost}`);
                }
            }
        }, '#4CAF50');

        const declineBtn = this.createPopupButton(popup, 80, 80, '✗ Not Now', () => {
            popup.destroy();
        }, '#F44336');

        this.scene.time.delayedCall(10000, () => {
            if (popup && popup.active) {
                popup.destroy();
            }
        });
    }

    showInfoPopup(title, message) {
        const popup = this.scene.add.container(640, 360);
        popup.setDepth(2000);
        popup.setScrollFactor(0);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.98);
        bg.fillRoundedRect(-250, -100, 500, 200, 10);
        bg.lineStyle(3, 0xFFC107, 1);
        bg.strokeRoundedRect(-250, -100, 500, 200, 10);
        popup.add(bg);

        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFC107',
            align: 'center'
        });
        titleText.setOrigin(0.5);
        popup.add(titleText);

        const messageText = this.scene.add.text(0, -10, message, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        });
        messageText.setOrigin(0.5);
        popup.add(messageText);

        const okBtn = this.createPopupButton(popup, 0, 60, '✓ OK', () => {
            popup.destroy();
        }, '#4CAF50');

        this.scene.time.delayedCall(8000, () => {
            if (popup && popup.active) {
                popup.destroy();
            }
        });
    }

    createPopupButton(container, x, y, text, onClick, color = '#4CAF50') {
        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        const colorValue = parseInt(color.replace('#', ''), 16);
        bg.fillStyle(colorValue, 1);
        bg.fillRoundedRect(-70, -18, 140, 36, 5);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-70, -18, 140, 36, 5);
        btn.add(bg);

        const label = this.scene.add.text(0, 0, text, {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        btn.add(label);

        btn.setInteractive(
            new Phaser.Geom.Rectangle(-70, -18, 140, 36),
            Phaser.Geom.Rectangle.Contains
        );
        btn.on('pointerdown', onClick);
        btn.on('pointerover', () => bg.setAlpha(0.8));
        btn.on('pointerout', () => bg.setAlpha(1));

        container.add(btn);
        return btn;
    }

    enterSchool(building) {
        if (!building.schoolData) {
            this.initializeSchool(building);
        }

        this.insideSchool = true;
        this.currentSchool = building.schoolData;
        this.showSchoolInterior();
    }

    exitSchool() {
        this.insideSchool = false;
        this.currentSchool = null;
        this.hideSchoolInterior();
    }

    showSchoolInterior() {
        if (!this.currentSchool) return;

        // Pause main game
        this.scene.isPaused = true;

        // Create interior UI overlay
        this.createInteriorUI();
    }

    hideSchoolInterior() {
        // Resume main game
        this.scene.isPaused = false;

        // Destroy interior UI
        if (this.interiorUI) {
            this.interiorUI.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.interiorUI = null;
        }
    }

    createInteriorUI() {
        this.interiorUI = [];

        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // Background overlay
        const overlay = this.scene.add.rectangle(
            centerX, centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.85
        ).setScrollFactor(0).setDepth(1000);
        this.interiorUI.push(overlay);

        // School interior container
        const containerWidth = 700;
        const containerHeight = 500;

        // Main container background
        const container = this.scene.add.rectangle(
            centerX, centerY,
            containerWidth, containerHeight,
            0x2c3e50
        ).setScrollFactor(0).setDepth(1001);
        this.interiorUI.push(container);

        // Title
        const title = this.scene.add.text(
            centerX, centerY - containerHeight/2 + 30,
            `🏫 ${this.currentSchool.staff.principal}'s Office`,
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
        this.interiorUI.push(title);

        // Content area
        this.contentArea = this.scene.add.container(centerX - 300, centerY - 180);
        this.contentArea.setScrollFactor(0).setDepth(1002);
        this.interiorUI.push(this.contentArea);

        // Show simplified content
        this.showSimplifiedContent();

        // Close button
        const closeBtn = this.scene.add.rectangle(
            centerX + containerWidth/2 - 40, centerY - containerHeight/2 + 30,
            60, 30,
            0xe74c3c
        ).setScrollFactor(0).setDepth(1002).setInteractive({ useHandCursor: true });

        const closeTxt = this.scene.add.text(
            centerX + containerWidth/2 - 40, centerY - containerHeight/2 + 30,
            'EXIT',
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1003);

        closeBtn.on('pointerdown', () => {
            this.exitSchool();
        });

        this.interiorUI.push(closeBtn, closeTxt);
    }

    showSimplifiedContent() {
        if (!this.contentArea) return;

        // Clear existing content
        this.contentArea.removeAll(true);

        const school = this.currentSchool;
        const currentDay = Math.floor(this.scene.gameTime / (60 * 24));
        let yOffset = 0;

        // === ACTIVE EVENTS (Most important - what you can DO) ===
        const activeEvents = this.activeEvents.filter(e => e.school === school && e.active);

        if (activeEvents.length > 0) {
            const activeHeader = this.scene.add.text(0, yOffset, '⚡ HAPPENING NOW:', {
                fontSize: '22px',
                fontFamily: 'Arial',
                color: '#f39c12',
                fontStyle: 'bold'
            }).setOrigin(0);
            this.contentArea.add(activeHeader);
            yOffset += 40;

            activeEvents.forEach(event => {
                let eventText = '';
                let eventColor = 0x27ae60;

                if (event.type === 'fundraiser') {
                    eventText = `${event.extraData.icon} ${event.extraData.name} - Click to donate!`;
                    eventColor = 0x27ae60;
                } else if (event.type === 'scienceFair') {
                    eventText = `🔬 Science Fair - ${event.data} projects! Click to judge!`;
                    eventColor = 0x3498db;
                } else if (event.type === 'graduation') {
                    eventText = `🎓 Graduation Ceremony - ${event.data} graduates today!`;
                    eventColor = 0x9b59b6;
                }

                const eventBg = this.scene.add.rectangle(300, yOffset + 15, 600, 35, eventColor);
                const text = this.scene.add.text(10, yOffset, eventText, {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0);

                eventBg.setInteractive({ useHandCursor: true });
                eventBg.on('pointerdown', () => {
                    this.handleEventInteraction(event);
                });

                this.contentArea.add(eventBg);
                this.contentArea.add(text);
                yOffset += 45;
            });

            yOffset += 10;
        }

        // === KEY STATS (Simple and clean) ===
        const statsHeader = this.scene.add.text(0, yOffset, '📊 School Info:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0);
        this.contentArea.add(statsHeader);
        yOffset += 35;

        const stats = [
            { label: 'Students', value: school.students.length, icon: '👥' },
            { label: 'Education Level', value: `${school.educationLevel}/5 ⭐`, icon: '📚' },
            { label: 'Total Graduates', value: school.stats.totalGraduates, icon: '🎓' }
        ];

        stats.forEach(stat => {
            const text = this.scene.add.text(0, yOffset, `${stat.icon} ${stat.label}: ${stat.value}`, {
                fontSize: '15px',
                fontFamily: 'Arial',
                color: '#ecf0f1'
            }).setOrigin(0);
            this.contentArea.add(text);
            yOffset += 25;
        });

        yOffset += 15;

        // === NEXT EVENT (Quick preview) ===
        const nextEventHeader = this.scene.add.text(0, yOffset, '📅 Coming Up:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0);
        this.contentArea.add(nextEventHeader);
        yOffset += 35;

        const events = [
            { name: 'Graduation', day: school.calendar.nextGraduation, icon: '🎓' },
            { name: 'Science Fair', day: school.calendar.nextScienceFair, icon: '🔬' },
            { name: 'Fundraiser', day: school.calendar.nextFundraiser, icon: '💰' }
        ];

        // Sort by soonest
        events.sort((a, b) => a.day - b.day);
        const nextEvent = events[0];
        const daysUntil = nextEvent.day - currentDay;
        const timeText = daysUntil === 0 ? 'TODAY!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

        const nextEventText = this.scene.add.text(0, yOffset, `${nextEvent.icon} ${nextEvent.name}: ${timeText}`, {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: daysUntil === 0 ? '#e74c3c' : '#ecf0f1'
        }).setOrigin(0);
        this.contentArea.add(nextEventText);
        yOffset += 30;

        // === RECENT ANNOUNCEMENTS (Just 2-3 for flavor) ===
        const recentAnnouncements = this.announcements
            .filter(a => a.school === school)
            .slice(-3)
            .reverse();

        if (recentAnnouncements.length > 0) {
            yOffset += 10;
            const announcementsHeader = this.scene.add.text(0, yOffset, '📢 Latest News:', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0);
            this.contentArea.add(announcementsHeader);
            yOffset += 30;

            recentAnnouncements.forEach(announcement => {
                const text = this.scene.add.text(0, yOffset, `• ${announcement.message}`, {
                    fontSize: '13px',
                    fontFamily: 'Arial',
                    color: '#bdc3c7',
                    wordWrap: { width: 580 }
                }).setOrigin(0);
                this.contentArea.add(text);
                yOffset += text.height + 8;
            });
        }
    }


    handleEventInteraction(event) {
        if (event.type === 'fundraiser') {
            this.openDonationDialog(event);
        } else if (event.type === 'scienceFair') {
            this.openScienceFairJudging(event);
        } else if (event.type === 'graduation') {
            this.scene.uiManager.addNotification('🎓 Congratulations to all graduates!');
        }
    }

    openDonationDialog(event) {
        const donationOptions = [50, 100, 250, 500, 1000];

        // Simple donation - just pick an amount and donate
        const amount = donationOptions[2]; // Default $250

        if (this.scene.money >= amount) {
            this.scene.money -= amount;
            this.currentSchool.funding += amount;
            this.currentSchool.stats.totalFundsRaised += amount;

            // Chance to increase education level with enough funding
            if (this.currentSchool.funding >= 5000 * this.currentSchool.educationLevel) {
                this.currentSchool.educationLevel++;
                this.scene.uiManager.addNotification(`⭐ School education level increased to ${this.currentSchool.educationLevel}!`);
            }

            this.scene.uiManager.addNotification(`💝 Donated $${amount} to ${event.extraData.name}! Thank you!`);
            event.active = false; // Mark event as completed

            // Refresh the UI
            this.showSimplifiedContent();
        } else {
            this.scene.uiManager.addNotification('❌ Not enough money to donate!');
        }
    }

    openScienceFairJudging(event) {
        // Simple judging - pick a random winner
        const participants = event.extraData;
        if (participants && participants.length > 0) {
            const winner = participants[Math.floor(Math.random() * participants.length)];

            if (!this.currentSchool.achievements.scienceFairWinners.includes(winner.name)) {
                this.currentSchool.achievements.scienceFairWinners.push(winner.name);
                winner.achievements.push('Science Fair Winner');
                winner.gpa = Math.min(4.0, winner.gpa + 0.1); // Boost GPA
            }

            this.scene.uiManager.addNotification(`🏆 ${winner.name} won the Science Fair with their amazing project!`);
            event.active = false;

            // Refresh the UI
            this.showSimplifiedContent();
        }
    }

    // Check if player can enter school
    canEnterSchool() {
        return this.nearSchool !== null && !this.insideSchool;
    }

    // Get city-wide education benefits
    getEducationBonus() {
        let totalEducationLevel = 0;
        for (let school of this.schools) {
            totalEducationLevel += school.educationLevel;
        }

        // Each education level increases city income by 2%
        return totalEducationLevel * 0.02;
    }
}
