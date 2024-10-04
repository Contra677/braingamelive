// Bots array to hold all ghost bots
let bots = [];
let botTransparency = 0.4;  // Transparency for ghostly appearance

// Function to initialize bots ahead of the player
function initializeBots(player) {
    const numBots = parseInt(document.getElementById('numBotsSlider').value); // Get number of bots from slider
    bots = [];  // Reset bots array

    if (!canvas || !playerImg) {
        console.error("Canvas or player image not available");
        return;
    }

    for (let i = 0; i < numBots; i++) {
        bots.push({
            x: player.x + (Math.random() * (canvas.width - player.x)),  // Random position between player and right edge
            y: canvas.height / 2 + (Math.random() * 100 - 50),  // Start near the middle with some variation
            width: parseFloat(playerSizeSlider.value),
            height: parseFloat(playerSizeSlider.value),
            velocity: 0,
            gravity: parseFloat(gravitySlider.value),
            alive: true,
            flapCooldown: 0,
            draw() {
                if (this.alive) {
                    ctx.globalAlpha = botTransparency;  // Make the bot ghostly
                    ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
                    ctx.globalAlpha = 1;  // Reset alpha
                }
            },
            update() {
                if (!this.alive) return;

                this.gravity = parseFloat(gravitySlider.value);
                this.velocity += this.gravity;
                this.y += this.velocity;

                // Keep bots within bounds and reset if they go off-screen
                if (this.y + this.height > canvas.height || this.y < 0) {
                    this.resetPosition();
                }

                // Smart navigation
                this.navigateObstacles();

                // Check collision with obstacles
                this.checkCollisionWithObstacles();
            },
            navigateObstacles() {
                const screenMiddle = canvas.height / 2;
                const allowedDeviation = canvas.height * 0.3; // 30% of screen height

                // Tend towards the middle of the screen
                if (this.y < screenMiddle - allowedDeviation) {
                    this.flap();
                } else if (this.y > screenMiddle + allowedDeviation) {
                    // Let gravity do its work
                } else if (Math.random() < 0.02) { // Occasional random flap for variation
                    this.flap();
                }

                // Find the nearest pipe
                let nearestPipe = null;
                let minDistance = Infinity;
                
                for (let pipe of pipes) {
                    if (pipe.x + pipeWidth > this.x) {
                        let distance = pipe.x - this.x;
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestPipe = pipe;
                        }
                    }
                }

                // Navigate through pipes
                if (nearestPipe) {
                    let gapCenter = nearestPipe.topHeight + pipeGap / 2;
                    
                    // Decide whether to flap based on position relative to gap
                    if (this.y > gapCenter + 20 && this.flapCooldown <= 0) {
                        this.flap();
                        this.flapCooldown = 10; // Prevent continuous flapping
                    }
                }

                // Decrement flap cooldown
                if (this.flapCooldown > 0) {
                    this.flapCooldown--;
                }
            },
            flap() {
                this.velocity = -parseFloat(jumpHeightSlider.value) * 0.8; // Slightly weaker flap than player
            },
            checkCollisionWithObstacles() {
                // Check for collision between bot and each obstacle
                pipes.forEach(pipe => {
                    if (
                        this.x < pipe.x + pipeWidth &&
                        this.x + this.width > pipe.x &&
                        (this.y < pipe.topHeight || this.y + this.height > canvas.height - pipe.bottomHeight)
                    ) {
                        this.resetPosition();  // Reset position instead of perishing
                    }
                });
            },
            resetPosition() {
                // Reset to a random position ahead of the player
                this.x = player.x + (Math.random() * (canvas.width - player.x));
                this.y = canvas.height / 2 + (Math.random() * 100 - 50);
                this.velocity = 0;
            }
        });
    }
}

// Function to update and draw bots
function updateBots() {
    bots.forEach(bot => {
        if (bot.alive) {
            bot.update();
            bot.draw();
        }
    });
}

// Export functions for use in other files
window.initializeBots = initializeBots;
window.updateBots = updateBots;