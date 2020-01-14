export class Shader {
    constructor(gl, source, shaderType) {
        this.gl = gl;
        this.source = source;
        this.shaderType = shaderType;
    }

    compile() {
        this.shaderObject = this.gl.createShader(this.shaderType);
        this.gl.shaderSource(this.shaderObject, this.source);
        this.gl.compileShader(this.shaderObject);
        const status = this.gl.getShaderParameter(this.shaderObject, this.gl.COMPILE_STATUS);
        if (!status) {
            console.error(this.gl.getShaderInfoLog(this.shaderObject));
        }
    }

    getShaderObject() {
        return this.shaderObject;
    }
}
