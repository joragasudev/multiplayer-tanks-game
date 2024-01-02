/* eslint-disable no-new */
import { Tank, Player, Proyectile, PowerUp, StaticTile, AnimatedTile } from './clientClasses.js'
import { GAMECFG, POWERUP_STATES, PROYECTILE_STATES } from './sharedConstants.mjs'

const players = new Map()
const proyectiles = new Map()
const powerUps = new Map()
const map = []
const MAX_SCORE_NAMES = 10
const bitMapTextScoreNames = []

const ATLAS = Object.freeze({
  name: 'atlas',
  path: '/assets/atlas/atlas.png',
  json: '/assets/atlas/atlas.json'
})

const ATLAS_FRAMES = Object.freeze({
  ATLAS_FRAME_TANKS: 'tanks',
  ATLAS_FRAME_POWERUPS: 'powerUps',
  ATLAS_FRAME_WATER: 'water',
  ATLAS_FRAME_CONCRETE: 'concrete',
  ATLAS_FRAME_FLASH: 'flash',
  ATLAS_FRAME_SHIELD: 'shield',
  ATLAS_FRAME_EXPLOSION: 'explosion',
  ATLAS_FRAME_PROYECTILE: 'proyectile'
})

export const SPRITES_NAMES = Object.freeze({
  TANK_PREFIX: 'tank_lvl',
  UP: 'up',
  LEFT: 'left',
  DOWN: 'down',
  RIGHT: 'right',
  STATIC: 'static',

  // powerUps
  POWERUP_HELMET: 'powerUp_helmet',
  POWERUP_STAR: 'powerUp_star',
  POWERUP_SPEED: 'powerUp_speed',
  SHIELD: 'shield',
  // tiles/terrain
  TILE_CONCRETE: 'concrete',
  TILE_WATER: 'water',
  TILE_BUSH: 'bush',
  TILE_BRICKS: 'bricks',
  TILE_METAL: 'metal',
  // flash
  SFX_FLASH: 'flash',
  SFX_EXPLOSION: 'explosion',
  // bullet
  PROYECTILE: 'proyectile'
})

const FRAME_RATES = Object.freeze({
  TANKS: 10,
  POWERUPS: 3,
  FLASH: 8,
  WATER: 3,
  SHIELD: 6,
  EXPLOSION: 6,
  PROYECTILES: 1
})

// GAME SPRITES
function createGameSprites (phaserGameObject) {
  // TANK SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas(
    'tanks_sprites', {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_TANKS,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 31
    }
  )
  function createTankAnimations (lvl, frames) {
    const directions = [SPRITES_NAMES.UP, SPRITES_NAMES.LEFT, SPRITES_NAMES.DOWN, SPRITES_NAMES.RIGHT]
    for (let i = 0; i < directions.length; i++) {
      const animationConfig = {
        key: SPRITES_NAMES.TANK_PREFIX + lvl + directions[i],
        frames: phaserGameObject.anims.generateFrameNumbers('tanks_sprites', { frames: frames[i] }),
        frameRate: FRAME_RATES.TANKS,
        repeat: -1
      }
      phaserGameObject.anims.create(animationConfig)
      phaserGameObject.anims.create({
        key: SPRITES_NAMES.TANK_PREFIX + lvl + directions[i] + SPRITES_NAMES.STATIC,
        frames: [{ key: 'tanks_sprites', frame: frames[i][0] }]
      })
    }
  }

  createTankAnimations(1, [[0, 1], [2, 3], [4, 5], [6, 7]])
  createTankAnimations(2, [[8, 9], [10, 11], [12, 13], [14, 15]])
  createTankAnimations(3, [[16, 17], [18, 19], [20, 21], [22, 23]])
  createTankAnimations(4, [[24, 25], [26, 27], [28, 29], [30, 31]])

  // POWERUP SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas('powerUps_sprites',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_POWERUPS,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 7
    }
  )
  function createPowerUpAnimations (key, frames) {
    const powerUpSpriteConfig = {
      key,
      frames: phaserGameObject.anims.generateFrameNumbers('powerUps_sprites', { frames }),
      frameRate: FRAME_RATES.POWERUPS,
      repeat: -1
    }
    phaserGameObject.anims.create(powerUpSpriteConfig)
  }

  createPowerUpAnimations(SPRITES_NAMES.POWERUP_HELMET, [0, 7])
  createPowerUpAnimations(SPRITES_NAMES.POWERUP_STAR, [3, 7])
  createPowerUpAnimations(SPRITES_NAMES.POWERUP_SPEED, [5, 7])

  // SHIELD SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas('shield_sprites',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_SHIELD,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 1
    }
  )
  const shieldSprite = {
    key: SPRITES_NAMES.SHIELD,
    frames: phaserGameObject.anims.generateFrameNumbers('shield_sprites', { frames: [0, 1] }),
    frameRate: FRAME_RATES.SHIELD,
    repeat: -1
  }
  phaserGameObject.anims.create(shieldSprite)

  // TERRAIN SPRITES (only water has animation)
  phaserGameObject.textures.addSpriteSheetFromAtlas(
    'water_sprites',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_WATER,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 2
    }
  )
  const waterSprite = {
    key: SPRITES_NAMES.TILE_WATER,
    frames: phaserGameObject.anims.generateFrameNumbers('water_sprites', { frames: [0, 1, 2] }),
    frameRate: FRAME_RATES.WATER,
    repeat: -1
  }
  phaserGameObject.anims.create(waterSprite)

  // FLASH SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas('flash_sprites',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_FLASH,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 3
    }
  )
  const flashSprite = {
    key: SPRITES_NAMES.SFX_FLASH,
    frames: phaserGameObject.anims.generateFrameNumbers('flash_sprites', { frames: [0, 1, 2, 3] }),
    frameRate: FRAME_RATES.FLASH,
    repeat: -1
  }
  phaserGameObject.anims.create(flashSprite)

  // EXPLOSION SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas('explosion_sprites',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_EXPLOSION,
      frameWidth: 16,
      frameHeight: 16,
      endFrame: 2
    }
  )
  const explosionSprite = {
    key: SPRITES_NAMES.SFX_EXPLOSION,
    frames: phaserGameObject.anims.generateFrameNumbers('explosion_sprites', { frames: [0, 1, 2] }),
    frameRate: FRAME_RATES.EXPLOSION,
    repeat: -1
  }
  phaserGameObject.anims.create(explosionSprite)

  // PROYECTILES SPRITES
  phaserGameObject.textures.addSpriteSheetFromAtlas('proyectile_sprite',
    {
      atlas: ATLAS.name,
      frame: ATLAS_FRAMES.ATLAS_FRAME_PROYECTILE,
      frameWidth: 8,
      frameHeight: 8,
      endFrame: 0
    }
  )
  const proyectileSprite = {
    key: SPRITES_NAMES.PROYECTILE,
    frames: phaserGameObject.anims.generateFrameNumbers('proyectile_sprite', { frames: [0] }),
    frameRate: FRAME_RATES.PROYECTILES,
    repeat: -1
  }
  phaserGameObject.anims.create(proyectileSprite)
}

