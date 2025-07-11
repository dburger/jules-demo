// Game script will go here
console.log("Script.js loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Original Pac-Man resolution & Tile Size
const TILE_SIZE = 8; // Each tile is 8x8 pixels
const MAZE_WIDTH_TILES = 28;
const MAZE_HEIGHT_TILES = 36; // Includes ghost house area and bottom rows

const GAME_WIDTH = MAZE_WIDTH_TILES * TILE_SIZE; // 224
const GAME_HEIGHT = MAZE_HEIGHT_TILES * TILE_SIZE; // 288

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Tile Constants
const EMPTY = 0;
const WALL = 1;
const PELLET = 2;
const POWER_PELLET = 3;
const GHOST_DOOR = 4;
const GHOST_HOUSE = 5;
// const TUNNEL = 6; // Tunnel tiles are also EMPTY, but their behavior is handled by position.

// Maze Layout (28 columns x 36 rows)
// This is a common representation of the Pac-Man maze.
// Outer border is wall, then pellets, then actual maze structure.
// The bottom few rows are part of the ghost house logic or UI elements in original,
// but for drawing, we include them. The playable area is mostly above row 31.
// This maze layout is based on common canonical Pac-Man maze representations.
// W=Wall(1), P=Pellet(2), O=PowerPellet(3), E=Empty(0), D=Door(4), G=GhostHouse(5)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // 0
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1], // 1
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1], // 2
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1], // 3
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 4
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1], // 5
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1], // 6
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1], // 7 (0 above ghost house)
    [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0], // 8 (Tunnel row, path above ghost house)
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1], // 9 (Corrected path, removed extra element)
    [1,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,1], // 10 Ghost Pen top part with door
    [1,0,0,0,0,1,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,1,0,0,0,0,1], // 11 Ghost Pen
    [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1], // 12 Ghost Pen
    [0,0,0,0,0,0,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,0,0,0,0,0,0], // 13 Tunnel row, path below ghost house
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1], // 14
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1], // 15
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1], // 16
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1], // 17 Power pellet, central empty space
    [1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1], // 18
    [0,0,0,2,0,0,2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,2,0,0,2,0,0,0], // 19 Tunnel row
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1], // 20
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1], // 21
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1], // 22
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 23
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // 24 (Solid line often used to separate play area from status)
    // Rows below are often for status, lives, fruit, etc. and not part of Pac-Man's navigable space.
    // For our 36-row grid, these can be mostly empty or walls.
    // Pac-Man's starting Y is 23, which means maze[23] in a 0-indexed array.
    // The canonical maze is often described as 28 wide x 31 high for the playfield itself.
    // My Pac-Man start is pacman.y = 23 (index 23). This is row 24 on a 1-indexed map.
    // This means the maze above is mostly correct. The connectivity issue might be subtle or related to specific tiles.
    // Let's use a known good reference for rows 0-30 (the main play area up to the bottom line of dots).
    // The one from https://github.com/shaunlebron/pac-man-canvas is well-regarded.
    // I will adapt its structure for the first 31 rows.
    // Row 0-21 from original code.
    // Row 22: [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    // Row 23: [1,3,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,3,1], // Pacman start row
    // Row 24: [1,2,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,2,1],
    // Row 25: [1,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,1],
    // Row 26: [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
    // Row 27: [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    // Row 28: [1,2,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,2,1],
    // Row 29: [1,3,2,2,2,2,2,2,2,2,2,2,0,0,0,0,2,2,2,2,2,2,2,2,2,2,3,1],
    // Row 30: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // The rest are blank or boundary for the 36-row structure
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 31
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 32
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 33
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 34
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // 35
];

// Game State
let score = 0;
// let lives = 3; // Future addition
// let frightenedModeActive = false; // Future addition
// let frightenedModeTimer = 0; // Future addition
// const FRIGHTENED_DURATION = 7000; // 7 seconds for frightened mode

// Pac-Man Object
const pacman = {
    x: 13, // Starting grid column (0-indexed)
    y: 23, // Starting grid row (0-indexed) - common Pac-Man start
    pixelX: 0, // Precise pixel X coordinate, calculated in initialize
    pixelY: 0, // Precise pixel Y coordinate, calculated in initialize
    radius: TILE_SIZE / 2 * 0.9, // Radius for drawing, slightly smaller than tile to avoid overlap
    speed: TILE_SIZE / 4, // Movement speed in pixels per frame (e.g., 2 if TILE_SIZE is 8)
    direction: 'LEFT', // Initial direction Pac-Man is facing
    nextDirection: 'LEFT', // Buffered direction, initially same as current
    mouthOpenValue: 0.1, // Angle for mouth opening (0 is closed, typical values 0.05 to 0.2 for open)
    mouthOpening: true, // true if mouth is opening, false if closing
    mouthAnimationTimer: 0,
    mouthAnimationSpeed: 75, // ms per animation step for mouth
};

