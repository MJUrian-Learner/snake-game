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
let isRocks = false;
let score = 0;
let foodIndex;
let rockTimeout;

// Initialize colors
let snakeHeadColor = "#ff0000";
let snakeBodyColor = "#00ff00";

// Listen for color picker changes
document.getElementById("snake-head-color").addEventListener("input", (e) => {
    snakeHeadColor = e.target.value;
    updateSnakeColors();
});

document.getElementById("snake-body-color").addEventListener("input", (e) => {
    snakeBodyColor = e.target.value;
    updateSnakeColors();
});

// Update snake colors dynamically
const updateSnakeColors = () => {
    document.querySelectorAll(".snake-head").forEach((head) => {
        head.style.backgroundColor = snakeHeadColor;
    });
    document.querySelectorAll(".snake").forEach((body) => {
        if (!body.classList.contains("snake-head")) {
            body.style.backgroundColor = snakeBodyColor;
        }
    });
};

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
    foodIndex = randomIndex;
};

const generateRock = () => {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * boxes.length);

    // Ensures that rock will not be generated on the snake
    if (snake.includes(randomIndex) || foodIndex === randomIndex) {
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

const makeSnake = () => {
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
            snakeBody.style.backgroundColor = snakeHeadColor; // Apply head color
        } else {
            snakeBody.style.backgroundColor = snakeBodyColor; // Apply body color
        }

        boxes[element].appendChild(snakeBody);
    });
};

const startGame = () => {
    console.log("Game started");
    console.log(isRocks);
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
    makeSnake();
    gameStart = true;
    gameOver = false;

    gameInterval = setInterval(runGame, 70);

    // Wait for 5 seconds before starting to generate rocks
    if (isRocks) {
        rockTimeout = setTimeout(() => {
            rockInterval = setInterval(() => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(function () {
                        generateRock();
                    }, i * 200);
                }
            }, 3000);
        }, 2000);
    }

    startButton.disabled = true;
    wallButton.disabled = true;
    rockButton.disabled = true;
};

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
            stopGame("wall");
            return;
        }
    }
    if (snake.includes(newHead)) {
        stopGame("eaten");
        return;
    }

    // Check if the new head is in the same position as the food
    if (boxes[newHead].querySelector(".food")) {
        score++;
        document.getElementById("score").innerText = score;
        generateFood();
        snake.unshift(newHead);
    } else if (boxes[newHead].querySelector(".rock")) {
        stopGame("rock");
        return;
    } else {
        snake.pop();
        snake.unshift(newHead);
    }

    // Update the snake on the board
    makeSnake();

    // Unlock the direction change
    directionLock = false;
};

const stopGame = (status) => {
    clearTimeout(rockTimeout);
    clearInterval(gameInterval);
    clearInterval(rockInterval);
    switch (status) {
        case "eaten":
            Swal.fire("You ate yourself! Game over!", "", "error");
            break;
        case "wall":
            Swal.fire("You hit the wall! Game over!", "", "error");
            break;
        case "rock":
            Swal.fire("You hit the rock! Game over!", "", "error");
            break;
        case "restart":
            Swal.fire("Game ended!", "", "info");
            break;
    }
    gameOver = true;

    startButton.disabled = false;
    wallButton.disabled = false;
    rockButton.disabled = false;
};

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", function () {
    startGame();
});

const wallButton = document.getElementById("wall-button");
wallButton.addEventListener("click", () => {
    wall = !wall;
    if (wall) {
        document.getElementById("board").classList.add("wall");
        document.getElementById("wall-button").classList.add("active-btn");
    } else {
        document.getElementById("board").classList.remove("wall");
        document.getElementById("wall-button").classList.remove("active-btn");
    }
});

const rockButton = document.getElementById("rock-button");
rockButton.addEventListener("click", () => {
    isRocks = !isRocks;
    if (isRocks) {
        document.getElementById("rock-button").classList.add("active-btn");
    } else {
        document.getElementById("rock-button").classList.remove("active-btn");
    }
});

// Listen for keydown events
window.addEventListener("keydown", (e) => {
    if (directionLock || gameOver || !gameStart) return;

    // Update direction and directionName based on the key pressed
    if ((e.key === "ArrowUp" || e.key === "w") && direction !== boardWidth) {
        direction = -boardWidth; // Up
        directionName = "up";
    } else if (
        (e.key === "ArrowDown" || e.key === "s") &&
        direction !== -boardWidth
    ) {
        direction = boardWidth; // Down
        directionName = "down";
    } else if ((e.key === "ArrowLeft" || e.key === "a") && direction !== 1) {
        direction = -1; // Left
        directionName = "left";
    } else if ((e.key === "ArrowRight" || e.key === "d") && direction !== -1) {
        direction = 1; // Right
        directionName = "right";
    } else if (e.key === "r") {
        stopGame("restart");
    }

    directionLock = true;
});

// Initialize the game board and snake
generateBoxes(boardWidth * boardWidth);

function showTab(tabId) {
    const contents = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    contents.forEach((content) => {
        content.classList.remove("active");
    });

    buttons.forEach((button) => {
        button.classList.remove("active-btn");
    });

    document.getElementById(tabId).classList.add("active");
    document
        .querySelector(`[onclick="showTab('${tabId}')"]`)
        .classList.add("active-btn");
}
