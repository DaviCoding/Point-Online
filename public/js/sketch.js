const canvas = document.getElementById("gameCanvas");
document.querySelector("#loadingSocket").style.display = "none";
const ctx = canvas.getContext("2d");

const socket = io();

const roomId = window.location.pathname.substring(1);

let config = {
  speed: 1.5,
  mapWidth: 2000,
  mapHeight: 2000,
};

let lastTime = 0;
let fps = 0;

const cubeSize = 100;
const borderRadius = 10;

const playerSize = 20;

let playerX = config.mapWidth / 2;
let playerY = config.mapHeight / 2;
let angle = 0;
let life = 100;
let name = "Anonymous";

let cameraX = 0;
let cameraY = 0;

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let bullets = [];
const weapons = [
  {
    name: "Pistol",
    damage: 10,
    range: 2000,
    speed: 80,
    cooldown: 30,
    weaponLoader: 16,
  },
  {
    name: "Rifle",
    damage: 20,
    range: 1000,
    speed: 100,
    cooldown: 20,
    weaponLoader: 32,
  },
  {
    name: "Shotgun",
    damage: 15,
    range: 300,
    speed: 60,
    cooldown: 50,
    weaponLoader: 2,
  },
];

let selectedWeapon = weapons[0];

const objects = [
  {
    x: 300,
    y: 300,
    width: 100,
    height: 100,
    collides: true,
    shape: "rectangle",
  },
  {
    x: 800,
    y: 300,
    width: 100,
    height: 100,
    collides: true,
    shape: "rectangle",
  },
];
const chat = document.querySelector("#chat");

const players = {};

const textures = {
  background: new Image(),
  cube: new Image(),
};

textures.background.src = "/assets/box.jpg";
textures.cube.src = "/assets/box.jpg";

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cameraX = playerX - canvas.width / 2;
  cameraY = playerY - canvas.height / 2;
}

function updateLife() {
  let progressLife = document.querySelector(".progress");
  progressLife.style.width = `${life}%`;
  progressLife.querySelector("span").textContent = `${life}%`;
}

