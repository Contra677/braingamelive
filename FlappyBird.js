const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const jumpHeightSlider = document.getElementById('jumpHeightSlider');
const gravitySlider = document.getElementById('gravitySlider');

const jumpHeightValue = document.getElementById('jumpHeightValue');
const gravityValue = document.getElementById('gravityValue');

canvas.width = 320;
canvas.height = 480;

let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
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
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            loseLife();  // Lose a life if the bird hits the ground
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.lift = parseFloat(jumpHeightSlider.value);
        this.velocity = this.lift;
    }
};

let pipes = [];
let pipeWidth = 30;
let pipeGap = 100;
let frame = 0;
let score = 0;
let lives = 3;         // Add lives counter
let distance = 0;      // Add distance traveled tracker

function createPipe() {
    let pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
    });
}

function drawPipes() {
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
    if (frame % 90 === 0) {
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
            loseLife();  // Lose a life on collision
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
    lives = 3;      // Reset lives
    distance = 0;   // Reset distance
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

function drawSpline() {
    ctx.beginPath();
    ctx.moveTo(bird.x, bird.y);

    let tempVelocity = bird.velocity;
    let tempY = bird.y;
    for (let i = 0; i < 100; i++) {
        tempVelocity += parseFloat(gravitySlider.value);
        tempY += tempVelocity;
        if (tempY + bird.height > canvas.height || tempY < 0) break;
        ctx.lineTo(bird.x + i * 2, tempY);
    }

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.draw();
    bird.update();

    updatePipes();
    drawPipes();
    checkCollision();

    frame++;
    if (frame % 90 === 0) score++;

    // Increment the distance traveled
    distance += 0.05; // Increment the distance based on game speed

    drawScore();
    drawLives();     // Draw lives
    drawDistance();  // Draw distance traveled

    // Draw the optimal trajectory spline
    drawSpline();

    requestAnimationFrame(updateGame);
}

// Update the output values for the sliders
jumpHeightSlider.addEventListener('input', function() {
    jumpHeightValue.textContent = jumpHeightSlider.value;
});

gravitySlider.addEventListener('input', function() {
    gravityValue.textContent = gravitySlider.value;
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

// Call the game loop
updateGame();
