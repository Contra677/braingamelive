const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Update canvas dimensions
canvas.width = 960;
canvas.height = 540;

// Parallax background variables
let backgroundLayers = [];
let backgroundSpeeds = [0.5, 1.5]; // Slower layer 1 and slightly faster layer 2

// Get slider elements and output values
const jumpHeightSlider = document.getElementById('jumpHeightSlider');
const gravitySlider = document.getElementById('gravitySlider');
const playerSizeSlider = document.getElementById('playerSizeSlider');
const obstacleSizeSlider = document.getElementById('obstacleSizeSlider');
const openingHeightSlider = document.getElementById('openingHeightSlider');
const obstacleFrequencySlider = document.getElementById('obstacleFrequencySlider');
const scrollSpeedSlider = document.getElementById('scrollSpeedSlider');
const skinSelector = document.getElementById('skinSelector');

// Output values for sliders
const jumpHeightValue = document.getElementById('jumpHeightValue');
const gravityValue = document.getElementById('gravityValue');
const playerSizeValue = document.getElementById('playerSizeValue');
const obstacleSizeValue = document.getElementById('obstacleSizeValue');
const openingHeightValue = document.getElementById('openingHeightValue');
const obstacleFrequencyValue = document.getElementById('obstacleFrequencyValue');
const scrollSpeedValue = document.getElementById('scrollSpeedValue');

// Bot slider elements
const numBotsSlider = document.getElementById('numBotsSlider');
const numBotsValue = document.getElementById('numBotsValue');

// Adjust jump height slider
jumpHeightSlider.min = 5;
jumpHeightSlider.max = 20;
jumpHeightSlider.value = 10;
jumpHeightValue.textContent = jumpHeightSlider.value;

// Toggle controls
const toggleControlsIcon = document.getElementById('toggleControlsIcon');
const controlsDiv = document.getElementById('controls');

let scrollSpeed = parseFloat(scrollSpeedSlider.value);

// Skin system
const skins = {
    default: {
        background: ['images/default_bg.png', 'images/default_bg_02.png'],
        player: 'images/default_player.gif',
        obstacle: 'images/default_obstacle.png',
        obstacleCap: 'images/default_obstacle_cap.png'
    },
    night: {
        background: ['images/night_bg.png', 'images/night_bg_02.png'],
        player: 'images/night_player.gif',
        obstacle: 'images/night_obstacle.png',
        obstacleCap: 'images/night_obstacle_cap.png'
    },
    underwater: {
        background: ['images/underwater_bg.png', 'images/underwater_bg_02.png'],
        player: 'images/underwater_player.gif',
        obstacle: 'images/underwater_obstacle.png',
        obstacleCap: 'images/underwater_obstacle_cap.png'
    }
};

let currentSkin = skins.default;

// Load images with error handling
let playerImg = new Image();
let obstacleImg = new Image();
let obstacleCapImg = new Image();

playerImg.onerror = () => console.error('Failed to load player image.');
obstacleImg.onerror = () => console.error('Failed to load obstacle image.');
obstacleCapImg.onerror = () => console.error('Failed to load obstacle cap image.');

function loadSkinImages() {
    console.log("Loading skin images...");
    playerImg.src = currentSkin.player;
    obstacleImg.src = currentSkin.obstacle;
    obstacleCapImg.src = currentSkin.obstacleCap;

    // Load multiple background layers
    backgroundLayers = currentSkin.background.map((src) => {
        let img = new Image();
        img.src = src;
        img.onerror = () => console.error(`Failed to load background image: ${src}`);
        return {
            image: img,
            x: 0  // Initial position for each layer
        };
    });
}

loadSkinImages();

// Bird object (the player's bird)
let bird = {
    x: 100,
    y: canvas.height / 2,  // Start at the center of the canvas vertically
    width: parseFloat(playerSizeSlider.value),  // Width from slider
    height: parseFloat(playerSizeSlider.value), // Height from slider
    gravity: parseFloat(gravitySlider.value),
    lift: parseFloat(jumpHeightSlider.value),
    velocity: 0,
    alive: true, // Ensure the bird starts alive
    draw() {
        if (this.alive) {
            ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
        }
    },
    update() {
        if (this.alive) {
            this.gravity = parseFloat(gravitySlider.value);
            this.velocity += this.gravity;
            this.y += this.velocity;
            this.width = parseFloat(playerSizeSlider.value);
            this.height = parseFloat(playerSizeSlider.value);

            // Ensure the bird stays within canvas bounds
            if (this.y + this.height > canvas.height) {
                this.y = canvas.height - this.height;
                this.velocity = 0;
                loseLife();  // Bird loses life if it hits the ground
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
                loseLife();  // Bird loses life if it hits the ceiling
            }
        }
    },
    flap() {
        if (this.alive) {
            this.lift = parseFloat(jumpHeightSlider.value);
            this.velocity = -this.lift;
        }
    }
};

