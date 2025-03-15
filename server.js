const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require("path");

// Armazena informações dos jogadores
const players = {};

// Define objetos do mapa
const objects = [
  {
    x: 300,
    y: 300,
    width: 100,
    height: 100,
    collides: true,
    shape: "rectangle",
  },
  { x: 800, y: 600, width: 50, height: 50, collides: true, shape: "rectangle" },
];

io.on("connection", (socket) => {
  // Adiciona o jogador ao conectar
  players[socket.id] = {
    x: 1000, // Posição inicial no mapa
    y: 1000, // Posição inicial no mapa
    life: 100,
    id: socket.id,
  };

  // Notifica todos os jogadores sobre a nova conexão
  io.emit("updatePlayers", players);

  // Escuta a movimentação do jogador
  socket.on("playerMove", (data) => {
    const player = players[socket.id];
    if (player) {
      player.x = data.x;
      player.y = data.y;

      // Enviar a nova posição para todos os outros jogadores
      socket.broadcast.emit("updatePlayerPosition", {
        id: socket.id,
        x: data.x,
        y: data.y,
        angle: data.angle,
      });
    }
  });

  // Escuta eventos relacionados a balas
  socket.on("updateOtherBullet", (data) => {
    const player = players[socket.id];
    if (player) {
      io.emit("updateOtherBullet", { player: player, data: data });
    }
  });

  socket.on("removeBullet", (data) => {
    io.emit("removeBullet", data);
  });

  // Remove o jogador ao desconectar
  socket.on("disconnect", () => {
    console.log("Jogador desconectado:", socket.id);
    delete players[socket.id];

    // Notifica todos os jogadores sobre a desconexão
    io.emit("updatePlayers", players);
  });
});

// Serve arquivos estáticos
app.use(express.static("public"));

// View Engine
app.set("view engine", "ejs");

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ROUTES
const routes = require("./routes/routes.js");
app.use("/", routes);

// Inicia o servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
