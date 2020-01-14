export class Renderer {
    constructor(gl) {
        this.gl = gl;
    }

    clear() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    draw(vertexArray, indexBuffer, shaderProgram) {
        shaderProgram.bind();
        vertexArray.bind();
        indexBuffer.bind();

        this.gl.drawElements(this.gl.TRIANGLES, indexBuffer.count, this.gl.UNSIGNED_INT, 0);
    }
}
