'use strict';

import {VertexArray} from './vertex-array';
import {VertexBuffer} from './vertex-buffer';
import {IndexBuffer} from './index-buffer';
import {VertexBufferLayout} from './vertex-buffer-layout';
import {Material} from './material';
import {DiamondSquareFractal} from './diamond-square-fractal';

import {mat4, vec3} from 'gl-matrix';

export class Terrain {
    constructor(gl, gridSize, roughness) {
        this.gl = gl;
        this.gridSize = gridSize;
        this.roughness = roughness;
        this.fractal = new DiamondSquareFractal();
        this._rotationAngle = 0.0;
    }

    async initialize() {
        await this.fractal.generateGrid(Math.pow(2, this.gridSize) + 1, this.roughness / 5.0);
        await this.reset();
    }

    async reset() {
        const mesh = await this.fractal.generateMesh();

        // initialize vertex array
        this.vertexArray = new VertexArray(this.gl);
        this.vertexArray.bind();

        // initialize vertex and index buffers;
        this.vertexBuffer = new VertexBuffer(this.gl);
        this.vertexBuffer.init(mesh.vertexData);
        this.indexBuffer = new IndexBuffer(this.gl);
        this.indexBuffer.init(mesh.indexData);

        // initialize the vertex buffer layout
        this.vertexBufferLayout = new VertexBufferLayout(this.gl);

        // we expect that the layout for the vertex data is vec3 of floats for the indices
        this.vertexBufferLayout.pushFloat(3);

        // we expect that the layout for for the color information is vec4 with floats for RGBA channels
        this.vertexBufferLayout.pushFloat(4);

        // we expect that the layout for the normal is a vec4 of floats
        this.vertexBufferLayout.pushFloat(3);

        // attach the vertex buffer and vertex buffer layout
        this.vertexArray.addBuffer(this.vertexBuffer, this.vertexBufferLayout);

        this._modelMatrix = mat4.create();
        this._rotationSpeed = 0.05;
        this._material = new Material(0.5, 32.0);

        this.applyRotation();
    }

    get material() {
        return this._material;
    }

    get modelMatrix() {
        return this._modelMatrix;
    }

    get numberOfVertices() {
        return this.indexBuffer.count;
    }

    get rotationAngle() {
        return this._rotationAngle;
    }

    bind() {
        this.vertexArray.bind();
        this.indexBuffer.bind();
    }

    rotate(xChange) {
        this._rotationAngle += xChange * this._rotationSpeed;
        if (Math.abs(this._rotationAngle) > Math.PI * 2) {
            this._rotationAngle = 0.0;
        }
        this.applyRotation();
    }

    applyRotation() {
        mat4.rotate(this._modelMatrix,
            mat4.identity(mat4.create()),
            this._rotationAngle,
            vec3.fromValues(0.0, 1.0, 0.0));
    }

    async applyThermalErosion(iterations) {
        for (let i = 0; i < iterations; i++) {
            await this.fractal.applyThermalErosion();
        }
    }

    async applyHydraulicErosion(iterations, waterQuantity) {
        for (let i = 0; i < iterations; i++) {
            await this.fractal.applyHydraulicErosion(waterQuantity, 0.5);
        }
    }
}
