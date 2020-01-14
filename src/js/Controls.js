export class Controls {
    constructor(domElement, camera) {
        if (domElement) {
            const self = this;
            domElement.addEventListener('mousedown', (event) => {this.onMouseDown(event)}, false);
            domElement.addEventListener('mouseup', (event) => {this.onMouseUp(event)}, false);
            domElement.addEventListener('mousemove', (event) => {this.onMouseMove(event)}, false);
            domElement.addEventListener('wheel', (event) => {this.onMouseScroll(event)}, false);
        }

        this.camera = camera;

        this.lastX = 0.0;
        this.lastY = 0.0;
        this.xChange = 0.0;
        this.yChange = 0.0;
        this.mouseFirstMoved = true;
        this.mouseButtonPressed = [false, false, false, false, false, false, false, false];

        this._deltaTime = 0;
    }

    set deltaTime(time) {
        this._deltaTime = time;
    }

    onMouseDown(event) {
        this.mouseButtonPressed[event.button] = true;
    }

    onMouseUp(event) {
        this.mouseButtonPressed[event.button] = false;
    }

    onMouseMove(event) {
        if (this.mouseFirstMoved) {
            this.lastX = event.x;
            this.lastY = event.y;
            this.mouseFirstMoved = false;
        } else {
            this.xChange = event.x - this.lastX;
            this.yChange = event.y - this.lastY;
            this.lastX = event.x;
            this.lastY = event.y;

            if (this.mouseButtonPressed[0]) {
                this.camera.turn(-this.xChange, this.yChange);
            }
        }
    }

    onMouseScroll(event) {
        if (event.deltaY > 0) {
            this.camera.moveForward(this._deltaTime);
        } else {
            if (event.deltaY < 0) {
                this.camera.moveBackward(this._deltaTime);
            }
        }
    }
}
