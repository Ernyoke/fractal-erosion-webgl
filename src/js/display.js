'use strict';

import {DiamondSquareFractal} from './diamond-square-fractal';
import {Terrain} from './terrain';
import {Shader} from './shader';
import {ShaderProgram} from './shader-program';
import {Light} from './light';
import {Renderer} from './renderer';
import {Camera} from './camera';
import {Controls} from './controls';

import {mat4, vec3} from 'gl-matrix';

import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

export class Display {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;

        this.gridSize = 7;
        this.seed = 25;
        this.roughness = 5;
    }

    initialize() {
        this.resize();

        this.perspective = mat4.perspective(mat4.create(), 70.0, this.canvas.width / this.canvas.height, 0.1, 100.0);

        this.renderer = new Renderer(this.gl);
        this.camera = new Camera(
            this.gl,
            vec3.fromValues(0.0, 25.0, 45.0),
            vec3.fromValues(0.0, 1.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0),
            -90,
            -35);
        this.directionalLight = new Light(
            vec3.fromValues(1.0, 1.0, 1.0),
            0.6,
            vec3.fromValues(1.0, -2.0, -2.0),
            0.5);

        this.fractal = new DiamondSquareFractal();
        this.fractal.generateGrid(Math.pow(2, this.gridSize) + 1, this.seed, this.roughness / 5.0);
        this.loadTerrain();
        this.initShaderProgram();
    }

    loadTerrain() {
        const mesh = this.fractal.generateMesh();
        const rotationAngle = this.terrain ? this.terrain.rotationAngle : 0.0;
        this.terrain = new Terrain(this.gl, mesh, rotationAngle);
        this.controls = new Controls(this.canvas, this.camera, this.terrain);
    }

    initShaderProgram() {
        const vShader = new Shader(this.gl, vertexShader, this.gl.VERTEX_SHADER);
        vShader.compile();
        const fShader = new Shader(this.gl, fragmentShader, this.gl.FRAGMENT_SHADER);
        fShader.compile();
        this.shaderProgram = new ShaderProgram(this.gl, vShader, fShader);
        this.shaderProgram.attachShaders();
        this.shaderProgram.bind();
    }

    update(delta) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.controls.deltaTime = delta;
        this.directionalLight.useLight(this.shaderProgram);
        this.terrain.material.useMaterial(this.shaderProgram);
        this.renderer.clear();
        this.shaderProgram.setUniformMat4f('u_Model', this.terrain.modelMatrix);
        this.shaderProgram.setUniformMat4f('u_View', this.camera.calculateViewMatrix());
        this.shaderProgram.setUniformMat4f('u_Projection', this.perspective);
        this.shaderProgram.setUniform3f('u_EyePosition', this.camera.position);
        this.renderer.draw(this.terrain, this.shaderProgram);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
