// Game script will go here
console.log("Script.js loaded");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Original Pac-Man resolution
const GAME_WIDTH = 224;
const GAME_HEIGHT = 288;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Game state (very simple for now)
let testRect = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    color: 'yellow'
};

function update() {
    // In the future, game logic updates will go here
    // For now, let's make the rectangle move a bit
    // testRect.x = (testRect.x + 1) % (GAME_WIDTH - testRect.width);
    // Commenting out movement for now to keep it simple for the first game loop step
}

function draw() {
    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the test rectangle
    ctx.fillStyle = testRect.color;
    ctx.fillRect(testRect.x, testRect.y, testRect.width, testRect.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initialize() {
    console.log("Initializing game.");
    // Any one-time setup can go here
    // Start the game loop
    gameLoop();
}

// Initialize the game
initialize();
