import {DiamondSquareFractal} from "./DiamondSquareFractal";
import {Terrain} from "./Terrain";
import {Shader} from "./Shader";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import {ShaderProgram} from "./ShaderProgram";
import {Light} from "./Light";
import {mat4, vec3} from "gl-matrix";
import {Renderer} from "./Renderer";
import {Camera} from "./Camera";
import {Controls} from "./Controls";

export class Display {
    constructor(gl, canvas) {
        this.gl = gl;

        this.gridSize = 7;
        this.seed = 25;
        this.roughness = 5;
        this.fractal = new DiamondSquareFractal();

        this.terrain = null;
        this.directionalLight = new Light(vec3.fromValues(1.0, 1.0, 1.0), 0.5, vec3.fromValues(2.0, -2.0, -2.0), 0.7);

        this.renderer = new Renderer(this.gl);

        this.width = canvas.width;
        this.height = canvas.height;

        this.perspective = mat4.perspective(mat4.create(), 70.0, this.width / this.height, 0.1, 100.0);

        this.camera = new Camera(this.gl, vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0), -90, 0);
        this.controls = new Controls(canvas, this.camera);
    }

    initialize() {
        this.fractal.generateGrid(Math.pow(2, this.gridSize) + 1, this.seed, this.roughness / 5.0);
        this.loadTerrain();
        this.initShaderProgram();
    }

    loadTerrain() {
        const mesh = this.fractal.generateMesh();
        const rotationAngle = this.terrain ? this.terrain.rotationAngle : 0.0;
        this.terrain = new Terrain(this.gl, mesh, rotationAngle);
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
        this.controls.deltaTime = delta;
        this.directionalLight.useLight(this.shaderProgram);
        this.terrain.material.useMaterial(this.shaderProgram);
        this.renderer.clear();
        this.shaderProgram.setUniformMat4f("u_Model", this.terrain.modelMatrix);
        this.shaderProgram.setUniformMat4f("u_View", this.camera.calculateViewMatrix());
        this.shaderProgram.setUniformMat4f("u_Projection", this.perspective);
        this.shaderProgram.setUniform3f("u_EyePosition", this.camera.position);
        this.renderer.draw(this.terrain, this.shaderProgram);
    }
}