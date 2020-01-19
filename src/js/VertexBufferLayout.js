'use strict';

import {VertexBufferLayoutElement} from "./VertexBufferLayoutElement";

export class VertexBufferLayout {
    constructor(gl) {
        this.gl = gl;
        this._elements = [];
        this._stride = 0;
    }

    get elements() {
        return this._elements;
    }

    get stride() {
        return this._stride;
    }

    pushFloat(count) {
        const element = new VertexBufferLayoutElement(this.gl, this.gl.FLOAT, count, true);
        this._elements.push(element);
        this._stride += element.sizeOfType() * count;
    }

    pushInt(count) {
        const element = new VertexBufferLayoutElement(this.gl, this.gl.UNSIGNED_INT, count, false);
        this._elements.push(element);
        this._stride += element.sizeOfType() * count;
    }
}