// MAP
function createMap (phaserGameObject, mapData) {
  mapData.forEach((tile) => {
    if (tile.name === SPRITES_NAMES.TILE_WATER) {
      const animationKey = SPRITES_NAMES.TILE_WATER
      const newAnimatedTile = new AnimatedTile(phaserGameObject, tile.x, tile.y, tile.id, animationKey)
      map.push(newAnimatedTile)
    } else {
      const newStaticTile = new StaticTile(phaserGameObject, tile.x, tile.y, tile.id, ATLAS.name, tile.name)
      map.push(newStaticTile)
    }
  })
}

// GUI
function createGUI (phaserGameObject) {
  // Create GUI
  // Create Scoreboard
  const fontSize = 9
  const scoreBoardTitleX = 270
  const scoreBoardTitleY = 20
  const scoresStartX = 264
  const scoresStartY = 48
  const scoresLineHeight = 16
  const fontName = GAMECFG.FONT_NAME

  const scoreBoardTiles = 'miniMetal'
  // Scoreboard left and right walls.
  for (let i = 0; i < GAMECFG.SCOREBOARD_HEIGHT; i = i + 8) {
    new StaticTile(phaserGameObject, GAMECFG.WORLD_WIDTH, i, -1, ATLAS.name, scoreBoardTiles)
    new StaticTile(phaserGameObject, GAMECFG.WORLD_WIDTH + GAMECFG.SCOREBOARD_WIDTH - 8, i, -1, ATLAS.name, scoreBoardTiles)
  }
  // Scoreboard top and bottom walls
  for (let j = 0; j < GAMECFG.SCOREBOARD_WIDTH; j = j + 8) {
    new StaticTile(phaserGameObject, GAMECFG.WORLD_WIDTH + j, 0, -1, ATLAS.name, scoreBoardTiles)
    new StaticTile(phaserGameObject, GAMECFG.WORLD_WIDTH + j, GAMECFG.SCOREBOARD_HEIGHT - 8, -1, ATLAS.name, scoreBoardTiles)
  }
  // TEXT
  phaserGameObject.add.bitmapText(scoreBoardTitleX, scoreBoardTitleY, fontName, 'SCOREBOARD', fontSize)

  for (let i = 0; i < MAX_SCORE_NAMES; i++) {
    bitMapTextScoreNames.push(phaserGameObject.add.bitmapText(scoresStartX, scoresStartY + (i * scoresLineHeight), fontName, `${i + 1}.`, fontSize))
  }
}

