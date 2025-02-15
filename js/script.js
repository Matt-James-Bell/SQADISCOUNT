// Global variables
let discount = 0.01;
const discountRate = 0.2;
let gameInterval;
let gameActive = false;
let crashed = false;
let crashPoint;
let startTime;
let accumulatedDiscount = 0;
let playerJoined = false;
let countdownInterval;
let firstRun = true; // First run: 10 sec; subsequent: 5 sec

// Volume control elements
const bgVolumeSlider = document.getElementById("bg-volume");
const explosionVolumeSlider = document.getElementById("explosion-volume");
const rocketVolumeSlider = document.getElementById("rocket-volume");

// --- Updated Tick Marker Functions using offset properties ---
function updateBottomScale() {
  const bottomScale = document.getElementById("bottom-scale");
  bottomScale.innerHTML = "";
  const containerWidth = document.getElementById("rocket-container").offsetWidth;
  let windowMin, windowMax;
  if (discount < 1.0) {
    windowMin = 0.01;
    windowMax = 2.00;
  } else {
    windowMin = discount * 0.8;
    windowMax = discount * 1.2;
  }
  const tickCount = 6;
  for (let i = 0; i <= tickCount; i++) {
    let value = windowMin + ((windowMax - windowMin) / tickCount) * i;
    let normalizedTick = (value - windowMin) / (windowMax - windowMin);
    let leftPos = normalizedTick * containerWidth;
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = leftPos + "px";
    bottomScale.appendChild(tick);
    const label = document.createElement("div");
    label.className = "tick-label";
    label.textContent = value.toFixed(2) + "%";
    label.style.left = (leftPos - 10) + "px";
    bottomScale.appendChild(label);
  }
  // Use offsetLeft for a more reliable measurement
  const rocketWrapper = document.getElementById("rocket-wrapper");
  const rocketCenterX = rocketWrapper.offsetLeft + rocketWrapper.offsetWidth / 2;
  const marker = document.createElement("div");
  marker.className = "tick-marker";
  marker.style.left = rocketCenterX + "px";
  bottomScale.appendChild(marker);
}

function updateVerticalTicker() {
  const verticalTicker = document.getElementById("vertical-ticker");
  verticalTicker.innerHTML = "";
  const container = document.getElementById("rocket-container");
  const containerHeight = container.offsetHeight;
  let windowMin, windowMax;
  if (discount < 1.0) {
    windowMin = 0.01;
    windowMax = 2.00;
  } else {
    windowMin = discount * 0.8;
    windowMax = discount * 1.2;
  }
  const tickCount = 6;
  for (let i = 0; i <= tickCount; i++) {
    let value = windowMin + ((windowMax - windowMin) / tickCount) * i;
    let normalizedTick = (value - windowMin) / (windowMax - windowMin);
    let topPos = (1 - normalizedTick) * containerHeight;
    const tick = document.createElement("div");
    tick.className = "v-tick";
    tick.style.top = topPos + "px";
    verticalTicker.appendChild(tick);
    const label = document.createElement("div");
    label.className = "v-tick-label";
    label.textContent = value.toFixed(2) + "%";
    label.style.top = (topPos - 5) + "px";
    verticalTicker.appendChild(label);
  }
  const rocketWrapper = document.getElementById("rocket-wrapper");
  const rocketCenterY = rocketWrapper.offsetTop + rocketWrapper.offsetHeight / 2;
  const marker = document.createElement("div");
  marker.className = "v-tick-marker";
  marker.style.top = rocketCenterY + "px";
  verticalTicker.appendChild(marker);
}

// --- Updated Flying Object Spawn (one at a time, above the rocket) ---
function spawnNextFlyingObject() {
  if (!gameActive) return;
  const container = document.getElementById("rocket-container");
  const rocketWrapper = document.getElementById("rocket-wrapper");
  // Get rocket's top (using offsetTop relative to container)
  const rocketTop = rocketWrapper.offsetTop;
  // Determine maximum allowed top for flying object (ensure it's above the rocket)
  const maxTop = Math.max(rocketTop - 70, 0); // subtract object height (approx 70px)
  const randomTop = Math.random() * maxTop;
  
  const flyingImages = ["alien1.png", "alien2.png", "ufo1.png", "ufo2.png", "astro1.png", "saturn1.png", "earth1.png"];
  const imageFile = flyingImages[Math.floor(Math.random() * flyingImages.length)];
  const flyingElem = document.createElement("img");
  flyingElem.src = "img/" + imageFile;
  flyingElem.className = "flying-object";
  flyingElem.style.top = randomTop + "px";
  
  container.appendChild(flyingElem);
  
  // When animation ends, remove the object and spawn the next one (if game is active)
  flyingElem.addEventListener("animationend", () => {
    flyingElem.remove();
    if (gameActive) {
      spawnNextFlyingObject();
    }
  });
}

// --- Game Control Functions ---
function updateRocketPosition() {
  const container = document.getElementById("rocket-container");
  const rocketWrapper = document.getElementById("rocket-wrapper");
  const containerHeight = container.offsetHeight;
  const containerWidth = container.offsetWidth;
  const wrapperWidth = rocketWrapper.offsetWidth;
  const wrapperHeight = rocketWrapper.offsetHeight;
  let centerX = (containerWidth - wrapperWidth) / 2;
  let centerY = (containerHeight - wrapperHeight) / 2;
  
  if (discount < 1.0) {
    let t = (discount - 0.01) / (1 - 0.01);
    let newLeft = (1 - t) * 0 + t * centerX;
    let newBottom = (1 - t) * 0 + t * centerY;
    rocketWrapper.style.left = newLeft + "px";
    rocketWrapper.style.bottom = newBottom + "px";
  } else {
    rocketWrapper.style.left = centerX + "px";
    rocketWrapper.style.bottom = centerY + "px";
  }
}

