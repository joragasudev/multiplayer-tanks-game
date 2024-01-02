export const EVENTS = Object.freeze({
  CONNECTION: 'connection',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RESYNC: 'resync',
  ADD_PLAYER: 'add_player',
  REMOVE_PLAYER: 'remove_player',
  WORLD_UPDATE: 'world_update',
  PLAYER_INPUT: 'player_input',
  JOYSTICK_PLAYER_UPDATE: 'joystick_player_update',
  JOYSTICK_INIT_DATA: 'joystick_init_data'
})
export const GAMECFG = Object.freeze({
  WORLD_WIDTH: 256,
  WORLD_HEIGHT: 240,
  TILE_WIDTH: 16,
  TILE_HEIGHT: 16,
  SCOREBOARD_WIDTH: 96,
  SCOREBOARD_HEIGHT: 240,
  FONT_NAME: 'pixeloidMono',
  MAX_POWERUPS_IN_MAP: 2,
  SEND_JOYSTICKS_PLAYERS_UPDATES: true
})
export const INPUT_DIRECTIONS = Object.freeze({
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left',
  NONE: 'none'
})
export const TANK_STATES = Object.freeze({
  ALIVE: 'alive',
  DEAD: 'dead',
  READY_TO_RESPAWN: 'ready_to_respawn'
})
export const POWERUP_STATES = Object.freeze({
  ALIVE: 'alive',
  DEAD: 'dead'
})
export const PROYECTILE_STATES = Object.freeze({
  ALIVE: 'alive',
  DEAD: 'dead'
})
export class PlayerInput {
  constructor (direction, buttonA) {
    this.direction = direction
    this.buttonA = buttonA
  }
}
