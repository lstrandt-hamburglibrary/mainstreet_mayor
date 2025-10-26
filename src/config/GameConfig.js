// Game configuration and constants
export const GameConfig = {
    // World dimensions
    WORLD_WIDTH: 12000,

    // Starting resources
    STARTING_MONEY: 5000,
    STARTING_WOOD: 200,
    STARTING_BRICKS: 150,

    // Bank system
    LOAN_INTEREST_RATE: 0.1,  // 10% interest
    SAVINGS_INTEREST_RATE: 0.05,  // 5% interest on savings

    // Time system
    DEFAULT_TIME_SPEED: 1,  // 1x, 2x, or 3x speed

    // Population
    STARTING_POPULATION: 20,
    CITIZEN_SPAWN_INTERVAL: 5000,  // 5 seconds between spawns

    // Ground positioning
    GROUND_OFFSET: 50,  // Distance from bottom of screen
    FLOOR_OFFSET: 100,  // Distance from bottom for character positioning
};

// Building type definitions
export const BuildingTypes = {
    house: {
        name: 'House',
        cost: 100,
        wood: 10,
        bricks: 5,
        width: 160,
        height: 260,
        color: 0xFF6B6B,
        incomeRate: 5,
        maxIncome: 50,
        district: 'residential'
    },
    apartment: {
        name: 'Apartment',
        cost: 400,
        wood: 30,
        bricks: 35,
        width: 200,
        height: 360,
        color: 0xFF8C94,
        units: 8,
        incomePerUnit: 8,
        maxIncomePerUnit: 80,
        district: 'residential'
    },
    hotel: {
        name: 'Hotel',
        cost: 600,
        wood: 40,
        bricks: 45,
        width: 240,
        height: 400,
        color: 0x9C27B0,
        rooms: 10,
        nightlyRate: 50,
        cleaningCost: 15,
        district: 'residential'
    },
    clothingShop: {
        name: 'Clothing Shop',
        cost: 200,
        wood: 15,
        bricks: 10,
        width: 200,
        height: 240,
        color: 0xFF69B4,
        incomeRate: 10,
        maxIncome: 100,
        district: 'downtown',
        shopType: 'clothing'
    },
    electronicsShop: {
        name: 'Electronics Shop',
        cost: 250,
        wood: 15,
        bricks: 15,
        width: 200,
        height: 240,
        color: 0x2196F3,
        incomeRate: 15,
        maxIncome: 150,
        district: 'downtown',
        shopType: 'electronics'
    },
    groceryStore: {
        name: 'Grocery Store',
        cost: 180,
        wood: 12,
        bricks: 8,
        width: 200,
        height: 240,
        color: 0x8BC34A,
        incomeRate: 8,
        maxIncome: 80,
        district: 'downtown',
        shopType: 'grocery'
    },
    bookstore: {
        name: 'Bookstore',
        cost: 150,
        wood: 10,
        bricks: 8,
        width: 200,
        height: 240,
        color: 0x9C27B0,
        incomeRate: 7,
        maxIncome: 70,
        district: 'downtown',
        shopType: 'bookstore'
    },
    restaurant: {
        name: 'Restaurant',
        cost: 300,
        wood: 20,
        bricks: 15,
        width: 240,
        height: 220,
        color: 0xFFE66D,
        incomeRate: 15,
        maxIncome: 150,
        district: 'downtown'
    },
    bank: {
        name: 'Bank',
        cost: 500,
        wood: 25,
        bricks: 30,
        width: 220,
        height: 260,
        color: 0x2E7D32,
        district: 'downtown'
    },
    market: {
        name: 'Market',
        cost: 150,
        wood: 12,
        bricks: 8,
        width: 180,
        height: 180,
        color: 0xFF9800,
        district: 'industrial'
    },
    lumbermill: {
        name: 'Lumber Mill',
        cost: 250,
        wood: 5,
        bricks: 20,
        width: 200,
        height: 200,
        color: 0x8D6E63,
        resourceType: 'wood',
        regenRate: 1,
        maxStorage: 15,
        district: 'industrial'
    },
    brickfactory: {
        name: 'Brick Factory',
        cost: 250,
        wood: 20,
        bricks: 5,
        width: 200,
        height: 200,
        color: 0xD84315,
        resourceType: 'bricks',
        regenRate: 1,
        maxStorage: 15,
        district: 'industrial'
    }
};

