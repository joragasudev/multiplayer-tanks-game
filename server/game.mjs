import { readFileSync } from 'node:fs'
import { Player, Tank, Proyectile, Tile, Body, PowerUpSpeed, PowerUpStar, PowerUpHelmet, PowerUpRespawnShield } from './serverClasses.mjs'
import { TANK_STATES, POWERUP_STATES, PROYECTILE_STATES, GAMECFG } from '../public/js/sharedConstants.mjs'

const players = new Map()
let proyectiles = []
let proyectileId = 0
let powerUps = []
let powerUpId = 0
const MAP = []
const MAP_NAME = 'map1.json'
const MAP_PATH = process.cwd() + '/server/maps/'
let nextTintColorIndex = 0

// UTILS
function getNewTintColor () {
  const colors = [3899917, 8532477, 781065, 1223623, 13157309, 8621909, 2517079, 12545368, 15998200, 8846833, 4650293, 5019285, 9388505, 13138589, 11978851,
    14711614, 693028, 15078923, 872641, 13119823, 3627701, 10178444, 8750315, 1819008, 3770772, 7311738, 15505628, 8563043, 10438505, 11171124,
    13361459, 13841211, 5539509, 10060394, 5448451, 7478469, 3529627, 13875236, 3042348, 6518150, 8334817, 747417, 16083829, 15154451, 15154451,
    16499502, 5886062, 9912240, 215320, 5193521, 5193521]
  return colors[nextTintColorIndex++ % colors.length]
}
function getRespanwPosition (body) {
  const requiredWidthSpace = body.width * 1.5
  const requiredHeightSpace = body.height * 1.5
  const halfBodyWidth = body.width / 2 + 1
  const halfBodyHeight = body.height / 2 + 1
  const minX = halfBodyWidth
  const maxX = GAMECFG.WORLD_WIDTH - halfBodyWidth
  const minY = halfBodyHeight
  const maxY = GAMECFG.WORLD_HEIGHT - halfBodyHeight
  let randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX
  let randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY
  const proxyBody = new Body(randomX, randomY, requiredWidthSpace, requiredHeightSpace, 0, 0, true)

  // This can cause an infinite loop if there is no space for the tank to spawn. It is very rare that it happens, so its ok for this project.
  while (isBodyCollidingWithSomething(proxyBody)) {
    randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX
    randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY
    proxyBody.x = randomX
    proxyBody.y = randomY
  }

  return { x: proxyBody.x, y: proxyBody.y }
}
function getRandomName () {
  const animals = [
    'Lion', 'Tiger', 'Snake', 'Whale', 'Zebra', 'Shark', 'Eagle',
    'Koala', 'Panda', 'Falcon', 'Otter', 'Horse', 'Chimp', 'Goose', 'Mouse',
    'Crab', 'Sloth', 'Squid', 'Seal', 'Camel', 'Bat', 'Frog', 'Skunk', 'Swan',
    'Bison', 'Liger', 'Moose', 'Lizard', 'Hound', 'Hyena', 'Macaw', 'Llama',
    'Viper', 'Snail', 'Puppy', 'Ferret', 'Stoat', 'Bongo', 'Pug', 'Puffin',
    'Finch', 'Guppy', 'Gecko', 'Bunny', 'Corgi', 'Dhole', 'Fox', 'Crow', 'Quail'
  ]

  return animals[Math.floor(Math.random() * animals.length)]
}

// PLAYERS
function newPlayer (id, source, userName) {
  const newTank = new Tank(0, 0, getNewTintColor(), id)
  const newRespanwPosition = getRespanwPosition(newTank)
  newTank.setPosition(newRespanwPosition.x, newRespanwPosition.y)
  const respawnShield = new PowerUpRespawnShield(-1, this.x, this.y)
  newTank.addPowerUp(respawnShield)
  userName = userName.toString()
  if (userName === '' || userName === null) { userName = getRandomName() }
  const newPlayer = new Player(id, userName, source, newTank)
  players.set(id, newPlayer)
  return newPlayer
}
function deletePlayer (id) {
  players.delete(id)
  // Remove proyectiles owned by the player.
  proyectiles = proyectiles.filter(proyectile => proyectile.ownerId !== id)
}
function updatePlayerInput (id, input) {
  players.get(id).input = input
}

