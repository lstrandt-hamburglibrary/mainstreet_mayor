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
        width: 230,
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
        district: 'downtown',
        shopType: 'bookstore'
    },
    bakery: {
        name: 'Bakery',
        cost: 180,
        wood: 12,
        bricks: 10,
        width: 200,
        height: 240,
        color: 0xFFE4B5, // Moccasin/cream
        district: 'downtown',
        shopType: 'bakery',
        openingHour: 6, // Opens at 6am
        closingHour: 20, // Closes at 8pm
        menuItems: ['Donuts', 'Pie', 'Cookies', 'Bread', 'Croissants', 'Muffins']
    },
    arcade: {
        name: 'Arcade',
        cost: 350,
        wood: 20,
        bricks: 18,
        width: 230,
        height: 260,
        color: 0xFF00FF, // Magenta/bright
        district: 'downtown',
        entertainmentType: 'arcade',
        open24Hours: true, // Arcade is always open
        gamePlayPrice: 10 // $10 per customer visit
    },
    chinese_restaurant: {
        name: 'Chinese Restaurant',
        cost: 300,
        wood: 20,
        bricks: 15,
        width: 230,
        height: 220,
        color: 0xDC143C, // Crimson red
        district: 'downtown',
        restaurantType: 'chinese',
        mealPrice: 25
    },
    italian_restaurant: {
        name: 'Italian Restaurant',
        cost: 320,
        wood: 22,
        bricks: 16,
        width: 230,
        height: 220,
        color: 0x228B22, // Forest green
        district: 'downtown',
        restaurantType: 'italian',
        mealPrice: 30
    },
    diner: {
        name: 'Diner',
        cost: 250,
        wood: 18,
        bricks: 12,
        width: 230,
        height: 220,
        color: 0x4682B4, // Steel blue
        district: 'downtown',
        restaurantType: 'diner',
        mealPrice: 20
    },
    sub_shop: {
        name: 'Sub Shop',
        cost: 200,
        wood: 15,
        bricks: 10,
        width: 230,
        height: 220,
        color: 0xFFD700, // Gold/yellow
        district: 'downtown',
        restaurantType: 'sub_shop',
        mealPrice: 15
    },
    // Legacy restaurant type (for backward compatibility with old saves)
    restaurant: {
        name: 'Restaurant',
        cost: 300,
        wood: 20,
        bricks: 15,
        width: 230,
        height: 220,
        color: 0xDC143C,
        district: 'downtown',
        restaurantType: 'restaurant',
        mealPrice: 25
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
    library: {
        name: 'Library',
        cost: 400,
        wood: 25,
        bricks: 20,
        width: 230,
        height: 240,
        color: 0x8B4513, // Saddle brown
        district: 'downtown',
        serviceType: 'library',
        boostRadius: 300,
        boostPercent: 0.10, // 10% education boost
        boostType: 'residential',
        hasBookSales: true,
        hasProgramAnnouncements: true,
        lateFeeChance: 0.15, // 15% chance visitor has late fee
        lateFeeAmount: 5 // $5 late fee
    },
    museum: {
        name: 'Museum',
        cost: 800,
        wood: 30,
        bricks: 40,
        width: 230,
        height: 260,
        color: 0xD4AF37, // Gold
        district: 'downtown',
        specialType: 'museum',
        attractsTourists: true,
        admissionPrice: 15, // $15 admission ticket
        giftShopChance: 0.40, // 40% of visitors buy from gift shop
        giftShopPrice: 20, // $20 average gift shop purchase
        cafeChance: 0.30, // 30% of visitors use cafe
        cafePrice: 12 // $12 average cafe purchase
    },
    themePark: {
        name: 'Theme Park',
        cost: 2000,
        wood: 80,
        bricks: 60,
        width: 480, // Takes up 2 building spaces!
        height: 300,
        color: 0xFF1493, // Deep pink
        district: 'downtown',
        entertainmentType: 'themePark',
        attractsTourists: true,
        touristMultiplier: 3, // 3x tourist spawns when this exists
        ticketPrice: 35, // $35 per visitor
        open24Hours: true
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
    },
    park: {
        name: 'Park',
        cost: 500,
        wood: 10,
        bricks: 0,
        width: 200,
        height: 150,
        color: 0x4CAF50, // Green
        incomeRate: 0,
        maxIncome: 0,
        district: 'recreation',
        boostRadius: 300,
        boostPercent: 0.15 // 15% boost to nearby buildings
    },
    playground: {
        name: 'Playground',
        cost: 800,
        wood: 15,
        bricks: 10,
        width: 180,
        height: 140,
        color: 0xFF9800, // Orange
        incomeRate: 0,
        maxIncome: 0,
        district: 'recreation',
        boostRadius: 250,
        boostPercent: 0.20, // 20% boost
        boostType: 'residential' // Only boosts residential buildings
    },
    fountain: {
        name: 'Fountain',
        cost: 1200,
        wood: 0,
        bricks: 25,
        width: 120,
        height: 120,
        color: 0x2196F3, // Blue
        incomeRate: 0,
        maxIncome: 0,
        district: 'recreation',
        boostRadius: 200,
        boostPercent: 0.25 // 25% boost to all nearby buildings
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
    ],
    bakery: [
        { building: 0xFFB6C1, awning: 0xFF69B4, window: 0xFFFAF0 },  // Light Pink/Hot Pink
        { building: 0xFFC0CB, awning: 0xFF1493, window: 0xFFFACD },  // Pink/Deep Pink
        { building: 0xFFE4E1, awning: 0xDB7093, window: 0xFFF5EE },  // Misty Rose/Pale Violet Red
        { building: 0xFFF0F5, awning: 0xC71585, window: 0xFFFFF0 }   // Lavender Blush/Medium Violet Red
    ],
    arcade: [
        { building: 0xFF00FF, neon: 0x00FFFF, window: 0x1A1A1A, accent: 0xFFFF00 },  // Magenta/Cyan neon
        { building: 0x4B0082, neon: 0xFF1493, window: 0x0F0F0F, accent: 0x00FF00 },  // Indigo/Pink neon
        { building: 0x000080, neon: 0xFF4500, window: 0x1C1C1C, accent: 0xFF00FF },  // Navy/Red-Orange neon
        { building: 0x8B008B, neon: 0x00FF7F, window: 0x141414, accent: 0xFFD700 }   // Dark Magenta/Spring Green
    ],
    library: [
        { building: 0x8B4513, columns: 0xF5F5DC, window: 0xFFFAF0, door: 0x654321 },  // Brown/Beige
        { building: 0x654321, columns: 0xDEB887, window: 0xFFF8DC, door: 0x3E2723 },  // Dark Brown/Burlywood
        { building: 0x5D4037, columns: 0xD2B48C, window: 0xFFFFF0, door: 0x4E342E },  // Brown/Tan
        { building: 0x795548, columns: 0xF0E68C, window: 0xFFFAFA, door: 0x6D4C41 }   // Brown/Khaki
    ],
    museum: [
        { building: 0xF5F5DC, columns: 0xFFFFFF, roof: 0xD4AF37, window: 0x87CEEB, accent: 0xB8860B },  // Beige/White/Gold
        { building: 0xFFFAF0, columns: 0xF8F8FF, roof: 0xDAA520, window: 0xADD8E6, accent: 0xCD853F },  // Floral White/Gold
        { building: 0xFAF0E6, columns: 0xFFFFF0, roof: 0xFFD700, window: 0xB0E0E6, accent: 0xB8860B },  // Linen/Gold
        { building: 0xF0E68C, columns: 0xFFFFE0, roof: 0xDAA520, window: 0x87CEFA, accent: 0x9B7653 }   // Khaki/Light Yellow/Gold
    ],
    themePark: [
        { entrance: 0xFF1493, ride1: 0x00CED1, ride2: 0xFFD700, fence: 0xFF69B4, flags: 0xFF0000 },  // Pink/Cyan/Gold
        { entrance: 0x9370DB, ride1: 0xFF6347, ride2: 0x32CD32, fence: 0xBA55D3, flags: 0xFFFF00 },  // Purple/Red/Green
        { entrance: 0xFF4500, ride1: 0x1E90FF, ride2: 0xFF69B4, fence: 0xFF8C00, flags: 0x00FF00 },  // Orange/Blue/Pink
        { entrance: 0x00BFFF, ride1: 0xFF1493, ride2: 0xFFD700, fence: 0x87CEEB, flags: 0xFF0000 }   // Sky Blue/Pink/Gold
    ],
    lumbermill: [
        { building: 0x8D6E63, roof: 0x5D4037, logs: 0x6D4C41, sawBlade: 0xC0C0C0, window: 0xFFE0B2 },  // Brown/Dark Brown/Silver
        { building: 0x795548, roof: 0x4E342E, logs: 0x5D4037, sawBlade: 0xB0B0B0, window: 0xFFECB3 },  // Brown variations
        { building: 0xA1887F, roof: 0x6D4C41, logs: 0x795548, sawBlade: 0xD3D3D3, window: 0xFFE082 },  // Lighter brown
        { building: 0x8B7355, roof: 0x654321, logs: 0x704214, sawBlade: 0xC8C8C8, window: 0xFFEBCD }   // Tan/Brown
    ],
    brickfactory: [
        { building: 0xD84315, chimney: 0x5D4037, bricks: 0xBF360C, kiln: 0xFF5722, window: 0xFFE0B2 },  // Orange-Red/Dark Brown
        { building: 0xE64A19, chimney: 0x4E342E, bricks: 0xD84315, kiln: 0xFF6F00, window: 0xFFECB3 },  // Brighter Red
        { building: 0xBF360C, chimney: 0x3E2723, bricks: 0xD84315, kiln: 0xF4511E, window: 0xFFCCBC },  // Deep Red
        { building: 0xFF5722, chimney: 0x6D4C41, bricks: 0xE64A19, kiln: 0xFF7043, window: 0xFFAB91 }   // Bright Orange-Red
    ]
};
