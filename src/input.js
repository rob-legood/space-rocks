export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.thrust = false;
    this.fire = false;
    this._firePressed = false;

    window.addEventListener('keydown', (e) => { if (!e.repeat) this.#set(e.code, true); });
    window.addEventListener('keyup', (e) => this.#set(e.code, false));
  }

  consumeFire() {
    const pressed = this._firePressed;
    this._firePressed = false;
    return pressed;
  }

  #set(code, value) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.left = value;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.right = value;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.thrust = value;
        break;
      case 'Space':
        this.fire = value;
        if (value) this._firePressed = true;
        break;
    }
  }
}