// COLLIDING FUNCTIONS
function areBodiesColliding (body1, body2) {
  const body1LeftMost = body1.x - body1.width / 2 + 0.5
  const body1RightMost = body1.x + body1.width / 2 - 0.5
  const body1TopMost = body1.y - body1.height / 2 + 0.5
  const body1BottomMost = body1.y + body1.height / 2 - 0.5
  const body2LeftMost = body2.x - body2.width / 2 + 0.5
  const body2RightMost = body2.x + body2.width / 2 - 0.5
  const body2TopMost = body2.y - body2.height / 2 + 0.5
  const body2BottomMost = body2.y + body2.height / 2 - 0.5

  if (body1LeftMost < body2RightMost &&
        body1RightMost > body2LeftMost &&
        body1TopMost < body2BottomMost &&
        body1BottomMost > body2TopMost) {
    return true
  }
  return false
}
function isBodyCollidingWithSomething (body, checkWalls = true, checkTanks = true, checkProyectiles = true, checkPowerUps = true) {
  if ((checkWalls && isBodyCollidingWithWalls(body)) ||
        (checkTanks && isBodyCollidingWithATank(body)) ||
        (checkProyectiles && isBodyCollidingWithAProyectile(body)) ||
        (checkPowerUps && isBodyCollidingWithPowerUps(body))
  ) { return true }

  return false
}
function isBodyCollidingWithATank (body) {
  for (const [id, player] of players) {
    if ((body instanceof Tank) && id === body.id) { continue }
    if (player.tank.state !== TANK_STATES.DEAD && areBodiesColliding(body, player.tank)) {
      return player.tank
    }
  }
  return null
}
function isBodyCollidingWithAProyectile (body) {
  for (const proyectile of proyectiles) {
    if (areBodiesColliding(body, proyectile)) { return proyectile }
  }
  return null
}
function isBodyCollidingWithPowerUps (body) {
  for (const powerUp of powerUps) {
    if (areBodiesColliding(body, powerUp)) { return powerUp }
  }
  return null
}
function isBodyCollidingWithWorldBorders (body) {
  if (body.x - body.width / 2 < 0 || body.x + body.width / 2 > GAMECFG.WORLD_WIDTH || body.y - body.height / 2 < 0 || body.y + body.height / 2 > GAMECFG.WORLD_HEIGHT) { return true }
  return false
}
function isBodyCollidingWithWalls (body, ignoreTiles = []) {
  // Checking collision with world borders.
  if (isBodyCollidingWithWorldBorders(body)) { return true }

  // Checking collision with map tiles, except for the ones in ignoreTiles.
  for (const tile of MAP) {
    if (!ignoreTiles.includes(tile.name) &&
            tile.collidable &&
            areBodiesColliding(body, tile)) { return true }
  }

  return false
}

// TANKS
function updatePlayersTanks (deltaTime) {
  const playersValues = players.values()

  for (const player of playersValues) {
    const tank = player.tank

    // UPDATE TANK
    tank.update(deltaTime)

    if (tank.state === TANK_STATES.DEAD) { continue } // dead tanks can't move or shoot.

    if (tank.state === TANK_STATES.READY_TO_RESPAWN) {
      const newRespanwPosition = getRespanwPosition(tank)
      tank.setPosition(newRespanwPosition.x, newRespanwPosition.y)
      tank.state = TANK_STATES.ALIVE
      continue
    }

    // TANK MOVEMENT
    const currentX = tank.x
    const currentY = tank.y
    tank.move(player.input.direction, deltaTime)
    if (isBodyCollidingWithWalls(tank) || isBodyCollidingWithATank(tank)) {
      tank.setPosition(currentX, currentY)
    }

    // TANK SHOOTING
    if (player.input.buttonA && tank.canShoot(tank)) {
      proyectileId++
      proyectiles.push(new Proyectile(proyectileId, tank.x, tank.y, tank.facing, tank.id))
      tank.shoot()
    }
  }
}

// PROYECTILES
function updateProyectiles (deltaTime) {
  // Clear proyectile if it's dead.
  proyectiles = proyectiles.filter(proyectile => proyectile.state !== PROYECTILE_STATES.DEAD)

  for (const proyectile of proyectiles) {
    proyectile.move(deltaTime)
    // Check if proyectile is colliding with a tank.
    const shooterTank = players.get(proyectile.ownerId).tank
    const hitedTank = isBodyCollidingWithATank(proyectile)
    if (hitedTank !== null && hitedTank.id !== shooterTank.id) {
      proyectile.state = PROYECTILE_STATES.DEAD
      hitedTank.reciveDamageFrom(shooterTank)
    }
    // Check if proyectile is colliding with a wall.
    if (isBodyCollidingWithWalls(proyectile, ['water'])) {
      proyectile.state = PROYECTILE_STATES.DEAD
    }
  }
}

