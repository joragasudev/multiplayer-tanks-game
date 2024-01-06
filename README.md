
# Multiplayer tanks game
A tiny multiplayer game inspired by Battle City. It is built with `Node.js`, `Express`, and `Socket.io` on the server side, and utilizes the `Phaser 3` game library on the client side.

Players can use their mobile phones as a joystick or simply use the keyboard to play.

<p align="center">
<img src="https://github.com/joragasudev/files/blob/main/multiplayer-tanks-game/demo%20400x225.gif?raw=true" width="400" height="225" border="10"/>
</p>


>[!WARNING]
>This project was developed exclusively for educational purposes and does not use realistic programming techniques for multiplayer games such as client prediction, interpolation, data compression, lag compensation, etc. Works best in low latency environments such as local networks.

<h2>Installation:</h2>

You need `Node v20.8.1` or higher installed on your machine.
Clone/Download the repository, navigate to the project directory in your machine and run

```
npm install
```

You can change the server port in `server/config.json`


<h2>Running:</h2>
Navigate to the project directory and run:

```
node server/server.js
```

<h2>How to play:</h2>

To play in a PC with keyboard, just open a browser and navigate to:
```
  localhost:3000
```

To play in joystick mode navigate to:
```
  localhost:3000/joystick.html
```

To add a simple bot navigate in a new tab to:
```
  localhost:3000/bot.html
```

To add a observer navigate to:
```
  localhost:3000/observer.html
```