// Power Pellet flashing state
let powerPelletVisible = true;
let powerPelletTimer = 0;
const POWER_PELLET_FLASH_INTERVAL = 200; // milliseconds for flashing

function update() {
    // Game logic updates will go here
    const now = Date.now();
    if (now - powerPelletTimer > POWER_PELLET_FLASH_INTERVAL) {
        powerPelletVisible = !powerPelletVisible;
        powerPelletTimer = now;
    }

    // Pac-Man mouth animation
    if (now - pacman.mouthAnimationTimer > pacman.mouthAnimationSpeed) {
        if (pacman.mouthOpening) {
            pacman.mouthOpenValue += 0.03; // Increment opening
            if (pacman.mouthOpenValue >= 0.2) { // Max open
                pacman.mouthOpenValue = 0.2;
                pacman.mouthOpening = false;
            }
        } else {
            pacman.mouthOpenValue -= 0.03; // Decrement opening (closing)
            if (pacman.mouthOpenValue <= 0.05) { // Min open (almost closed)
                pacman.mouthOpenValue = 0.05;
                pacman.mouthOpening = true;
            }
        }
        pacman.mouthAnimationTimer = now;
    }

    // Pac-Man Movement Logic
    handlePacmanMovement();
}

function isWall(gridX, gridY) {
    // Check bounds
    if (gridX < 0 || gridX >= MAZE_WIDTH_TILES || gridY < 0 || gridY >= MAZE_HEIGHT_TILES) {
        return true; // Treat out-of-bounds as a wall for simplicity here
    }
    // Check maze data
    const tileType = maze[gridY][gridX];
    return tileType === WALL || tileType === GHOST_HOUSE; // Pac-Man cannot enter ghost house
}

