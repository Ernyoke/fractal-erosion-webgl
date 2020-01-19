'use strict';

export class ShaderProgram {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.shaders = [vertexShader, fragmentShader];
        this.uniformLocationCache = {};
    }

    attachShaders() {
        this.program = this.gl.createProgram();
        for (const shader of this.shaders) {
            this.gl.attachShader(this.program, shader.getShaderObject());
        }
        this.gl.linkProgram(this.program);
        const status = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
        if (!status) {
            console.error(this.gl.getProgramInfoLog(this.program));
        }
    }

    bind() {
        this.gl.useProgram(this.program);
    }

    getUniformLocation(name) {
        if (this.uniformLocationCache[name]) {
            return this.uniformLocationCache[name];
        }
        const location = this.gl.getUniformLocation(this.program, name);
        if (!location) {
            console.warn(`Location ${name} not found!`);
        } else {
            this.uniformLocationCache[name] = location;
        }
        return location;
    }

    setUniform1f(name, value) {
        const location = this.getUniformLocation(name);
        this.gl.uniform1f(location, value);
    }

    setUniform3f(name, value) {
        const location = this.getUniformLocation(name);
        this.gl.uniform3f(location, value[0], value[1], value[2]);
    }

    setUniformMat4f(name, value) {
        const location = this.getUniformLocation(name);
        this.gl.uniformMatrix4fv(location, false, value);
    }
}
