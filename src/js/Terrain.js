import {VertexArray} from "./VertexArray";
import {VertexBuffer} from "./VertexBuffer";
import {IndexBuffer} from "./IndexBuffer";
import {VertexBufferLayout} from "./VertexBufferLayout";
import {mat4, vec3} from "gl-matrix";
import {Material} from "./Material";

export class Terrain {
    constructor(gl, mesh, rotationAngle) {
        this.gl = gl;

        // initialize vertex array
        this.vertexArray = new VertexArray(gl);
        this.vertexArray.bind();

        debugger;

        // initialize vertex and index buffers;
        this.vertexBuffer = new VertexBuffer(gl);
        this.vertexBuffer.init(mesh.vertexData);
        this.indexBuffer = new IndexBuffer(gl);
        this.indexBuffer.init(mesh.indexData);

        debugger;

        // initialize the vertex buffer layout
        this.vertexBufferLayout = new VertexBufferLayout(gl);

        // we expect that the layout for the vertex data is vec3 of floats for the indices
        this.vertexBufferLayout.pushFloat(3);

        // we expect that the layout for for the color information is vec4 with floats for RGBA channels
        this.vertexBufferLayout.pushFloat(4);

        // we expect that the layout for the normal is a vec4 of floats
        this.vertexBufferLayout.pushFloat(3);

        // attach the vertex buffer and vertex buffer layout
        this.vertexArray.addBuffer(this.vertexBuffer, this.vertexBufferLayout);

        this._modelMatrix = mat4.create();
        this._rotationAngle = rotationAngle;
        this._rotationSpeed = 0.01;
        this._material = new Material(0.5, 32.0);

        this.applyRotation();
    }

    get material() {
        return this._material;
    }

    bind() {
        this.vertexArray.bind();
        this.indexBuffer.bind();
    }

    rotate(xChange) {
        this.rotation_angle = xChange * this._rotationSpeed;
        if (Math.abs(this.rotation_angle) > Math.PI * 2) {
            this.rotation_angle = 0.0;
        }
        this.applyRotation();
    }

    applyRotation() {
        mat4.rotate(this._modelMatrix, mat4.identity(mat4.create()), this._rotationAngle, vec3.fromValues(0.0, 1.0, 0.0));
    }
}