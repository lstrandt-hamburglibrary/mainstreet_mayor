# Main Street Mayor - Game Design Document

## Vision
A side-scrolling city-builder where you play as the Mayor, building your street from the pavement up. Mix of platforming, building placement, and management simulation.

## Core Concept
Walk the street as the Mayor character, building apartments, mom and pop stores, businesses, and infrastructure. Manage the economy through:
- Collecting rent
- Making repairs
- Filling orders
- Making friends with NPCs
- Buying and selling

## Current Features (Implemented)
- ✅ Side-scrolling platformer movement (WASD/Arrows)
- ✅ Jump mechanics (Space)
- ✅ Building placement system (grid-based)
- ✅ Resource management (money, wood, bricks)
- ✅ Save/Load system (localStorage)
- ✅ Restart game functionality
- ✅ 7 Building Types: House, Shop, Restaurant, Bank, Market, Lumber Mill, Brick Factory
- ✅ Bank system (deposit, withdraw, loans with interest)
- ✅ Resource acquisition (Market for buying, production buildings for collecting)
- ✅ Income generation system (Houses, Shops, Restaurants generate money over time)
- ✅ Manual income collection (walk to buildings and press E to collect rent/revenue)
- ✅ Visual income indicators (💰 appears when money is ready)
- ✅ Time system with day/night cycle (tracks game time in days, hours, minutes)
- ✅ Time speed controls (1x, 2x, 3x speed - press T to toggle)
- ✅ Time affects income and resource generation rates

## Building Types

### House
- **Cost**: $100, 10 wood, 5 bricks
- **Size**: 160×200
- **Purpose**: Residential housing for citizens
- **Income**: $5/minute, max $50 (walk to building and press E to collect)

### Shop
- **Cost**: $200, 15 wood, 10 bricks
- **Size**: 200×240
- **Purpose**: Commercial retail space
- **Income**: $10/minute, max $100 (walk to building and press E to collect)

### Restaurant
- **Cost**: $300, 20 wood, 15 bricks
- **Size**: 240×220
- **Purpose**: Food service business
- **Income**: $15/minute, max $150 (walk to building and press E to collect)

### Bank
- **Cost**: $500, 25 wood, 30 bricks
- **Size**: 220×260
- **Purpose**: Financial services
- **Features**:
  - Deposit money (store cash safely)
  - Withdraw money
  - Borrow money (take loans)
  - Loan tracking with interest

### Market
- **Cost**: $150, 12 wood, 8 bricks
- **Size**: 180×180
- **Purpose**: Resource shop
- **Features**:
  - Buy 10 wood for $50
  - Buy 10 bricks for $75
  - Quick resource acquisition with cash

### Lumber Mill
- **Cost**: $250, 5 wood, 20 bricks
- **Size**: 200×200
- **Purpose**: Wood production
- **Features**:
  - Regenerates 1 wood per minute (max 15 stored)
  - Free to collect stored resources
  - 🪵 indicator appears when resources available
  - Walk to building and press E to collect

### Brick Factory
- **Cost**: $250, 20 wood, 5 bricks
- **Size**: 200×200
- **Purpose**: Brick production
- **Features**:
  - Regenerates 1 brick per minute (max 15 stored)
  - Free to collect stored resources
  - 🧱 indicator appears when resources available
  - Walk to building and press E to collect

## Planned Features

### Phase 1: Resource System ✅ COMPLETED
- [x] Market building for buying resources
- [x] Lumber Mill for wood generation
- [x] Brick Factory for brick generation
- [x] Building interactions
- [x] Resource UI menus

### Phase 2: Income Generation ✅ COMPLETED
- [x] Rent collection from buildings
- [x] Periodic income from shops/restaurants (accumulates over time)
- [x] Income notification system (💰 indicator)
- [x] Walk to buildings to collect rent in person
- [x] Income caps to prevent infinite accumulation

### Phase 3: NPCs & Citizens
- [ ] Citizen spawning system
- [ ] NPCs walk around the street
- [ ] Shopkeepers in stores
- [ ] Population counter
- [ ] Housing occupancy

### Phase 4: Building Interactions
- [ ] Enter buildings (interior views?)
- [ ] Building repairs/maintenance
- [ ] Upgrade buildings
- [ ] Building deterioration over time

### Phase 5: Quests & Orders
- [ ] Quest system
- [ ] Delivery orders
- [ ] Building requests from NPCs
- [ ] Objectives and goals

### Phase 6: Social/Friendship System
- [ ] Talk to NPCs
- [ ] Friendship levels
- [ ] Relationship benefits
- [ ] Special quests from friends

### Phase 7: Infrastructure
- [ ] Pavement/road building
- [ ] Street lights
- [ ] Decorations
- [ ] Utilities (power, water)

## Economy Design
- **Starting Resources**: $1000, 50 wood, 30 bricks
- **Bank Loans**: TBD (interest rate, max loan amount)
- **Rent Income**: TBD (per building type)
- **Repair Costs**: TBD

## Controls
- **Arrow Keys / WASD**: Move left/right
- **Space / W / Up Arrow**: Jump
- **B**: Toggle build mode
- **1/2/3/4/5/6/7** (in build mode): Select building type
- **Click** (in build mode): Place building
- **E** (near building): Interact with Bank, Market, Lumber Mill, or Brick Factory
- **R**: Restart game (with confirmation)
- **T**: Toggle time speed (1x ▶ / 2x ▶▶ / 3x ▶▶▶)

## Technical Stack
- **Engine**: Phaser 3
- **Language**: JavaScript
- **Storage**: localStorage (for save games)
- **Resolution**: Fullscreen (responsive, adapts to window size)

## Art Style
- Simple geometric shapes and colors
- Colorful, cheerful aesthetic
- Mayor character with suit, tie, and official hat
- Buildings with windows, doors, roofs

## Notes
- Grid-based building placement (240px spacing)
- Auto-save on building placement
- Auto-load on game start
- World bounds: 3000px width (scrolling camera), height adapts to screen
