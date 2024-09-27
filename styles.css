const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get all the slider elements
const jumpHeightSlider = document.getElementById('jumpHeightSlider');
const gravitySlider = document.getElementById('gravitySlider');
const playerSizeSlider = document.getElementById('playerSizeSlider');
const obstacleSizeSlider = document.getElementById('obstacleSizeSlider');
const openingHeightSlider = document.getElementById('openingHeightSlider');
const obstacleFrequencySlider = document.getElementById('obstacleFrequencySlider');

// Get the output values for sliders
const jumpHeightValue = document.getElementById('jumpHeightValue');
const gravityValue = document.getElementById('gravityValue');
const playerSizeValue = document.getElementById('playerSizeValue');
const obstacleSizeValue = document.getElementById('obstacleSizeValue');
const openingHeightValue = document.getElementById('openingHeightValue');
const obstacleFrequencyValue = document.getElementById('obstacleFrequencyValue');

// Toggle controls
const toggleControlsIcon = document.getElementById('toggleControlsIcon');
const controlsDiv = document.getElementById('controls');

// Canvas dimensions
canvas.width = 320;
canvas.height = 480;

let bird = {
    x: 50,
    y: 150,
    width: parseFloat(playerSizeSlider.value),
    height: parseFloat(playerSizeSlider.value),
    gravity: parseFloat(gravitySlider.value),
    lift: parseFloat(jumpHeightSlider.value),
    velocity: 0,
    draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.gravity = parseFloat(gravitySlider.value);
        this.velocity += this.gravity;
        this.y += this.velocity;
        this.width = parseFloat(playerSizeSlider.value);
        this.height = parseFloat(playerSizeSlider.value);

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            loseLife();
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.lift = parseFloat(jumpHeightSlider.value);
        this.velocity = -this.lift;
    }
};

let pipes = [];
let pipeWidth = parseFloat(obstacleSizeSlider.value);
let pipeGap = parseFloat(openingHeightSlider.value);
let pipeFrequency = parseInt(obstacleFrequencySlider.value);  // Frequency of pipe creation
let frame = 0;
let score = 0;
let lives = 3;
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
    pipeWidth = parseFloat(obstacleSizeSlider.value); // Update obstacle size dynamically
    pipeGap = parseFloat(openingHeightSlider.value); // Update opening height dynamically
    pipes.forEach(pipe => {
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    if (frame % pipeFrequency === 0) {
        createPipe();
    }
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight)
        ) {
            loseLife();
        }
    });
}

function loseLife() {
    lives--;
    if (lives === 0) {
        resetGame();
    } else {
        bird.y = 150;
        bird.velocity = 0;
    }
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    lives = 3;
    distance = 0;
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawLives() {
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(`Lives: ${lives}`, 10, 50);
}

function drawDistance() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Distance: ${Math.floor(distance)}m`, 10, 70);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.draw();
    bird.update();

    updatePipes();
    drawPipes();
    checkCollision();

    frame++;
    if (frame % pipeFrequency === 0) score++;

    distance += 0.05;

    drawScore();
    drawLives();
    drawDistance();

    requestAnimationFrame(updateGame);
}

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
    obstacleFrequencyValue.textContent = obstacleFrequencySlider.value;
});

// Handle keyboard and touch input
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        bird.flap();
    }
});

// Handle touch events for iOS and other mobile devices
canvas.addEventListener('touchstart', () => {
    bird.flap();
});

// Handle control visibility toggle using the letter "X"
toggleControlsIcon.addEventListener('click', () => {
    controlsDiv.classList.toggle('hidden');
    toggleControlsIcon.textContent = controlsDiv.classList.contains('hidden') ? 'X' : 'X';
});

// Call the game loop
updateGame();