// PLAYERS
function addPlayer (phaserGameObject, newPlayerData) {
  const newTank = new Tank(phaserGameObject, newPlayerData.tank.x, newPlayerData.tank.y, newPlayerData.tank.tint)
  const newPlayer = new Player(newPlayerData.id, newPlayerData.name, newTank)
  players.set(newPlayerData.id, newPlayer)
}

function removePlayer (playerId) {
  // Destroy and remove all proyectiles sprites owned by player
  for (const [id, proyectile] of proyectiles) {
    if (proyectile.ownerId === playerId) {
      proyectile.destroy()
      proyectiles.delete(id)
    }
  }
  // Desroy and remove player tank sprite
  const playerTank = players.get(playerId).tank
  playerTank.destroy()
  players.delete(playerId)
}

function resyncPlayers (phaserGameObject, updatedPlayers) {
  updatedPlayers.forEach((player) => {
    if (!players.has(player.id)) {
      addPlayer(phaserGameObject, player)
    }
  })
}

function updatePlayers (playersUpdate) {
  let resyncPlayers = false
  const scoresArray = []

  playersUpdate.forEach((playerUpdate) => {
    const player = players.get(playerUpdate.id)

    if (player !== undefined) {
      player.update(playerUpdate)
      scoresArray.push({
        name: player.name,
        score: player.score,
        tint: player.tank.sprite.tintTopLeft
      }) // tint is a setter only, according to docs we have to read it from tintTopLeft
    } else {
      resyncPlayers = true // Server sends a player that is not in the client, so we need to resync.
    }
  })

  updateScores(scoresArray)
  return resyncPlayers
}

// PROYECTILES
function updateProyectiles (phaserGameObject, proyectilesUpdate) {
  const resyncProyectiles = false

  // Every tick, every proyectile that was marked as DEAD is destroyed. The rest alive proyectiles are updated to DEAD,
  // so that if the server doesn't send a proyectile, it will be destroyed next tick.
  for (const [id, proyectile] of proyectiles) {
    if (proyectile.state === PROYECTILE_STATES.DEAD) {
      proyectile.destroy()
      proyectiles.delete(id)
    } else { proyectile.state = PROYECTILE_STATES.DEAD }
  }

  proyectilesUpdate.forEach((proyectileUpdate) => {
    const proyectile = proyectiles.get(proyectileUpdate.id)

    if (proyectile !== undefined) {
      proyectile.update(proyectileUpdate)
    } else {
      const newProyectile = new Proyectile(phaserGameObject,
        proyectileUpdate.x,
        proyectileUpdate.y,
        proyectileUpdate.id,
        proyectileUpdate.ownerId,
        PROYECTILE_STATES.ALIVE)
      proyectiles.set(newProyectile.id, newProyectile)
    }
  })

  return resyncProyectiles
}

// POWERUPS
function updatePowerUps (phaserGameObject, powerUpsUpdate) {
  for (const [id, powerUp] of powerUps) {
    if (powerUp.state === POWERUP_STATES.DEAD) {
      powerUp.destroy()
      powerUps.delete(id)
    } else { powerUp.state = POWERUP_STATES.DEAD }
  }

  powerUpsUpdate.forEach((powerUpUpdate) => {
    const powerUp = powerUps.get(powerUpUpdate.id)
    if (powerUp !== undefined) {
      powerUp.state = POWERUP_STATES.ALIVE
    } else {
      const newPowerUp = new PowerUp(phaserGameObject, powerUpUpdate.x, powerUpUpdate.y, powerUpUpdate.id, powerUpUpdate.type)
      powerUps.set(newPowerUp.id, newPowerUp)
    }
  })
}

// SCORES
function updateScores (scoresArray) {
  scoresArray.sort((a, b) => (a.score < b.score) ? 1 : -1)
  scoresArray = scoresArray.slice(0, MAX_SCORE_NAMES)

  let i = 0
  for (; i < scoresArray.length; i++) {
    bitMapTextScoreNames[i].tint = scoresArray[i].tint
    const name = scoresArray[i].name.substring(0, 6)
    bitMapTextScoreNames[i].text = `${i + 1}.${name}-${scoresArray[i].score}`
  }
  // Clean scores not used (if a player discconect for example)
  for (; i < MAX_SCORE_NAMES; i++) {
    bitMapTextScoreNames[i].tint = -1
    bitMapTextScoreNames[i].text = `${i + 1}.`
  }
}

export const renderer = {
  ATLAS,
  createGUI,
  createMap,
  createGameSprites,
  addPlayer,
  removePlayer,
  resyncPlayers,
  updatePlayers,
  updateProyectiles,
  updatePowerUps
}
