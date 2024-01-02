import { TANK_STATES, PROYECTILE_STATES, POWERUP_STATES, INPUT_DIRECTIONS } from './sharedConstants.mjs'
import { SPRITES_NAMES } from './renderer.mjs'

class Sprite {
  constructor (phaserGameObject, x, y, tint = -1) {
    this.sprite = phaserGameObject.add.sprite(x, y)
    this.sprite.tint = tint
  }

  setPosition (x, y) {
    this.sprite.x = x
    this.sprite.y = y
  }

  setVisible (visible) {
    this.sprite.visible = visible
  }

  destroy () {
    this.sprite.destroy()
  }

  getTint () {
    return this.sprite.tintTopLeft
  }
}

export class Tank extends Sprite {
  constructor (phaserGameObject, x, y, tint, lvl = 1) {
    super(phaserGameObject, x, y, tint)
    this.state = TANK_STATES.ALIVE
    this.facing = 'up'
    this.lvl = lvl
    this.shield = new Shield(phaserGameObject, x, y)
    this.sprite.play(SPRITES_NAMES.TANK_PREFIX + this.lvl + SPRITES_NAMES.UP + SPRITES_NAMES.STATIC)
  }

  update (playerUpdate) {
    this.move(playerUpdate.x, playerUpdate.y)
    this.state = playerUpdate.state
    this.lvl = playerUpdate.lvl
    this.shield.setVisible(playerUpdate.shieldEnabled)
    this.animate(playerUpdate.input)
  }

  animate (input) {
    const currentAnimation = this.sprite.anims.currentAnim.key
    const isPlaying = this.sprite.anims.isPlaying
    const tankSpriteKey = SPRITES_NAMES.TANK_PREFIX + this.lvl

    const animationUP = tankSpriteKey + SPRITES_NAMES.UP
    const animationLEFT = tankSpriteKey + SPRITES_NAMES.LEFT
    const animationDOWN = tankSpriteKey + SPRITES_NAMES.DOWN
    const animationRIGHT = tankSpriteKey + SPRITES_NAMES.RIGHT
    const animationDead = SPRITES_NAMES.SFX_EXPLOSION

    if (this.state === TANK_STATES.ALIVE) {
      switch (input.direction) {
        case INPUT_DIRECTIONS.UP:{
          if ((currentAnimation !== animationUP) || (currentAnimation === animationUP && !isPlaying)) { this.sprite.play(tankSpriteKey + SPRITES_NAMES.UP) }
          break
        }
        case INPUT_DIRECTIONS.LEFT:{
          if ((currentAnimation !== animationLEFT) || (currentAnimation === animationLEFT && !isPlaying)) { this.sprite.play(tankSpriteKey + SPRITES_NAMES.LEFT) }
          break
        }
        case INPUT_DIRECTIONS.DOWN:{
          if ((currentAnimation !== animationDOWN) || (currentAnimation === animationDOWN && !isPlaying)) { this.sprite.play(tankSpriteKey + SPRITES_NAMES.DOWN) }
          break
        }
        case INPUT_DIRECTIONS.RIGHT:{
          if ((currentAnimation !== animationRIGHT) || (currentAnimation === animationRIGHT && !isPlaying)) { this.sprite.play(tankSpriteKey + SPRITES_NAMES.RIGHT) }
          break
        }
        default:{
          if ((currentAnimation === animationDead)) {
            this.sprite.play(tankSpriteKey + SPRITES_NAMES.UP)
          } else { this.sprite.stop() }
          break
        }
      }
    }

    if (this.state === TANK_STATES.DEAD) {
      if ((currentAnimation !== animationDead) || (currentAnimation === animationDead && !isPlaying)) { this.sprite.play(SPRITES_NAMES.SFX_EXPLOSION) }
    }
  }

  move (x, y) {
    this.setPosition(x, y)
    this.shield.setPosition(x, y)
  }

  destroy () {
    this.shield.destroy()
    super.destroy()
  }
}

export class Shield extends Sprite {
  constructor (phaserGameObject, x, y) {
    super(phaserGameObject, x, y)
    this.sprite.play(SPRITES_NAMES.SHIELD)
    this.sprite.visible = false
  }

  destroy () {
    super.destroy()
  }
}

export class Proyectile extends Sprite {
  constructor (phaserGameObject, x, y, id, ownerId, state = PROYECTILE_STATES.ALIVE) {
    super(phaserGameObject, x, y)
    this.id = id
    this.ownerId = ownerId
    this.state = state
    this.sprite.play(SPRITES_NAMES.PROYECTILE)
  }

  update (proyectileUpdate) {
    this.state = proyectileUpdate.state
    this.setPosition(proyectileUpdate.x, proyectileUpdate.y)
  }

  destroy () {
    super.destroy()
  }
}

export class PowerUp extends Sprite {
  constructor (phaserGameObject, x, y, id, powerUpType) {
    super(phaserGameObject, x, y)
    this.id = id
    this.type = powerUpType
    this.state = POWERUP_STATES.ALIVE
    this.sprite.play(powerUpType)
  }

  destroy () {
    super.destroy()
  }
}

export class AnimatedTile extends Sprite {
  constructor (phaserGameObject, x, y, id, animationName) {
    super(phaserGameObject, x, y)
    this.id = id
    this.sprite.play(animationName)
  }

  destroy () {
    super.destroy()
  }
}

export class StaticTile {
  constructor (phaserGameObject, x, y, id, atlasName, TileName) {
    this.image = phaserGameObject.add.image(x, y, atlasName, TileName)
    this.image.setDepth(1) // Set depth to 1 so that the terrain/tile is always on top.
    this.id = id
  }

  destroy () {
    this.image.destroy()
  }
}
export class User {
  constructor (id) {
    this.id = id
  }
}

export class Player extends User {
  constructor (id, name, tank) {
    super(id)
    this.name = name
    this.tank = tank
    this.score = 0
    this.input = { direction: 'none', buttonA: false }
  }

  update (playerUpdate) {
    this.input = playerUpdate.input
    this.score = playerUpdate.score
    this.tank.update(playerUpdate)
  }
}
