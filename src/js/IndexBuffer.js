'use strict';

export class IndexBuffer {
    constructor(gl) {
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
        this._count = 0;
    }

    get count() {
        return this._count;
    }

    init(data) {
        this.bind();
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), this.gl.STATIC_DRAW);
        this._count = data.length;
    }

    bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    unBind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    clear() {
        this.gl.deleteBuffer(this.buffer);
    }

}
