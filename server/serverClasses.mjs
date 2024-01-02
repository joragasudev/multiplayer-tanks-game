import { INPUT_DIRECTIONS, TANK_STATES, PROYECTILE_STATES, PlayerInput } from '../public/js/sharedConstants.mjs'

const TANK_PROPERTIES = {
  width: 16,
  height: 16,
  velocity_lvl1: 30,
  velocity_lvl2: 35,
  velocity_lvl3: 40,
  velocity_lvl4: 50,
  acceleration: 1,
  shootCooldown_lvl1: 2500,
  shootCooldown_lvl2: 2000,
  shootCooldown_lvl3: 1500,
  shootCooldown_lvl4: 1000,
  respawnCooldown: 3000
}
const PROYECTILE_PROPERTIES = {
  width: 8,
  height: 8,
  velocity: 80,
  acceleration: 1,
  cannonOffset: 13
}
const TILE_PROPERTIES = {
  width: 16,
  height: 16,
  velocity: 0,
  acceleration: 0,
  collidable: true
}
const POWERUP_PROPERTIES = {
  width: 16,
  height: 16,
  velocity: 0,
  acceleration: 0,
  collidable: true
}
const POWERUPS_TYPES = {
  POWERUP_HELMET: 'powerUp_helmet',
  POWERUP_STAR: 'powerUp_star',
  POWERUP_SPEED: 'powerUp_speed'
}
const POWERUP_SPEED_PROPERTIES = {
  effectDuration: 5000,
  speedBonus: 75
}
const POWERUP_LVLUP_PROPERTIES = {
  effectDuration: 0
}
const POWERUP_SHIELD_PROPERTIES = {
  effectDuration: 6000
}
const POWERUP_RESPAWN_SHIELD_PROPERTIES = {
  effectDuration: 3000
}

export class Body {
  constructor (x, y, width, height, velocity, acceleration, collidable = true) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.velocity = velocity
    this.acceleration = acceleration
    this.collidable = collidable
  }

  setPosition (x, y) {
    this.x = x
    this.y = y
  }
}

export class Tank extends Body {
  constructor (x, y, tint, id) {
    super(x, y, TANK_PROPERTIES.width, TANK_PROPERTIES.height, TANK_PROPERTIES.velocity_lvl1, TANK_PROPERTIES.acceleration)
    this.state = TANK_STATES.ALIVE
    this.facing = INPUT_DIRECTIONS.UP
    this.tint = tint
    this.lvl = 1
    this.id = id
    this.shootCooldown = 0
    this.hitPoints = 1
    this.powerUps = []
    this.shieldEnabled = false
    this.score = 0
    this.respawnCooldown = 0
  }

  canShoot () {
    if (this.shootCooldown > 0 || this.state !== TANK_STATES.ALIVE) {
      return false
    }
    return true
  }

  shoot () {
    switch (this.lvl) {
      case 1:{
        this.shootCooldown = TANK_PROPERTIES.shootCooldown_lvl1
        break }
      case 2:{
        this.shootCooldown = TANK_PROPERTIES.shootCooldown_lvl2
        break }
      case 3:{
        this.shootCooldown = TANK_PROPERTIES.shootCooldown_lvl3
        break }
      case 4:{
        this.shootCooldown = TANK_PROPERTIES.shootCooldown_lvl4
        break }
      default:{ break }
    }
  }

  update (deltaTime) {
    // Aplly powerUps and clean the ones that are over.
    this.powerUps.forEach(powerUp => { powerUp.update(this, deltaTime) })
    this.powerUps = this.powerUps.filter(powerUp => powerUp.effectDuration > 0)

    this.shootCooldown -= deltaTime

    if (this.state === TANK_STATES.DEAD) {
      this.respawnCooldown -= deltaTime
      if (this.respawnCooldown <= 0) {
        // reset tank
        this.hitPoints = 1
        this.lvl = 1
        this.shootCooldown = 0
        this.respawnCooldown = 0
        this.velocity = TANK_PROPERTIES.velocity_lvl1
        const respawnShield = new PowerUpRespawnShield(-1, this.x, this.y)
        this.powerUps = [respawnShield]
        this.state = TANK_STATES.READY_TO_RESPAWN
      }
    }
  }

  move (direction, deltaTime) {
    const distance = this.acceleration * this.velocity * (deltaTime / 1000)

    switch (direction) {
      case INPUT_DIRECTIONS.LEFT:{
        this.x = this.x - distance
        this.facing = INPUT_DIRECTIONS.LEFT
        break }
      case INPUT_DIRECTIONS.RIGHT:{
        this.x = this.x + distance
        this.facing = INPUT_DIRECTIONS.RIGHT
        break }
      case INPUT_DIRECTIONS.UP:{
        this.y = this.y - distance
        this.facing = INPUT_DIRECTIONS.UP
        break }
      case INPUT_DIRECTIONS.DOWN:{
        this.y = this.y + distance
        this.facing = INPUT_DIRECTIONS.DOWN
        break }
      default:{ break }
    }
  }

  reciveDamageFrom (shooterTank, damage = 1) {
    if (this.shieldEnabled || this.state === TANK_STATES.DEAD) { return }

    this.hitPoints -= damage
    if (this.hitPoints <= 0) {
      this.state = TANK_STATES.DEAD
      this.respawnCooldown = TANK_PROPERTIES.respawnCooldown
      shooterTank.addScore()
    }
  }

