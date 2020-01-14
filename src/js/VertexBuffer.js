export class VertexBuffer {
    constructor(gl) {
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
    }

    init(data) {
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    unBind() {
        this.gl.bind(this.gl.ARRAY_BUFFER, null);
    }
}
