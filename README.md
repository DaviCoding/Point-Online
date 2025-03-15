# 🎮 Jogo Multiplayer inspirado em Agar.io

Este projeto é um jogo multiplayer inspirado em Agar.io, desenvolvido com **JavaScript**, **Node.js**, **Express** e **Socket.IO**. O jogo possui funcionalidades como movimentação do player, tiros, colisões, um sistema de armas.

## 🚀 Funcionalidades

- **Movimentação fluida** do player no mapa.
- **Tiros independentes** que viajam no mapa sem interferência do player.
- **Sistema de armas** com diferentes parâmetros (dano, alcance, velocidade, cooldown).
- **Sistema de colisão** entre o player e objetos do mapa.
- **Servidor multiplayer** utilizando Express e Socket.IO.

## 🛠 Tecnologias Utilizadas

- **Front-end:** HTML, CSS, JavaScript
- **Back-end:** Node.js, Express, Socket.IO

## Projeto simples de fim de semana

## 📦 Instalação

1. Clone este repositório:
   ```sh
   git clone https://github.com/DaviCoding/Point-Online.git
   ```
2. Acesse a pasta do projeto:
   ```sh
   cd Point-Online
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Inicie o servidor:
   ```sh
   npm run dev
   ```
5. Abra o navegador e acesse:
   ```sh
   http://localhost:3000
   ```

## 🎯 Como Jogar

- **Movimentação:** Use as teclas **W, A, S, D** para se mover.
- **Atirar:** Espaço
- **Armas:** [
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
- **Objetivo:** Sobreviva, elimine outros jogadores

## 🔗 Contribuição

Sinta-se à vontade para contribuir! Faça um **fork** do repositório, crie uma **branch** com sua melhoria e envie um **pull request**.

---

Desenvolvido por [Davi Alves](https://github.com/DaviCoding).