// Pipe handling
let pipes = [];
let pipeWidth = parseFloat(obstacleSizeSlider.value);
let pipeGap = parseFloat(openingHeightSlider.value);
let pipeFrequency = parseInt(obstacleFrequencySlider.value);
let frame = 0;
let score = 0;
let lives = 3;  // Track lives
let distance = 0;

function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
    });
}

function drawPipes() {
    pipeWidth = parseFloat(obstacleSizeSlider.value);
    pipeGap = parseFloat(openingHeightSlider.value);
    pipes.forEach(pipe => {
        ctx.drawImage(obstacleImg, pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.drawImage(obstacleImg, pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
        ctx.drawImage(obstacleCapImg, pipe.x, pipe.topHeight - 10, pipeWidth, 20);
        ctx.drawImage(obstacleCapImg, pipe.x, canvas.height - pipe.bottomHeight - 10, pipeWidth, 20);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= scrollSpeed;
    });
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    if (frame % pipeFrequency === 0) {
        createPipe();
    }
}

// Check collision for player and pipes
function checkCollision(entity) {
    pipes.forEach(pipe => {
        if (
            entity.x < pipe.x + pipeWidth &&
            entity.x + entity.width > pipe.x &&
            (entity.y < pipe.topHeight || entity.y + entity.height > canvas.height - pipe.bottomHeight)
        ) {
            loseLife();  // Lose life if the player hits the pipe
        }
    });
}

// Lose a life and respawn the bird if there are lives left
function loseLife() {
    lives--;
    if (lives > 0) {
        respawnBird();
    } else {
        resetGame();
    }
}

// Respawn the bird at its starting position after a collision
function respawnBird() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.alive = true;  // Set bird to alive state for respawn
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.alive = true; // Reset bird's alive state
    pipes = [];
    score = 0;
    lives = 3;
    distance = 0;
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
}

function drawLives() {
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText(`Lives: ${lives}`, 20, 70);
}

function drawDistance() {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 100);
}

// Draw and update the parallax background layers
function drawParallaxBackground() {
    backgroundLayers.forEach((layer, index) => {
        ctx.drawImage(layer.image, layer.x, 0, canvas.width, canvas.height);
        ctx.drawImage(layer.image, layer.x + canvas.width, 0, canvas.width, canvas.height);

        // Move each background layer at a different speed
        layer.x -= backgroundSpeeds[index];

        // Reset background position for continuous scrolling
        if (layer.x <= -canvas.width) {
            layer.x = 0;
        }
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and move parallax background
    drawParallaxBackground();

    bird.update();
    bird.draw();
    checkCollision(bird);  // Only check collisions for the player bird

    // Update and draw ghost bots (bots perish independently)
    updateBots();

    updatePipes();
    drawPipes();

    frame++;
    if (frame % pipeFrequency === 0) score++;

    distance += scrollSpeed / 40;

    drawScore();
    drawLives();
    drawDistance();

    requestAnimationFrame(updateGame);
}

// Initialize the bots at the start of the game
if (typeof initializeBots === 'function') {
    initializeBots(bird);
}

// Add the new bot slider code here
numBotsSlider.addEventListener('input', function() {
    numBotsValue.textContent = numBotsSlider.value;
    initializeBots(bird);  // Reinitialize bots with new value
});

// Update the output values for the sliders
jumpHeightSlider.addEventListener('input', function() {
    jumpHeightValue.textContent = jumpHeightSlider.value;
});

gravitySlider.addEventListener('input', function() {
    gravityValue.textContent = gravitySlider.value;
});

playerSizeSlider.addEventListener('input', function() {
    playerSizeValue.textContent = playerSizeSlider.value;
});

obstacleSizeSlider.addEventListener('input', function() {
    obstacleSizeValue.textContent = obstacleSizeSlider.value;
});

openingHeightSlider.addEventListener('input', function() {
    openingHeightValue.textContent = openingHeightSlider.value;
});

obstacleFrequencySlider.addEventListener('input', function() {
    obstacleFrequencyValue.textContent = this.value;
    pipeFrequency = parseInt(this.value);
    console.log("Pipe frequency updated to:", pipeFrequency);  // Add this line for debugging
});

scrollSpeedSlider.addEventListener('input', function() {
    scrollSpeedValue.textContent = scrollSpeedSlider.value;
    scrollSpeed = parseFloat(scrollSpeedSlider.value);
});

// Handle skin selection
skinSelector.addEventListener('change', function() {
    currentSkin = skins[this.value];
    loadSkinImages();
});

// Handle keyboard and touch input
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && bird.alive) {
        bird.flap();
    }
});

canvas.addEventListener('touchstart', () => {
    if (bird.alive) {
        bird.flap();
    }
});

// Toggle controls visibility
toggleControlsIcon.addEventListener('click', () => {
    controlsDiv.classList.toggle('hidden');
    toggleControlsIcon.textContent = controlsDiv.classList.contains('hidden') ? '☰' : 'X';
});

// Call the game loop
console.log("Starting game...");
updateGame();