function updateDisplay() {
  document.getElementById("ship-discount").textContent = discount.toFixed(2) + "% Discount";
  document.getElementById("current-discount").textContent = "Current: " + discount.toFixed(2) + "%";
}

function updateGame() {
  if (!gameActive) return;
  let elapsed = (Date.now() - startTime) / 1000;
  discount = 0.01 + elapsed * discountRate;
  if (discount > 100) discount = 100;
  
  updateDisplay();
  updateRocketPosition();
  updateBottomScale();
  updateVerticalTicker();
  
  if (discount >= crashPoint) {
    crash();
  }
}

function startGame() {
  discount = 0.01;
  crashed = false;
  gameActive = true;
  startTime = Date.now();
  updateDisplay();
  document.getElementById("status").textContent = "Run in progress... Hit Cash Out to lock in your discount!";
  document.getElementById("ignite").disabled = true;
  document.getElementById("rocket-wrapper").style.display = "block";
  document.getElementById("explosion").style.display = "none";
  
  // Set volumes from sliders
  const bgMusic = document.getElementById("bg-music");
  const explosionSound = document.getElementById("explosion-sound");
  const rocketSound = document.getElementById("rocket-sound");
  bgMusic.volume = parseFloat(bgVolumeSlider.value);
  explosionSound.volume = parseFloat(explosionVolumeSlider.value);
  rocketSound.volume = parseFloat(rocketVolumeSlider.value);
  
  // Start playing background music and rocket flight sound
  bgMusic.play();
  rocketSound.play();
  
  updateRocketPosition();
  updateBottomScale();
  updateVerticalTicker();
  
  let r = Math.random();
  if (r < 0.1) {
    crashPoint = Math.random() * (0.05 - 0.01) + 0.01;
  } else if (r < 0.9) {
    crashPoint = Math.random() * (3.00 - 1.00) + 1.00;
  } else {
    crashPoint = Math.random() * (100.00 - 3.00) + 3.00;
  }
  console.log("Crash point set at: " + crashPoint.toFixed(2) + "%");
  
  gameInterval = setInterval(updateGame, 50);
  
  // Start the chain of flying objects (one at a time)
  spawnNextFlyingObject();
}

function crash() {
  gameActive = false;
  crashed = true;
  clearInterval(gameInterval);
  
  // Stop rocket flight sound and play explosion sound
  const rocketSound = document.getElementById("rocket-sound");
  rocketSound.pause();
  rocketSound.currentTime = 0;
  document.getElementById("explosion-sound").play();
  
  if (playerJoined) {
    accumulatedDiscount = 0;
    updateAccumulatedDiscount();
  }
  document.getElementById("rocket-wrapper").style.display = "none";
  const explosionElem = document.getElementById("explosion");
  explosionElem.style.left = document.getElementById("rocket-wrapper").style.left;
  explosionElem.style.bottom = document.getElementById("rocket-wrapper").style.bottom;
  explosionElem.style.display = "block";
  explosionElem.classList.add("explode");
  document.getElementById("status").textContent = "Run crashed!";
  document.getElementById("cashout").disabled = true;
  document.getElementById("ignite").disabled = true;
  setTimeout(startCountdown, 2000);
}

function cashOut() {
  if (!gameActive || crashed || !playerJoined) return;
  gameActive = false;
  clearInterval(gameInterval);
  
  // Play cashout sound
  document.getElementById("cashout-sound").play();
  
  // Stop rocket flight sound
  const rocketSound = document.getElementById("rocket-sound");
  rocketSound.pause();
  rocketSound.currentTime = 0;
  
  updateDisplay();
  document.getElementById("status").textContent = "Cashed out at " + discount.toFixed(2) + "% discount!";
  document.getElementById("cashout").disabled = true;
  document.getElementById("ignite").disabled = true;
  accumulatedDiscount += discount;
  updateAccumulatedDiscount();
  document.getElementById("ship-discount").style.color = "#fff";
  document.getElementById("status").textContent += " Congratulations!";
  setTimeout(startCountdown, 2000);
}

function updateAccumulatedDiscount() {
  document.getElementById("discount-display").textContent = "Total Discount: " + accumulatedDiscount.toFixed(2) + "%";
}

function startCountdown() {
  // Start playing background music as soon as countdown begins
  document.getElementById("bg-music").play();
  
  playerJoined = false;
  const countdownDiv = document.getElementById("countdown");
  let duration = firstRun ? 10 : 5;
  countdownDiv.style.display = "block";
  countdownDiv.textContent = duration;
  document.getElementById("ignite").disabled = false;
  countdownInterval = setInterval(() => {
    duration--;
    if (duration > 0) {
      countdownDiv.textContent = duration;
    } else {
      clearInterval(countdownInterval);
      countdownDiv.style.display = "none";
      if (!gameActive) {
        playerJoined = false;
        document.getElementById("ignite").disabled = true;
        document.getElementById("cashout").disabled = true;
        startRun();
      }
    }
  }, 1000);
  firstRun = false;
}

function startRun() {
  document.getElementById("ignite").disabled = true;
  startGame();
}

window.addEventListener("load", startCountdown);

document.getElementById("ignite").addEventListener("click", () => {
  clearInterval(countdownInterval);
  document.getElementById("countdown").style.display = "none";
  playerJoined = true;
  startRun();
});
document.getElementById("cashout").addEventListener("click", cashOut);