function drawBackground() {
  ctx.fillStyle = "#070212";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
  ctx.lineTo(x + radius, y + height);
  ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
  ctx.lineTo(x, y + radius);
  ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCircle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawMap() {
  ctx.fillStyle = "#0f0821";
  ctx.fillRect(-cameraX, -cameraY, config.mapWidth, config.mapHeight);

  ctx.strokeStyle = "#1e1040";
  for (let x = 0; x < config.mapWidth; x += cubeSize) {
    for (let y = 0; y < config.mapHeight; y += cubeSize) {
      if (
        x - cameraX < canvas.width &&
        y - cameraY < canvas.height &&
        x - cameraX > -cubeSize &&
        y - cameraY > -cubeSize
      ) {
        drawRoundedRect(
          x - cameraX,
          y - cameraY,
          cubeSize,
          cubeSize,
          borderRadius
        );
      }
    }
  }

  for (const obj of objects) {
    if (
      obj.x - cameraX < canvas.width &&
      obj.y - cameraY < canvas.height &&
      obj.x + obj.width - cameraX > 0 &&
      obj.y + obj.height - cameraY > 0
    ) {
      if (obj.shape === "rectangle") {
        ctx.drawImage(
          textures.background,
          obj.x - cameraX,
          obj.y - cameraY,
          obj.width,
          obj.height
        );
        ctx.strokeStyle = "black";
        ctx.strokeRect(obj.x - cameraX, obj.y - cameraY, obj.width, obj.height);
      }
    }
  }
}

function drawPlayer() {
  let x = canvas.width / 2;
  let y = canvas.height / 2;

  ctx.fillStyle = "#a87732";
  const triangleX = x + playerSize * Math.cos(angle);
  const triangleY = y + playerSize * Math.sin(angle);
  const triangleSize = playerSize;

  const p1X = triangleX + triangleSize * Math.cos(angle);
  const p1Y = triangleY + triangleSize * Math.sin(angle);
  const p2X = triangleX + triangleSize * Math.cos(angle + (2 * Math.PI) / 3);
  const p2Y = triangleY + triangleSize * Math.sin(angle + (2 * Math.PI) / 3);
  const p3X = triangleX + triangleSize * Math.cos(angle + (4 * Math.PI) / 3);
  const p3Y = triangleY + triangleSize * Math.sin(angle + (4 * Math.PI) / 3);

  ctx.beginPath();
  ctx.arc(x, y, playerSize, 0, 2 * Math.PI, false);
  ctx.moveTo(p1X, p1Y);
  ctx.lineTo(p2X, p2Y);
  ctx.lineTo(p3X, p3Y);
  ctx.closePath();
  ctx.fill();
}

canvas.addEventListener("mousemove", (event) => {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;
  angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
});

function drawOtherPlayers() {
  for (let id in players) {
    if (id !== socket.id) {
      const player = players[id];

      const adjustedX = player.x - cameraX;
      const adjustedY = player.y - cameraY;
      ctx.fillStyle = "red";
      const triangleX = adjustedX + playerSize * Math.cos(player.angle);
      const triangleY = adjustedY + playerSize * Math.sin(player.angle);
      const triangleSize = playerSize;

      const p1X = triangleX + triangleSize * Math.cos(player.angle);
      const p1Y = triangleY + triangleSize * Math.sin(player.angle);
      const p2X =
        triangleX + triangleSize * Math.cos(player.angle + (2 * Math.PI) / 3);
      const p2Y =
        triangleY + triangleSize * Math.sin(player.angle + (2 * Math.PI) / 3);
      const p3X =
        triangleX + triangleSize * Math.cos(player.angle + (4 * Math.PI) / 3);
      const p3Y =
        triangleY + triangleSize * Math.sin(player.angle + (4 * Math.PI) / 3);

      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, playerSize, 0, 2 * Math.PI, false);
      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.lineTo(p3X, p3Y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawCoordinates() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`FPS: ${fps}`, 10, 40);
}

function movePlayer() {
  let moveX = 0;
  let moveY = 0;

  if (keys.up) moveY -= config.speed;
  if (keys.down) moveY += config.speed;
  if (keys.left) moveX -= config.speed;
  if (keys.right) moveX += config.speed;

  playerX = Math.max(
    0,
    Math.min(config.mapWidth - playerSize, playerX + moveX)
  );
  playerY = Math.max(
    0,
    Math.min(config.mapHeight - playerSize, playerY + moveY)
  );

  socket.emit("playerMove", { x: playerX, y: playerY, angle: angle });
}

let currentWeapon = weapons[0];
var lastCooldown = 0;
function shootBullet() {
  if (lastCooldown == 0) {
    socket.emit("updateOtherBullet", {
      angle: angle,
      selectedWeapon: selectedWeapon,
    });
    lastCooldown = selectedWeapon.cooldown;
  }
}

function drawCooldown() {
  ctx.fillStyle = "#a3a3a3";
  ctx.fillRect(
    canvas.width / 2 + playerSize * 7,
    canvas.height / 2 - playerSize,
    6,
    60
  );

  ctx.fillStyle = "#636363";
  ctx.fillRect(
    canvas.width / 2 + playerSize * 7,
    canvas.height / 2 - playerSize,
    6,
    Math.max(0, Math.min(60, lastCooldown * 2))
  );
}

function checkBulletCollision(bullet, obj) {
  const bulletRadius = 5;
  if (obj.shape === "rectangle") {
    return (
      bullet.x + bulletRadius > obj.x &&
      bullet.x - bulletRadius < obj.x + obj.width &&
      bullet.y + bulletRadius > obj.y &&
      bullet.y - bulletRadius < obj.y + obj.height
    );
  } else if (obj.shape === "circle") {
    const distX = bullet.x - obj.x;
    const distY = bullet.y - obj.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance < bulletRadius + obj.radius;
  }
  return false;
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.x += bullet.speed * Math.cos(bullet.angle);
    bullet.y += bullet.speed * Math.sin(bullet.angle);

    if (
      bullet.x < 0 ||
      bullet.x > config.mapWidth ||
      bullet.y < 0 ||
      bullet.y > config.mapHeight
    ) {
      bullets.splice(i, 1);
      continue;
    }

    const distX = bullet.x - playerX;
    const distY = bullet.y - playerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < playerSize + 30) {
      socket.emit("removeBullet", { bullet, life, name });
      life -= bullet.damage;
      if (life <= 0) {
      }
      bullets.splice(i, 1);
      break;
    }

    for (let j = 0; j < objects.length; j++) {
      const obj = objects[j];
      if (checkBulletCollision(bullet, obj)) {
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function drawBullets() {
  ctx.fillStyle = "yellow";
  for (const bullet of bullets) {
    const adjustedX = bullet.x - cameraX;
    const adjustedY = bullet.y - cameraY;

    ctx.beginPath();
    ctx.arc(adjustedX, adjustedY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function collisionObject() {
  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i];

    let radius = playerSize + 1.1;

    let closestX = Math.max(obj.x, Math.min(playerX, obj.x + obj.width));
    let closestY = Math.max(obj.y, Math.min(playerY, obj.y + obj.height));

    let distanceX = playerX - closestX;
    let distanceY = playerY - closestY;

    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance <= radius) {
      let angle = Math.atan2(distanceY, distanceX);
      playerX += Math.cos(angle) * (radius - distance);
      playerY += Math.sin(angle) * (radius - distance);
    }
  }
}

function gameLoop(timestamp) {
  if (lastCooldown > 0) {
    lastCooldown--;
  }
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  fps = Math.round(1000 / deltaTime);

  drawBackground();
  movePlayer();
  cameraX = playerX - canvas.width / 2;
  cameraY = playerY - canvas.height / 2;
  drawMap();
  drawPlayer();
  drawOtherPlayers();
  updateBullets();
  drawBullets();
  drawCooldown();
  drawCoordinates();
  collisionObject();
  updateLife();

  if (life <= 0) {
    playerX = 1000;
    playerY = 1000;
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", function (e) {
  if (e.key === "w") keys.up = true;
  if (e.key === "s") keys.down = true;
  if (e.key === "a") keys.left = true;
  if (e.key === "d") keys.right = true;
  if (e.key === "1") selectedWeapon = weapons[0];
  if (e.key === "2") selectedWeapon = weapons[1];
  if (e.key === "3") selectedWeapon = weapons[2];
  if (e.key === " ") shootBullet();
});

window.addEventListener("keyup", function (e) {
  if (e.key === "w") keys.up = false;
  if (e.key === "s") keys.down = false;
  if (e.key === "a") keys.left = false;
  if (e.key === "d") keys.right = false;
});

socket.on("updatePlayers", (data) => {
  Object.assign(players, data);
});

socket.on("updatePlayerPosition", (data) => {
  if (players[data.id]) {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
    players[data.id].angle = data.angle;
  }
});

socket.on("updateOtherBullet", async (data) => {
  await bullets.push({
    x: data.player.x,
    y: data.player.y,
    angle: data.data.angle,
    speed: data.data.selectedWeapon.speed,
    range: data.data.selectedWeapon.range,
    damage: data.data.selectedWeapon.damage,
  });
});
socket.on("removeBullet", (data) => {
  bullets.splice(data.bullet, 1);
  if (data.life <= 10) {
    playerX = 1000;
    playerY = 1000;
    life = 100;
    const li = document.createElement("li");
    li.textContent = `${data.name} morreu.`;
    li.classList = "text-white px-5 py-2 m-2 bg-red-500 rounded-2xl";
    chat.querySelector("ul").appendChild(li);
  }
});

socket.on("playerDisconnected", (id) => {
  delete players[id];
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gameLoop(0);
