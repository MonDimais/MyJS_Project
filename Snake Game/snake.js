//board
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context; 

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX;
var foodY;

var gameOver = false;

// Game settings
var score = 0;
var highScore = localStorage.getItem('snakeHighScore') || 0;
var gameSpeed = 100; // Default medium speed
var gameInterval;
var currentDifficulty = 'medium';
var gameFocused = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    // Initialize game
    initGame();
    
    // Set default difficulty
    setDifficulty('medium');
    
    // Update high score display
    document.getElementById("highScore").innerText = highScore;
    
    // Add focus management
    setupFocusManagement();
}

function setupFocusManagement() {
    // Focus on game when clicking canvas or game container
    const gameContainer = document.getElementById("gameContainer");
    
    gameContainer.addEventListener('click', function() {
        focusGame();
    });
    
    // Lose focus when clicking outside game area
    document.addEventListener('click', function(e) {
        if (!gameContainer.contains(e.target) && !e.target.classList.contains('difficulty-btn') && !e.target.classList.contains('restart-btn')) {
            unfocusGame();
        }
    });
    
    // Prevent arrow key scrolling when game is focused
    document.addEventListener('keydown', function(e) {
        if (gameFocused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
}

function focusGame() {
    gameFocused = true;
    document.getElementById("gameContainer").classList.add('focused');
    document.getElementById("focusIndicator").style.display = "block";
}

function unfocusGame() {
    gameFocused = false;
    document.getElementById("gameContainer").classList.remove('focused');
    document.getElementById("focusIndicator").style.display = "none";
}

function initGame() {
    // Reset game variables
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    gameOver = false;
    score = 0;
    
    // Update score display
    document.getElementById("score").innerText = score;
    
    // Place initial food
    placeFood();
    
    // Remove old event listener and add new one
    document.removeEventListener("keyup", changeDirection);
    document.addEventListener("keyup", changeDirection);
    
    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Start game loop with current speed
    gameInterval = setInterval(update, gameSpeed);
    
    // Hide game over message if visible
    let gameOverMsg = document.getElementById("gameOverMessage");
    if (gameOverMsg) {
        gameOverMsg.style.display = "none";
    }
    
    // Auto focus on game start
    focusGame();
}

function restartGame() {
    initGame();
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update button styles
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(difficulty + 'Btn').classList.add('active');
    
    // Set game speed based on difficulty
    switch(difficulty) {
        case 'easy':
            gameSpeed = 150; // Slower
            break;
        case 'medium':
            gameSpeed = 100; // Normal
            break;
        case 'hard':
            gameSpeed = 50; // Faster
            break;
    }
    
    // Restart game with new speed if game is running
    if (!gameOver && gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(update, gameSpeed);
    }
}

function update() {
    if (gameOver) {
        return;
    }

    // Clear board
    context.fillStyle="black";
    context.fillRect(0, 0, board.width, board.height);

    // Draw food
    context.fillStyle="red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Check if food eaten
    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        score += 10;
        document.getElementById("score").innerText = score;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById("highScore").innerText = highScore;
        }
    }

    // Move snake body
    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Update snake position
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    
    // Draw snake
    context.fillStyle="lime";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Check game over conditions
    if (snakeX < 0 || snakeX >= cols*blockSize || snakeY < 0 || snakeY >= rows*blockSize) {
        endGame();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            endGame();
        }
    }
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    unfocusGame();
    
    // Show game over message
    showGameOverMessage();
}

function showGameOverMessage() {
    if (!document.getElementById("gameOverMessage")) {
        let gameOverDiv = document.createElement("div");
        gameOverDiv.id = "gameOverMessage";
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Score: ${score}</p>
                <p>High Score: ${highScore}</p>
                <button onclick="restartGame()" class="restart-btn">Play Again</button>
            </div>
        `;
        document.body.appendChild(gameOverDiv);
    } else {
        document.getElementById("gameOverMessage").style.display = "flex";
        document.querySelector("#gameOverMessage p").innerText = `Score: ${score}`;
        document.querySelector("#gameOverMessage p:nth-child(3)").innerText = `High Score: ${highScore}`;
    }
}

function changeDirection(e) {
    // Only process input if game is focused
    if (!gameFocused) return;
    
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

function placeFood() {
    //(0-1) * cols -> (0-19.9999) -> (0-19) * 25
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
    
    // Make sure food doesn't appear on snake
    for (let i = 0; i < snakeBody.length; i++) {
        if (foodX == snakeBody[i][0] && foodY == snakeBody[i][1]) {
            placeFood();
            return;
        }
    }
    if (foodX == snakeX && foodY == snakeY) {
        placeFood();
    }
}