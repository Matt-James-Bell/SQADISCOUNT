// The dynamic discount starts at 0.01%
let discount = 0.01;
const discountRate = 0.2;
let gameInterval;
let gameActive = false;
let crashed = false;
let crashPoint;
let startTime;

function startGame() {
    discount = 0.01;
    crashed = false;
    gameActive = true;
    startTime = Date.now();
    document.getElementById("status").textContent = "Run in progress...";
    document.getElementById("ignite").disabled = true;
    document.getElementById("cashout").disabled = false;

    let r = Math.random();
    crashPoint = r < 0.9 ? Math.random() * (3.00 - 1.00) + 1.00 : Math.random() * (100.00 - 3.00) + 3.00;

    gameInterval = setInterval(updateGame, 50);
}

function updateGame() {
    if (!gameActive) return;
    let elapsed = (Date.now() - startTime) / 1000;
    discount = 0.01 + elapsed * discountRate;
    if (discount >= crashPoint) crash();
    document.getElementById("ship-discount").textContent = discount.toFixed(2) + "% Discount";
}

function crash() {
    gameActive = false;
    crashed = true;
    clearInterval(gameInterval);
    document.getElementById("status").textContent = "Run crashed!";
}

function cashOut() {
    if (!gameActive || crashed) return;
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById("status").textContent = "Cashed out at " + discount.toFixed(2) + "% discount!";
}

document.getElementById("ignite").addEventListener("click", startGame);
document.getElementById("cashout").addEventListener("click", cashOut);
