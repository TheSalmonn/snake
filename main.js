const layer0 = document.getElementById("layer0");
const ctx0 = layer0.getContext("2d");

const layer1 = document.getElementById("layer1");
const ctx1 = layer1.getContext("2d");

const layer2 = document.getElementById("layer2");
const ctx2 = layer2.getContext("2d");

const layer3 = document.getElementById("layer3");
const ctx3 = layer3.getContext("2d");

var outlineWidth = getComputedStyle(layer0).getPropertyValue('outline-width').replace("px", "");

var canvasWidth = 800;
var canvasHeight = 600;

var framesElapsed = 0;
var inputFrame = 0;

const cellSize = 20;
const states = {
    alive: "alive",
    dead: "dead",
    unravel: "unravel",
    explode: "explode"
}
var state = states.alive;

var warpWalls = true;

var snakeLength = 3;
var finalScore = 0;

var movementDelay = 5; // Default: 5, Min: 2

class SnakeSegment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
var snakeSegmentPositions = [];
var snakeHeadPosition = {
    x: Math.floor(canvasWidth / cellSize / 2),
    y: Math.floor(canvasHeight / cellSize / 2)
}
var previousSnakeHeadPosition = {
    x: snakeHeadPosition.x,
    y: snakeHeadPosition.y
}

var movementVector = {
    x: 1,
    y: 0
};
var nextDirection = null;

var fruitX;
var fruitY;

window.addEventListener("keydown", function(e) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    if (["w", "a", "s", "d"].includes(e.key)) {
        nextDirection = e.key;
    }
});

function Start() {
    layer0.width = layer1.width = layer2.width = layer3.width = canvasWidth;
    layer0.height = layer1.height = layer2.height = layer3.height = canvasHeight;

    if (warpWalls) {
        layer0.style.outlineColor = "cyan";
    } else {
        layer0.style.outlineColor = "gray";
    }

    DrawGrid();
    SpawnFruit();
    Update();
}

function Update() {
    setInterval(() => {
        CheckCollision();
        MoveSnake();
        DrawSnake();
        
        if (state == states.unravel) {
            if (framesElapsed % 3 == 0) { // Every 3 frames
                if (finalScore < snakeLength) {
                    finalScore++;
                    DrawFinalScore();
                }
                snakeSegmentPositions.pop();
            }
            if (snakeSegmentPositions.length < 1 && state != states.explode) {
                setTimeout(() => {
                    state = states.explode;
                }, 1000);
            }
        }
        framesElapsed++;
    }, 1000 / 60);
}

function DrawGrid() {
    ctx0.strokeStyle = "rgb(40, 40, 40)";
    ctx0.lineWidth = 1;
    for (let y = 0; y < canvasHeight/cellSize; y++) {
        ctx0.moveTo(0, y * cellSize);
        ctx0.lineTo(canvasWidth, y * cellSize);
        ctx0.stroke();
    }
    for (let x = 0; x < canvasWidth/cellSize; x++) {
        ctx0.moveTo(x * cellSize, 0);
        ctx0.lineTo(x * cellSize, canvasHeight);
        ctx0.stroke();
    }
}

function CheckCollision() {
    Warp();
    snakeSegmentPositions.forEach(segment => {
        if (snakeHeadPosition.x == segment.x && snakeHeadPosition.y == segment.y) {
            if (state == states.alive) {
                Die();
            }
        }
    });
    if (snakeHeadPosition.x == fruitX && snakeHeadPosition.y == fruitY) {
        if (state = states.alive) {
            snakeLength++;
            SpawnFruit();
        }
    }
}

