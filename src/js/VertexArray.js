export class VertexArray {
    constructor(gl) {
        this.gl = gl;
        this.array = this.gl.createVertexArray();
    }

    addBuffer(vertexBuffer, vertexBufferLayout) {
        vertexBuffer.bind();
        let offset = 0;
        for (let i = 0; i < vertexBufferLayout.elements.length; i++) {
            const element = vertexBufferLayout.elements[i];
            this.gl.enableVertexAttribArray(i);
            this.gl.vertexAttribPointer(i, element.count, element.type, element.normalized, vertexBufferLayout.stride, offset);
            offset += element.count * element.sizeOfType();
        }
    }

    bind() {
        this.gl.bindVertexArray(this.array);
    }

    unBind() {
        this.gl.bindVertexArray(null);
    }
}
