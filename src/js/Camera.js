'use strict';

import {vec3, mat4} from 'gl-matrix';
import {radians} from './MathHelpers';

export class Camera {
    constructor(gl, position, up, worldUp, yaw, pitch) {
        this.gl = gl;
        this.position = position;
        this.up = up;
        this.worldUp = worldUp;
        this.yaw = yaw;
        this.pitch = pitch;

        this.front = vec3.fromValues(0.0, 0.0, -1.0);
        this.right = vec3.fromValues(1.0, 0.0, 0.0);
        this.turnSpeed = 0.1;
        this.movementSpeed = 0.0001;

        this.update();
    }

    update() {
        this.front[0] = Math.cos(radians(this.yaw)) * Math.cos(radians(this.pitch));
        this.front[1] = Math.sin(radians(this.pitch));
        this.front[2] = Math.sin(radians(this.yaw)) * Math.cos(radians(this.pitch));

        vec3.normalize(this.right, vec3.cross(vec3.create(), this.front, this.worldUp));
        vec3.normalize(this.up, vec3.cross(vec3.create(), this.right, this.front));
    }

    moveForward(deltaTime) {
        vec3.add(this.position, this.position, vec3.fromValues(this.front[0] * this.movementSpeed * deltaTime,
            this.front[1] * this.movementSpeed * deltaTime, this.front[2] * this.movementSpeed * deltaTime));
    }

    moveBackward(deltaTime) {
        vec3.subtract(this.position, this.position, vec3.fromValues(this.front[0] * this.movementSpeed * deltaTime,
            this.front[1] * this.movementSpeed * deltaTime, this.front[2] * this.movementSpeed * deltaTime));
    }

    moveLeft(deltaTime) {
        vec3.subtract(this.position, this.position, vec3.fromValues(this.right[0] * this.movementSpeed * deltaTime,
            this.right[1] * this.movementSpeed * deltaTime, this.right[2] * this.movementSpeed * deltaTime));
    }

    moveRight(deltaTime) {
        vec3.add(this.position, this.position, vec3.fromValues(this.right[0] * this.movementSpeed * deltaTime,
            this.right[1] * this.movementSpeed * deltaTime, this.right[2] * this.movementSpeed * deltaTime));
    }

    turn(x, y) {
        const xVelocity = x * this.turnSpeed;
        const yVelocity = y * this.turnSpeed;

        this.yaw += xVelocity;
        this.pitch += yVelocity;

        if (this.pitch > 89.0) {
            this.pitch = 89.0;
        }

        if (this.pitch < -89.0) {
            this.pitch = -89.0;
        }

        this.update();
    }

    calculateViewMatrix() {
        return mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.front), this.up);
    }
}
