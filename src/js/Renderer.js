export class Renderer {
    constructor(gl) {
        this.gl = gl;
    }

    clear() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    draw(terrain, shaderProgram) {
        shaderProgram.bind();
        terrain.bind();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.drawElements(this.gl.TRIANGLES, terrain.numberOfVertices, this.gl.UNSIGNED_INT, 0);
    }
}