  setLevel (lvl) {
    this.lvl = lvl
    this.shootCooldown = TANK_PROPERTIES[`shootCooldown_lvl${lvl}`]
    this.velocity = TANK_PROPERTIES[`velocity_lvl${lvl}`]
  }

  addPowerUp (powerUp) {
    this.powerUps.push(powerUp)
  }

  addScore (score = 1) {
    this.score += score
  }
}

export class Proyectile extends Body {
  constructor (id, tankX, tankY, facing, ownerId) {
    super(tankX, tankY, PROYECTILE_PROPERTIES.width, PROYECTILE_PROPERTIES.height, PROYECTILE_PROPERTIES.velocity, PROYECTILE_PROPERTIES.acceleration, true)
    this.id = id
    this.ownerId = ownerId
    this.facing = facing
    this.state = PROYECTILE_STATES.ALIVE
    this.adjustProyectileOrigin()
  }

  // Put the proyectile in the tip of the cannon of the tank.
  adjustProyectileOrigin () {
    switch (this.facing) {
      case INPUT_DIRECTIONS.LEFT:{
        this.x = this.x - PROYECTILE_PROPERTIES.cannonOffset
        break }
      case INPUT_DIRECTIONS.RIGHT:{
        this.x = this.x + PROYECTILE_PROPERTIES.cannonOffset
        break }
      case INPUT_DIRECTIONS.UP:{
        this.y = this.y - PROYECTILE_PROPERTIES.cannonOffset
        break }
      case INPUT_DIRECTIONS.DOWN:{
        this.y = this.y + PROYECTILE_PROPERTIES.cannonOffset
        break }
      default:;
    }
  }

  move (deltaTime) {
    const distance = this.acceleration * this.velocity * (deltaTime / 1000)
    switch (this.facing) {
      case INPUT_DIRECTIONS.LEFT:{
        this.x = this.x - distance
        break }
      case INPUT_DIRECTIONS.RIGHT:{
        this.x = this.x + distance
        break }
      case INPUT_DIRECTIONS.UP:{
        this.y = this.y - distance
        break }
      case INPUT_DIRECTIONS.DOWN:{
        this.y = this.y + distance
        break }
      default:;
    }
  }
}

export class Tile extends Body {
  constructor (id, x, y, name, collidable = TILE_PROPERTIES.collidable, width = TILE_PROPERTIES.width, height = TILE_PROPERTIES.height) {
    super(x, y, width, height, TILE_PROPERTIES.velocity, TILE_PROPERTIES.acceleration, collidable)
    this.name = name
    this.id = id
  }
}

export class PowerUp extends Body {
  constructor (id, x, y, effectDuration, type) {
    super(x,
      y,
      POWERUP_PROPERTIES.width,
      POWERUP_PROPERTIES.height,
      POWERUP_PROPERTIES.velocity,
      POWERUP_PROPERTIES.acceleration,
      POWERUP_PROPERTIES.collidable
    )
    this.id = id
    this.effectDuration = effectDuration
    this.applied = false
    this.type = type
  }

  update (tank, deltaTime) {
    if (!this.applied) {
      this.apply(tank)
      this.applied = true
    }

    this.effectDuration -= deltaTime

    if (this.effectDuration <= 0) {
      this.revert(tank)
    }
  }

  apply () {}
  revert () {}
}

export class PowerUpSpeed extends PowerUp {
  constructor (id, x, y) {
    super(id, x, y, POWERUP_SPEED_PROPERTIES.effectDuration, POWERUPS_TYPES.POWERUP_SPEED)
  }

  apply (tank) {
    if (tank !== null) { tank.velocity = POWERUP_SPEED_PROPERTIES.speedBonus }
  }

  revert (tank) {
    if (tank !== null) { tank.velocity = TANK_PROPERTIES[`velocity_lvl${tank.lvl}`] }
  }
}

export class PowerUpStar extends PowerUp {
  constructor (id, x, y) {
    super(id, x, y, POWERUP_LVLUP_PROPERTIES.effectDuration, POWERUPS_TYPES.POWERUP_STAR)
  }

  apply (tank) {
    if (tank !== null && tank.lvl < 4) { tank.setLevel(tank.lvl + 1) }
  }

  revert (tank) {}
}

export class PowerUpHelmet extends PowerUp {
  constructor (id, x, y) {
    super(id, x, y, POWERUP_SHIELD_PROPERTIES.effectDuration, POWERUPS_TYPES.POWERUP_HELMET)
  }

  apply (tank) {
    if (tank !== null) { tank.shieldEnabled = true }
  }

  revert (tank) {
    if (tank !== null) { tank.shieldEnabled = false }
  }
}

export class PowerUpRespawnShield extends PowerUp {
  constructor (id, x, y) {
    super(id, x, y, POWERUP_RESPAWN_SHIELD_PROPERTIES.effectDuration, POWERUPS_TYPES.POWERUP_HELMET)
  }

  apply (tank) {
    if (tank !== null) { tank.shieldEnabled = true }
  }

  revert (tank) {
    if (tank !== null) { tank.shieldEnabled = false }
  }
}

export class User {
  constructor (id) {
    this.id = id
  }
}

export class Player extends User {
  constructor (id, name, source, tank) {
    super(id)
    this.name = name
    this.source = source
    this.tank = tank
    this.input = new PlayerInput(INPUT_DIRECTIONS.NONE, false)
  }
}
