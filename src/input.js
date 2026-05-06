export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.thrust = false;
    this.fire = false;
    this._firePressed        = false;
    this._upPressed          = false;
    this._downPressed        = false;
    this._devTogglePressed   = false;
    this._devWormholePressed = false;
    this._devCoinPressed     = false;
    this.shift               = false;

    window.addEventListener('keydown', (e) => { if (!e.repeat) this.#set(e.code, true); });
    window.addEventListener('keyup', (e) => this.#set(e.code, false));
  }

  consumeFire() {
    const pressed = this._firePressed;
    this._firePressed = false;
    return pressed;
  }

  consumeUp() {
    const pressed = this._upPressed;
    this._upPressed = false;
    return pressed;
  }

  consumeDown() {
    const pressed = this._downPressed;
    this._downPressed = false;
    return pressed;
  }

  consumeDevToggle() {
    const pressed = this._devTogglePressed;
    this._devTogglePressed = false;
    return pressed;
  }

  consumeDevWormhole() {
    const pressed = this._devWormholePressed;
    this._devWormholePressed = false;
    return pressed;
  }

  consumeDevCoin() {
    const pressed = this._devCoinPressed;
    this._devCoinPressed = false;
    return pressed;
  }

  #set(code, value) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.left = value;
        if (value) this._leftPressed = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.right = value;
        if (value) this._rightPressed = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.thrust = value;
        if (value) this._upPressed = true;
        if (value && this.shift) this._devWormholePressed = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (value) this._downPressed = true;
        break;
      case 'Space':
        this.fire = value;
        if (value) this._firePressed = true;
        break;
      case 'F2':
        if (value) this._devTogglePressed = true;
        break;
      case 'KeyG':
        if (value && this.shift) this._devCoinPressed = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.shift = value;
        break;
    }
  }
}