// POWERUPS
function updatePowerUps (deltaTime) {
  // SPAWN NEW POWERUPS
  if (powerUps.length < GAMECFG.MAX_POWERUPS_IN_MAP) {
    spawnRandomPowerUp()
  }

  // CHECK COLLISIONS WITH TANKS.
  powerUps.forEach(powerUp => {
    const tank = isBodyCollidingWithATank(powerUp)
    if (tank !== null) {
      tank.addPowerUp(powerUp)
      powerUp.state = POWERUP_STATES.DEAD
    }
  })

  // REMOVE DEAD POWERUPS
  powerUps = powerUps.filter(powerUp => powerUp.state !== POWERUP_STATES.DEAD)
}
function spawnRandomPowerUp () {
  const differentsPowerUps = 3
  const randomNumber = Math.floor(Math.random() * differentsPowerUps)
  let newPowerUp = null
  powerUpId++

  // New powerUps must be added here.
  switch (randomNumber) {
    case 0:{
      newPowerUp = new PowerUpSpeed(powerUpId, 0, 0)
      break }
    case 1:{
      newPowerUp = new PowerUpStar(powerUpId, 0, 0)
      break }
    case 2:{
      newPowerUp = new PowerUpHelmet(powerUpId, 0, 0)
      break }
    default:;
  }

  const newSpawnPosition = getRespanwPosition(newPowerUp)
  newPowerUp.setPosition(newSpawnPosition.x, newSpawnPosition.y)
  powerUps.push(newPowerUp)
}

// GETTERS
function getPlayers () {
  const playersArray = []
  const playerValues = players.values()
  for (const player of playerValues) {
    playersArray.push(player)
  }
  return playersArray
}
function getPlayersOfSource (source) {
  const sourcePlayers = []
  const playerValues = players.values()
  for (const player of playerValues) {
    if (player.source === source) { sourcePlayers.push(player) }
  }
  return sourcePlayers
}
function getMap () {
  return MAP
}
function getPlayersData () {
  const playersData = []
  for (const [id, player] of players) {
    playersData.push({
      id,
      name: player.name,
      tint: player.tank.tint,
      x: player.tank.x,
      y: player.tank.y,
      input: player.input,
      powerUps: player.tank.powerUps,
      state: player.tank.state,
      lvl: player.tank.lvl,
      shieldEnabled: player.tank.shieldEnabled,
      score: player.tank.score
    })
  }
  return playersData
}
function getProyectilesData () {
  const proyectilesData = []
  for (const proyectile of proyectiles) {
    proyectilesData.push({
      id: proyectile.id,
      x: proyectile.x,
      y: proyectile.y,
      facing: proyectile.facing,
      ownerId: proyectile.ownerId,
      state: proyectile.state
    })
  }
  return proyectilesData
}
function getPowerUpsData () {
  const powerUpsData = []
  for (const powerUp of powerUps) {
    powerUpsData.push({
      id: powerUp.id,
      x: powerUp.x,
      y: powerUp.y,
      type: powerUp.type
    })
  }
  return powerUpsData
}

// INIT and UPDATE
function createMap () {
  let jsonMap = {}
  try {
    const data = readFileSync(MAP_PATH + MAP_NAME, 'utf8')
    jsonMap = JSON.parse(data)
  } catch (error) {
    console.error("Can't read game map.", error)
  }

  const mapTiles = jsonMap.mapTiles
  const mapData = jsonMap.mapData
  let i = 0
  const halfTileWidth = GAMECFG.TILE_WIDTH / 2
  const halfTileHeight = GAMECFG.TILE_HEIGHT / 2

  for (let y = halfTileHeight; y <= GAMECFG.WORLD_HEIGHT - (halfTileHeight); y = y + GAMECFG.TILE_HEIGHT) {
    for (let x = halfTileWidth; x <= GAMECFG.WORLD_WIDTH - (halfTileWidth); x = x + GAMECFG.TILE_WIDTH) {
      if (mapData[i] !== 'none') {
        MAP.push(new Tile(i, x, y, mapData[i], mapTiles[mapData[i]].collidable))
      }
      i++
    }
  }
}
function init () {
  createMap()
}
function update (deltaTime) {
  updateProyectiles(deltaTime)
  updatePlayersTanks(deltaTime)
  updatePowerUps(deltaTime)
}

export const game = {
  init,
  update,
  newPlayer,
  deletePlayer,
  updatePlayerInput,
  getPlayers,
  getPlayersOfSource,
  getMap,
  getPlayersData,
  getProyectilesData,
  getPowerUpsData
}
