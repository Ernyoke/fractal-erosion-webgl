'use strict';

export class Controls {
    constructor(domElement, camera, terrain) {
        domElement.setAttribute('tabindex', '0');
        domElement.focus();
        if (domElement) {
            domElement.addEventListener('mousedown', (event) => {
                this.onMouseDown(event);
            }, false);
            domElement.addEventListener('mouseup', (event) => {
                this.onMouseUp(event);
            }, false);
            domElement.addEventListener('mousemove', (event) => {
                this.onMouseMove(event);
            }, false);
            domElement.addEventListener('wheel', (event) => {
                this.onMouseScroll(event);
            }, false);
            domElement.addEventListener('keypress', (event) => {
                this.onKeyDow(event);
            }, false);
            domElement.addEventListener('keyup', (event) => {
                this.onKeyUp(event);
            }, false);
        }

        this.camera = camera;
        this.terrain = terrain;

        this.lastX = 0.0;
        this.lastY = 0.0;
        this.xChange = 0.0;
        this.yChange = 0.0;
        this.mouseFirstMoved = true;
        this.mouseButtonPressed = Array(16).fill(false);
        this.keyPressed = Array(1024).fill(false);

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

    onKeyDow(event) {
        if (event.keyCode === 65 || event.keyCode === 97) {
            this.terrain.rotate(-1);
        }
        if (event.keyCode === 68 || event.keyCode === 100) {
            this.terrain.rotate(1);
        }
    }

    onKeyUp(event) {
        this.keyPressed[event.keyCode] = false;
    }
}
