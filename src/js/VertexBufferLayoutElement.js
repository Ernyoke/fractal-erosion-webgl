'use strict';

export class VertexBufferLayoutElement {
    constructor(gl, type, count, normalized) {
        this.gl = gl;
        this._type = type;
        this._count = count;
        this._normalized = normalized;
    }

    get type() {
        return this._type;
    }

    get count() {
        return this._count;
    }

    get normalized() {
        return this._normalized;
    }

    sizeOfType() {
        switch (this._type) {
            case this.gl.FLOAT: {
                return 4;
            }
            case this.gl.UNSIGNED_BYTE: {
                return 1;
            }
            case this.gl.UNSIGNED_INT: {
                return 4;
            }
            default: {
                return 0;
            }
        }
    }
}