function handlePacmanMovement() {
    const currentGridX = pacman.x;
    const currentGridY = pacman.y;
    const currentTileCenterX = currentGridX * TILE_SIZE + TILE_SIZE / 2;
    const currentTileCenterY = currentGridY * TILE_SIZE + TILE_SIZE / 2;
    const alignmentThreshold = pacman.speed / 1.9; // Needs to be slightly less than speed to trigger before overshooting

    // 1. Attempt to change direction if buffered
    if (pacman.nextDirection !== pacman.direction) {
        // Check if Pac-Man is close enough to the center of a tile to turn
        const canSnapTurnX = Math.abs(pacman.pixelX - currentTileCenterX) < alignmentThreshold;
        const canSnapTurnY = Math.abs(pacman.pixelY - currentTileCenterY) < alignmentThreshold;

        if (( (pacman.nextDirection === 'UP' || pacman.nextDirection === 'DOWN') && canSnapTurnX ) ||
            ( (pacman.nextDirection === 'LEFT' || pacman.nextDirection === 'RIGHT') && canSnapTurnY )) {

            let testNextX = currentGridX;
            let testNextY = currentGridY;
            switch (pacman.nextDirection) {
                case 'UP': testNextY--; break;
                case 'DOWN': testNextY++; break;
                case 'LEFT': testNextX--; break;
                case 'RIGHT': testNextX++; break;
            }
            if (!isWall(testNextX, testNextY)) {
                pacman.direction = pacman.nextDirection;
                // Snap to current tile's center axis for smooth turn
                if (pacman.direction === 'UP' || pacman.direction === 'DOWN') {
                    pacman.pixelX = currentTileCenterX;
                } else if (pacman.direction === 'LEFT' || pacman.direction === 'RIGHT') {
                    pacman.pixelY = currentTileCenterY;
                }
            }
        }
    }

    // 2. Calculate potential new pixel position
    let potentialPixelX = pacman.pixelX;
    let potentialPixelY = pacman.pixelY;

    switch (pacman.direction) {
        case 'UP':    potentialPixelY -= pacman.speed; break;
        case 'DOWN':  potentialPixelY += pacman.speed; break;
        case 'LEFT':  potentialPixelX -= pacman.speed; break;
        case 'RIGHT': potentialPixelX += pacman.speed; break;
    }

    // 3. Tunnel Logic - check before collision with walls
    if (currentGridY === 14) { // Tunnel row
        if (potentialPixelX < 0 && pacman.direction === 'LEFT') { // Left tunnel exit
            pacman.pixelX = GAME_WIDTH + pacman.speed; // Emerge on the right, just off screen
            pacman.x = MAZE_WIDTH_TILES; // grid x will be updated to 27 when fully on screen
            return; // Skip wall collision for this frame
        } else if (potentialPixelX > GAME_WIDTH && pacman.direction === 'RIGHT') { // Right tunnel exit
            pacman.pixelX = 0 - pacman.speed; // Emerge on the left, just off screen
            pacman.x = -1; // grid x will be updated to 0 when fully on screen
            return; // Skip wall collision for this frame
        }
    }

    // 4. Collision Detection & Movement
    // Determine the next tile Pac-Man is trying to enter based on his current direction
    let nextTileX = currentGridX;
    let nextTileY = currentGridY;

    if (pacman.direction === 'UP' && potentialPixelY < currentTileCenterY - alignmentThreshold) {
        nextTileY = currentGridY - 1;
    } else if (pacman.direction === 'DOWN' && potentialPixelY > currentTileCenterY + alignmentThreshold) {
        nextTileY = currentGridY + 1;
    } else if (pacman.direction === 'LEFT' && potentialPixelX < currentTileCenterX - alignmentThreshold) {
        nextTileX = currentGridX - 1;
    } else if (pacman.direction === 'RIGHT' && potentialPixelX > currentTileCenterX + alignmentThreshold) {
        nextTileX = currentGridX + 1;
    }

    // If the actual tile Pacman is moving to IS different from current tile, check it for wall
    if ((nextTileX !== currentGridX || nextTileY !== currentGridY) && isWall(nextTileX, nextTileY)) {
        // Collision with a wall. Stop Pac-Man at the edge of the current tile.
        pacman.pixelX = currentTileCenterX;
        pacman.pixelY = currentTileCenterY;
        // Optional: could try to keep moving along the other axis if a turn was recently made
        // but for classic Pac-Man, he usually just stops.
    } else {
        // No collision, or still within the current tile, or moving into an open tile.
        pacman.pixelX = potentialPixelX;
        pacman.pixelY = potentialPixelY;

        // 5. Update grid coordinates (pacman.x, pacman.y) when Pac-Man is centered over a new tile.
        // This is important for logic that depends on grid position (like eating dots).
        const newGridX = Math.floor(pacman.pixelX / TILE_SIZE);
        const newGridY = Math.floor(pacman.pixelY / TILE_SIZE);

        // Check if PacMan is centered enough on a tile to update his logical grid position
        const newTileCenterX = newGridX * TILE_SIZE + TILE_SIZE / 2;
        const newTileCenterY = newGridY * TILE_SIZE + TILE_SIZE / 2;

        if (Math.abs(pacman.pixelX - newTileCenterX) < pacman.speed &&
            Math.abs(pacman.pixelY - newTileCenterY) < pacman.speed) {
            if (pacman.x !== newGridX || pacman.y !== newGridY) {
                 // Snapping to center of the new tile if we are sure we have entered it
                if ( (pacman.direction === 'LEFT' || pacman.direction === 'RIGHT') && Math.abs(pacman.pixelX - newTileCenterX) < alignmentThreshold) {
                    pacman.x = newGridX;
                    pacman.pixelY = newTileCenterY; // also align Y to prevent drift
                } else if ( (pacman.direction === 'UP' || pacman.direction === 'DOWN') && Math.abs(pacman.pixelY - newTileCenterY) < alignmentThreshold ) {
                    pacman.y = newGridY;
                    pacman.pixelX = newTileCenterX; // also align X to prevent drift
                }
            }
        }
         // Fallback for grid update if not perfectly centered but clearly in new tile by majority
        if (pacman.x !== newGridX && ( (pacman.direction === 'LEFT' && pacman.pixelX < newTileCenterX + pacman.speed) || (pacman.direction === 'RIGHT' && pacman.pixelX > newTileCenterX - pacman.speed) ) ) {
            pacman.x = newGridX;
        }
        if (pacman.y !== newGridY && ( (pacman.direction === 'UP' && pacman.pixelY < newTileCenterY + pacman.speed) || (pacman.direction === 'DOWN' && pacman.pixelY > newTileCenterY - pacman.speed) ) ) {
            pacman.y = newGridY;
            // Pellet check will be done once after all position updates
        }
        // Note: The X update was already done before this Y update in the previous block.
        // So, by this point, pacman.x and pacman.y should reflect the new grid cell if movement occurred.

        // Centralized pellet check based on Pac-Man's current, updated grid position
        // This ensures it's checked once per frame after movement logic.
        if (pacman.x >= 0 && pacman.x < MAZE_WIDTH_TILES && pacman.y >= 0 && pacman.y < MAZE_HEIGHT_TILES) {
            const tilePacmanIsOnX = pacman.x;
            const tilePacmanIsOnY = pacman.y;
            // Only check if the tile type indicates a pellet/power pellet.
            // This prevents trying to eat from an already empty tile repeatedly.
            if (maze[tilePacmanIsOnY][tilePacmanIsOnX] === PELLET || maze[tilePacmanIsOnY][tilePacmanIsOnX] === POWER_PELLET) {
                 checkAndEatPellet(tilePacmanIsOnX, tilePacmanIsOnY);
            }
        }
    }
}