// District definitions
export const Districts = {
    residential: {
        name: 'Residential District',
        startX: 0,
        endX: 4000,
        centerX: 2000,
        color: 0xFF6B6B,
        description: 'Houses, Apartments, Hotels'
    },
    downtown: {
        name: 'Downtown',
        startX: 4000,
        endX: 8000,
        centerX: 6000,
        color: 0x4ECDC4,
        description: 'Shops, Restaurants, Banks'
    },
    industrial: {
        name: 'Industrial District',
        startX: 8000,
        endX: 12000,
        centerX: 10000,
        color: 0x8D6E63,
        description: 'Markets, Lumber Mills, Brick Factories'
    }
};

// Color schemes for building variations
export const ColorSchemes = {
    house: [
        { building: 0xFF6B6B, roof: 0x8B4513, door: 0x654321, window: 0x87CEEB },  // Red/Brown
        { building: 0xFFE66D, roof: 0x8B6914, door: 0x654321, window: 0x87CEEB },  // Yellow/Brown
        { building: 0x95E1D3, roof: 0x5A7C6F, door: 0x3E5C4F, window: 0x87CEEB },  // Teal/Green
        { building: 0xF38181, roof: 0xAA5656, door: 0x654321, window: 0x87CEEB }   // Pink/Mauve
    ],
    apartment: [
        { building: 0xFF8C94, balcony: 0xC75A62, door: 0x654321, window: 0xE3F2FD },  // Pink
        { building: 0x7BA8D1, balcony: 0x5A7FA0, door: 0x654321, window: 0xE3F2FD },  // Blue
        { building: 0xA8D8A0, balcony: 0x7FA877, door: 0x654321, window: 0xE3F2FD },  // Green
        { building: 0xD4A5A5, balcony: 0xA87777, door: 0x654321, window: 0xE3F2FD }   // Mauve
    ],
    hotel: [
        { building: 0x9C27B0, trim: 0x7B1FA2, balcony: 0x6A1B9A, window: 0xF3E5F5, accent: 0xFFD700 },  // Purple with gold sign
        { building: 0x1976D2, trim: 0x1565C0, balcony: 0x0D47A1, window: 0xE3F2FD, accent: 0xFFD700 },  // Blue with gold sign
        { building: 0xD32F2F, trim: 0xC62828, balcony: 0xB71C1C, window: 0xFFEBEE, accent: 0xFFD700 },  // Red with gold sign
        { building: 0x388E3C, trim: 0x2E7D32, balcony: 0x1B5E20, window: 0xE8F5E9, accent: 0xFFD700 }   // Green with gold sign
    ],
    clothingShop: [
        { building: 0xFF69B4, awning: 0xFF1493, window: 0xFFE4E1 },  // Hot Pink
        { building: 0xDDA0DD, awning: 0xDA70D6, window: 0xF8E8FF },  // Plum/Orchid
        { building: 0xF0E68C, awning: 0xDAA520, window: 0xFFFACD },  // Khaki/Gold
        { building: 0xFFB6C1, awning: 0xFF69B4, window: 0xFFF0F5 }   // Light Pink
    ],
    electronicsShop: [
        { building: 0x1E88E5, awning: 0x1976D2, window: 0xE3F2FD },  // Classic Blue
        { building: 0x424242, awning: 0x212121, window: 0xF5F5F5 },  // Sleek Gray/Black
        { building: 0x00897B, awning: 0x00695C, window: 0xE0F2F1 },  // Teal/Cyan
        { building: 0x5E35B1, awning: 0x4527A0, window: 0xEDE7F6 }   // Purple/Violet
    ],
    groceryStore: [
        { building: 0x8BC34A, awning: 0x689F38, window: 0xF1F8E9 },  // Light Green
        { building: 0x4CAF50, awning: 0x388E3C, window: 0xE8F5E9 },  // Standard Green
        { building: 0xFFA726, awning: 0xF57C00, window: 0xFFF3E0 },  // Orange (fresh produce)
        { building: 0xAED581, awning: 0x9CCC65, window: 0xF9FBE7 }   // Lime Green
    ],
    bookstore: [
        { building: 0x9C27B0, awning: 0x7B1FA2, window: 0xF3E5F5 },  // Purple (original)
        { building: 0x6A4C3A, awning: 0x5D4037, window: 0xEFEBE9 },  // Brown/Woody
        { building: 0x455A64, awning: 0x37474F, window: 0xECEFF1 },  // Blue-Gray
        { building: 0xC62828, awning: 0xB71C1C, window: 0xFFEBEE }   // Deep Red/Burgundy
    ]
};