function MoveSnake() {
    if (state == states.alive) {
        if (framesElapsed % movementDelay == 0) {
            ChangeDir(nextDirection);
            snakeHeadPosition = {
                x: snakeHeadPosition.x + movementVector.x,
                y: snakeHeadPosition.y + movementVector.y
            }
            snakeSegmentPositions.unshift(new SnakeSegment(previousSnakeHeadPosition.x, previousSnakeHeadPosition.y));
        }
    }
    
    previousSnakeHeadPosition = {
        x: snakeHeadPosition.x,
        y: snakeHeadPosition.y
    }

    if (snakeSegmentPositions.length > snakeLength) {
        snakeSegmentPositions.pop();
    }
}

function DrawSnake() {
    ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
    if (state != states.explode) {
        ctx2.fillStyle = "hsl(130, 100%, 50%)";
        ctx2.fillRect(snakeHeadPosition.x * cellSize + 1, snakeHeadPosition.y * cellSize + 1, cellSize - 2, cellSize - 2);
    }
    snakeSegmentPositions.forEach(segment => {
        ctx2.fillStyle = "hsl(130, 100%, 30%)";
        ctx2.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
}

function Warp() {
    if (warpWalls) {
        if (snakeHeadPosition.y >= canvasHeight / cellSize) {
            snakeHeadPosition.y = 0;
        }
        if (snakeHeadPosition.x < 0 / cellSize) {
            snakeHeadPosition.x = canvasWidth / cellSize - 1;
        }
        if (snakeHeadPosition.y < 0) {
            snakeHeadPosition.y = canvasHeight / cellSize - 1;
        }
        if (snakeHeadPosition.x >= canvasWidth / cellSize) {
            snakeHeadPosition.x = 0;
        }
    } else {
        if (state == states.alive) {
            if (snakeHeadPosition.y >= canvasHeight / cellSize) {
                Die();
            }
            if (snakeHeadPosition.x < 0 / cellSize) {
                Die();
            }
            if (snakeHeadPosition.y < 0) {
                Die();
            }
            if (snakeHeadPosition.x >= canvasWidth / cellSize) {
                Die();
            }
        }
    }
}

function ChangeDir(key) {
    if (key == "w") {
        if (movementVector.y != 1) {
            movementVector.x = 0;
            movementVector.y = -1;
        }
    }
    if (key == "a") {
        if (movementVector.x != 1) {
            movementVector.y = 0;
            movementVector.x = -1;
        }
    }
    if (key == "s") {
        if (movementVector.y != -1) {
            movementVector.x = 0;
            movementVector.y = 1;
        }
    }
    if (key == "d") {
        if (movementVector.x != -1) {
            movementVector.y = 0;
            movementVector.x = 1;
        }
    }
}

function Die() {
    state = states.dead;
    setTimeout(() => {
        state = states.unravel;
    }, 1000);
}

function SpawnFruit() {
    ctx1.clearRect(0, 0, canvasWidth, canvasHeight)
    fruitX = Math.floor(Math.random() * canvasWidth / cellSize);
    fruitY = Math.floor(Math.random() * canvasHeight / cellSize);
    if (CheckFruit(fruitX, fruitY) == "continue") {
        ctx1.fillStyle = "red";
        ctx1.fillRect(fruitX * cellSize + 1, fruitY * cellSize + 1, cellSize - 2, cellSize - 2);
    } else {
        SpawnFruit();
    }
}

function CheckFruit(x, y) {
    var quota = 0;
    snakeSegmentPositions.forEach(segment => {
        if ((segment.x == x || segment.x == snakeHeadPosition.x) && (segment.y == y || segment.y == snakeHeadPosition.y)) {
            return "retry";
        } else {
            quota++;
        }
    });
    if (quota >= snakeSegmentPositions.length) {
        return "continue";
    }
}

function DrawFinalScore() {
    ctx3.clearRect(0, 0, canvasWidth, canvasHeight);
    var text = finalScore.toString();
    ctx3.textBaseline = "middle";
    ctx3.textAlign = "center";

    ctx3.fillStyle = "yellow";
    ctx3.font = "200px Roboto, Arial";
    ctx3.fillText(text, canvasWidth/2, canvasHeight/2);
}

Start();