function checkAndEatPellet(gridX, gridY) {
    const tileType = maze[gridY][gridX];
    if (tileType === PELLET) {
        maze[gridY][gridX] = EMPTY;
        score += 10;
        // console.log("Score: ", score); // For debugging
        // Play sound effect for eating pellet (future)
    } else if (tileType === POWER_PELLET) {
        maze[gridY][gridX] = EMPTY;
        score += 50;
        // console.log("Score: ", score, " - POWER PELLET!"); // For debugging
        // Trigger frightened mode for ghosts (future)
        // frightenedModeActive = true;
        // frightenedModeTimer = Date.now();
        // Play sound effect for eating power pellet (future)
        // Play sound for ghost frightened mode start (future)
    }
}

function drawMaze() {
    for (let row = 0; row < MAZE_HEIGHT_TILES; row++) {
        for (let col = 0; col < MAZE_WIDTH_TILES; col++) {
            const tileType = maze[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            // Draw walls first
            if (tileType === WALL) {
                ctx.fillStyle = '#0000FF'; // Blue for walls
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            // Then draw items on top of (potentially) empty background
            else if (tileType === PELLET) {
                ctx.fillStyle = '#FFFFFF'; // White for pellets
                ctx.beginPath();
                // Draw a small circle in the center of the tile
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 5, 0, 2 * Math.PI);
                ctx.fill();
            } else if (tileType === POWER_PELLET) {
                if (powerPelletVisible) {
                    ctx.fillStyle = '#FFFFFF'; // White for power pellets
                    ctx.beginPath();
                    // Draw a larger circle
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            } else if (tileType === GHOST_DOOR) {
                ctx.fillStyle = '#FFB8FF'; // Pinkish for ghost door
                // Draw a horizontal line for the door
                ctx.fillRect(x, y + TILE_SIZE / 2 - TILE_SIZE / 8, TILE_SIZE, TILE_SIZE / 4);
            }
            // EMPTY, GHOST_HOUSE tiles are implicitly drawn as black by the background clear.
            // Specific GHOST_HOUSE interior could be drawn if needed (e.g., different background color).
        }
    }
}

function draw() {
    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawPacman();
}

function drawPacman() {
    ctx.save(); // Save the current context state
    ctx.translate(pacman.pixelX, pacman.pixelY); // Translate to Pac-Man's position

    // Rotate according to direction
    switch (pacman.direction) {
        case 'RIGHT':
            ctx.rotate(0);
            break;
        case 'LEFT':
            ctx.rotate(Math.PI); // 180 degrees
            break;
        case 'UP':
            ctx.rotate(-Math.PI / 2); // -90 degrees
            break;
        case 'DOWN':
            ctx.rotate(Math.PI / 2); // 90 degrees
            break;
    }

    ctx.fillStyle = 'yellow';
    ctx.beginPath();

    // Draw Pac-Man with mouth
    // The arc starts from mouthOpenValue to -mouthOpenValue (or 2*PI - mouthOpenValue)
    // This creates a wedge shape for the mouth.
    ctx.arc(0, 0, pacman.radius, pacman.mouthOpenValue * Math.PI, (2 - pacman.mouthOpenValue) * Math.PI);
    ctx.lineTo(0, 0); // Line to the center to close the shape
    ctx.fill();

    ctx.closePath();
    ctx.restore(); // Restore the context state
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initialize() {
    console.log("Initializing game with maze data and drawing maze.");
    powerPelletTimer = Date.now(); // Initialize timer for flashing power pellets

    // Initialize Pac-Man's pixel coordinates
    pacman.pixelX = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    pacman.pixelY = pacman.y * TILE_SIZE + TILE_SIZE / 2;
    pacman.mouthAnimationTimer = Date.now();

    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown);

    // Start the game loop
    gameLoop();
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            pacman.nextDirection = 'UP';
            break;
        case 'ArrowDown':
            pacman.nextDirection = 'DOWN';
            break;
        case 'ArrowLeft':
            pacman.nextDirection = 'LEFT';
            break;
        case 'ArrowRight':
            pacman.nextDirection = 'RIGHT';
            break;
    }
}

// Initialize the game
initialize();
