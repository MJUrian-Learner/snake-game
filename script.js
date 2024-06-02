const boardContainer = document.querySelector(".board-container");
let snake = [];
let direction;
let directionName;
let directionLock = false;
const boardWidth = 25; // Assuming the board width is 25 boxes
let gameStart = false;
let gameOver = false;
let boxes = []; // Initialize boxes as an empty array
let rockInterval;
let gameInterval;
let wall = false;
let score = 0;

const generateBoxes = (numBoxes) => {
    for (let i = 0; i < numBoxes; i++) {
        const box = document.createElement("div");
        box.classList.add("box");
        boardContainer.appendChild(box);
    }
    // Update boxes after generating them
    boxes = document.querySelectorAll(".box");
};

const generateFood = () => {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * boxes.length);

    // Ensures that food will not be generated on the snake
    if (snake.includes(randomIndex)) {
        generateFood();
        return;
    }

    // Create a new div for the food
    const food = document.createElement("div");
    food.classList.add("food");

    // Remove any existing food from the game board
    const existingFood = document.querySelector(".food");
    if (existingFood) {
        existingFood.parentElement.removeChild(existingFood);
    }

    // Add the food to the random box
    boxes[randomIndex].appendChild(food);
};

const generateRock = () => {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * boxes.length);

    // Ensures that rock will not be generated on the snake
    if (snake.includes(randomIndex)) {
        generateRock();
        return;
    }

    const existingRocks = document.querySelectorAll(".rock");
    if (existingRocks.length >= 5) {
        for (let existingRock of existingRocks) {
            existingRock.parentElement.removeChild(existingRock);
        }
    }

    // Create a new div for the rock
    const rock = document.createElement("div");
    rock.classList.add("rock");

    // Add the rock to the random box
    boxes[randomIndex].appendChild(rock);
};

const updateSnake = () => {
    // Remove the snake class from all boxes
    boxes.forEach((box) => {
        const snakeBody = box.querySelector(".snake");
        if (snakeBody) {
            box.removeChild(snakeBody);
        }
    });

    // Add a new snake div to the boxes in the snake array
    snake.forEach((element, index) => {
        const snakeBody = document.createElement("div");
        snakeBody.classList.add("snake");

        if (index === 0) {
            snakeBody.classList.add("snake-head");
            snakeBody.classList.add(`head-${directionName}`);
        }

        boxes[element].appendChild(snakeBody);
    });
};

const startGame = () => {
    console.log("Game started");
    snake = [2, 1, 0]; // Snake starting position
    direction = 1;
    directionName = "right";
    score = 0;
    document.getElementById("score").innerText = score;

    const rocks = document.querySelectorAll(".rock");
    for (let rock of rocks) {
        rock.parentElement.removeChild(rock);
    }

    const foods = document.querySelectorAll(".food");
    for (let food of foods) {
        food.parentElement.removeChild(food);
    }

    generateFood();
    updateSnake();
    gameStart = true;
    gameOver = false;

    // Clear any existing intervals before setting new ones
    clearInterval(gameInterval);
    clearInterval(rockInterval);

    gameInterval = setInterval(runGame, 70);

    // Wait for 5 seconds before starting to generate rocks
    rockInterval = setTimeout(() => {
        rockInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                generateRock();
            }
        }, 7000);
    }, 5000);

    startButton.disabled = true;
    wallButton.disabled = true;
};

const stopGame = () => {
    clearInterval(gameInterval);
    clearInterval(rockInterval);
    alert("Game Over! The snake has collided with itself.");
    gameOver = true;

    startButton.disabled = false;
    wallButton.disabled = false;
};

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", function () {
    startGame();
});

const wallButton = document.getElementById("wall-button");
wallButton.addEventListener("click", () => {
    wall = !wall;
    if (wall) {
        document.getElementById("wall-button").innerText = "Turn off wall";
    } else {
        document.getElementById("wall-button").innerText = "Turn on wall";
    }
});

// Listen for keydown events
window.addEventListener("keydown", (e) => {
    if (directionLock || gameOver || !gameStart) return;

    // Update direction and directionName based on the key pressed
    if (e.key === "ArrowUp" && direction !== boardWidth) {
        direction = -boardWidth; // Up
        directionName = "up";
    } else if (e.key === "ArrowDown" && direction !== -boardWidth) {
        direction = boardWidth; // Down
        directionName = "down";
    } else if (e.key === "ArrowLeft" && direction !== 1) {
        direction = -1; // Left
        directionName = "left";
    } else if (e.key === "ArrowRight" && direction !== -1) {
        direction = 1; // Right
        directionName = "right";
    } else if (e.key === "r") {
        stopGame();
        startGame();
    }

    directionLock = true;
});

// Initialize the game board and snake
generateBoxes(boardWidth * boardWidth);

const runGame = () => {
    if (gameOver) return;

    // Calculate the new head position
    let newHead = snake[0] + direction;

    // Handle edge wrapping
    if (!wall) {
        if (newHead < 0) {
            newHead = newHead + boardWidth * boardWidth;
        } else if (newHead >= boardWidth * boardWidth) {
            newHead = newHead - boardWidth * boardWidth;
        } else if (
            direction === 1 &&
            snake[0] % boardWidth === boardWidth - 1
        ) {
            newHead = newHead - boardWidth;
        } else if (direction === -1 && snake[0] % boardWidth === 0) {
            newHead = newHead + boardWidth;
        }
    } else {
        // If the snake touches the wall, end the game
        if (
            newHead < 0 ||
            newHead >= boardWidth * boardWidth ||
            (direction === 1 && snake[0] % boardWidth === boardWidth - 1) ||
            (direction === -1 && snake[0] % boardWidth === 0)
        ) {
            stopGame();
            return;
        }
    }
    if (snake.includes(newHead)) {
        stopGame();
        return;
    }

    // Check if the new head is in the same position as the food
    if (boxes[newHead].querySelector(".food")) {
        score++;
        document.getElementById("score").innerText = score;
        generateFood();
        snake.unshift(newHead);
    } else if (boxes[newHead].querySelector(".rock")) {
        stopGame();
        return;
    } else {
        snake.pop();
        snake.unshift(newHead);
    }

    // Update the snake on the board
    updateSnake();

    // Unlock the direction change
    directionLock = false;
};
