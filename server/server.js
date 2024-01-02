import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { Server } from 'socket.io'
import express from 'express'
import { game } from './game.mjs'
import { EVENTS, GAMECFG } from '../public/js/sharedConstants.mjs'

// Server Config
let jsonConfig = {}
try {
  const data = readFileSync(process.cwd() + '/server/config.json', 'utf8')
  jsonConfig = JSON.parse(data)
} catch (error) {
  console.error("Can't read config.json. Default values will be used.", error)
}
const SERVERCFG = Object.freeze({
  PORT: jsonConfig.server.port ?? 3000,
  TICK: jsonConfig.server.tick ?? 33,
  JOYSTICK_TICK: jsonConfig.server.joystickTick ?? 1000
})

const app = express()
const server = createServer(app)
const io = new Server(server)
let timeNOW = Date.now()
let timeLAST = timeNOW

io.on(EVENTS.CONNECTION, (socket) => {
  const source = new URL(socket.handshake.headers.referer).pathname
  const userName = socket.handshake.query.userName
  console.log(`New Connection. id: ${socket.id}. Source: ${source}.`)

  switch (source) {
    case '/':{
      socket.join('pcs')
      const newPlayer = game.newPlayer(socket.id, 'pcs', userName)
      io.to('pcs').emit(EVENTS.ADD_PLAYER, newPlayer)
      break
    }
    case '/observer.html':{
      socket.join('pcs')
      break
    }
    case '/joystick.html':{
      socket.join('joysticks')
      const newPlayer = game.newPlayer(socket.id, 'joysticks', userName)
      io.to('pcs').emit(EVENTS.ADD_PLAYER, newPlayer)
      socket.emit(EVENTS.JOYSTICK_INIT_DATA, game.getMap(), newPlayer.tank.tint)
      break
    }
    case '/bot.html':{
      socket.join('bots')
      const newPlayer = game.newPlayer(socket.id, 'bots', userName)
      io.to('pcs').emit(EVENTS.ADD_PLAYER, newPlayer)
      break
    }
    default:
      break
  }

  socket.on(EVENTS.DISCONNECT, () => {
    console.log(`Socket ${socket.id} has been disconnected.`)
    game.deletePlayer(socket.id)
    io.to('pcs').emit(EVENTS.REMOVE_PLAYER, socket.id)
  })

  socket.on(EVENTS.PLAYER_INPUT, (input) => {
    game.updatePlayerInput(socket.id, input)
  })

  socket.on(EVENTS.RESYNC, (resyncOptions) => {
    const { resyncMap, resyncPlayers } = resyncOptions
    let updatedMap = []
    let updatedPlayers = []

    if (resyncPlayers) {
      updatedPlayers = game.getPlayers()
    }
    if (resyncMap) {
      updatedMap = game.getMap()
    }
    // Proyectiles, powerUps and scores are updated and sended every server tick, so is not necessary to resync them.
    socket.emit(EVENTS.RESYNC, updatedMap, updatedPlayers)
  })
})

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html')
})
server.listen(SERVERCFG.PORT, () => {
  console.log(`Server running on port ${SERVERCFG.PORT}`)
})

// Init game
game.init()

// GAME LOOP
setInterval(() => {
  timeNOW = Date.now()
  const deltaTime = timeNOW - timeLAST

  game.update(deltaTime)

  io.to('pcs').emit(EVENTS.WORLD_UPDATE, {
    playersUpdate: game.getPlayersData(),
    proyectilesUpdate: game.getProyectilesData(),
    powerUpsUpdate: game.getPowerUpsData()
  })

  timeLAST = timeNOW
}, SERVERCFG.TICK)

// MiniMap and Score updates for Joystick players
if (GAMECFG.SEND_JOYSTICKS_PLAYERS_UPDATES) {
  setInterval(() => {
    const joystickPlayers = game.getPlayersOfSource('joysticks')
    joystickPlayers.forEach(joystickPlayer => {
      io.to(joystickPlayer.id).emit(EVENTS.JOYSTICK_PLAYER_UPDATE, { x: joystickPlayer.tank.x, y: joystickPlayer.tank.y, score: joystickPlayer.tank.score })
    })
  }, SERVERCFG.JOYSTICK_TICK)
}
