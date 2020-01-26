'use strict';

import {Terrain} from './terrain';
import {Shader} from './shader';
import {ShaderProgram} from './shader-program';
import {Light} from './light';
import {Renderer} from './renderer';
import {Camera} from './camera';

import {mat4, vec3} from 'gl-matrix';

import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

export class Display {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;

        this.gridSize = 7;
        this.roughness = 5;

        // controls
        this.lastX = 0.0;
        this.lastY = 0.0;
        this.xChange = 0.0;
        this.yChange = 0.0;
        this.mouseFirstMoved = true;
        this.mouseButtonPressed = Array(16).fill(false);
        this.keyPressed = Array(1024).fill(false);

        this.deltaTime = 0;
    }

    async initialize() {
        this.resize();

        this.perspective = mat4.perspective(mat4.create(), 70.0, this.canvas.width / this.canvas.height, 0.1, 1000.0);

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

        this.loadTerrain();
        this.initShaderProgram();

        this.initCanvasControls();
        this.initSidebarInputs();
    }

    initCanvasControls() {
        if (this.canvas) {
            this.canvas.setAttribute('tabindex', '0');
            this.canvas.focus();
            this.canvas.addEventListener('mousedown', (event) => {
                this.onMouseDown(event);
            }, false);
            this.canvas.addEventListener('mouseup', (event) => {
                this.onMouseUp(event);
            }, false);
            this.canvas.addEventListener('mousemove', (event) => {
                this.onMouseMove(event);
            }, false);
            this.canvas.addEventListener('wheel', (event) => {
                this.onMouseScroll(event);
            }, false);
            this.canvas.addEventListener('keypress', (event) => {
                this.onKeyDow(event);
            }, false);
            this.canvas.addEventListener('keyup', (event) => {
                this.onKeyUp(event);
            }, false);
        }
    }

    initSidebarInputs() {
        const roughnessSlider = this.initSlider('roughness-slider', 'roughness-slider-value');
        if (roughnessSlider) {
            roughnessSlider.defaultValue = this.roughness;
        }
        const gridSizeSlider = this.initSlider('grid-size-slider', 'grid-size-slider-value');
        if (gridSizeSlider) {
            gridSizeSlider.defaultValue = this.gridSize;
        }
        const generateButton = document.querySelector('#generate-button');
        if (generateButton && roughnessSlider && gridSizeSlider) {
            generateButton.addEventListener('click', (event) => {
                this.roughness = parseFloat(roughnessSlider.value);
                this.gridSize = parseInt(gridSizeSlider.value);
                this.loadTerrain().then(() => {
                    // TODO: spinner
                });
            });
        }
        const thermalErosionIterationsSlider =
            this.initSlider('thermal-iterations-slider', 'thermal-iterations-slider-value');
        if (thermalErosionIterationsSlider) {
            thermalErosionIterationsSlider.defaultValue = 10;
        }
        const applyThermalErosionButton = document.querySelector('#apply-thermal-erosion-button');
        if (applyThermalErosionButton && thermalErosionIterationsSlider) {
            applyThermalErosionButton.addEventListener('click', (event) => {
                const iteration = parseInt(thermalErosionIterationsSlider.value);
                this.terrain.applyThermalErosion(iteration)
                    .then(() => this.resetTerrain())
                    .then(() => {
                        // TODO: spinner
                    });
            });
        }
        const hydraulicErosionIterationsSlider =
            this.initSlider('hydraulic-iterations-slider', 'hydraulic-iterations-slider-value');
        if (hydraulicErosionIterationsSlider) {
            hydraulicErosionIterationsSlider.defaultValue = 10;
        }
        const waterQuantitySlider =
            this.initSlider('water-quantity-slider', 'water-quantity-slider-value');
        if (waterQuantitySlider) {
            waterQuantitySlider.defaultValue = 0.1;
        }
        const applyHydraulicErosionButton = document.querySelector('#apply-hydraulic-erosion-button');
        if (applyHydraulicErosionButton && hydraulicErosionIterationsSlider && waterQuantitySlider) {
            applyHydraulicErosionButton.addEventListener('click', (event) => {
                const iteration = parseInt(hydraulicErosionIterationsSlider.value);
                const waterQuantity = parseFloat(waterQuantitySlider.value);
                this.terrain.applyHydraulicErosion(iteration, waterQuantity)
                    .then(() => this.resetTerrain())
                    .then(() => {
                        // TODO: spinner
                    });
            });
        }
    }

    initSlider(sliderId, sliderValueId) {
        const slider = document.querySelector(`#${sliderId}`);
        const sliderValueLabel = document.querySelector(`#${sliderValueId}`);
        if (slider && sliderValueLabel) {
            slider.defaultValue = this.roughness;
            slider.addEventListener('input', (event) => {
                sliderValueLabel.innerHTML = slider.value;
            });
        }
        return slider;
    }

    async loadTerrain() {
        this.terrain = new Terrain(this.gl, this.gridSize, this.roughness);
        await this.terrain.initialize();
    }

    async resetTerrain() {
        if (this.terrain) {
            await this.terrain.reset();
        }
    }

    async initShaderProgram() {
        const vShader = new Shader(this.gl, vertexShader, this.gl.VERTEX_SHADER);
        vShader.compile();
        const fShader = new Shader(this.gl, fragmentShader, this.gl.FRAGMENT_SHADER);
        fShader.compile();
        this.shaderProgram = new ShaderProgram(this.gl, vShader, fShader);
        this.shaderProgram.attachShaders();
        this.shaderProgram.bind();
    }

    update(delta) {
        this.deltaTime = delta;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.handleKeypress();
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

    onMouseDown(event) {
        this.mouseButtonPressed[event.button] = true;
    }

    onMouseUp(event) {
        this.mouseButtonPressed[event.button] = false;
    }

    onMouseMove(event) {
        if (this.mouseFirstMoved) {
            this.lastX = event.x;
            this.lastY = event.y;
            this.mouseFirstMoved = false;
        } else {
            this.xChange = event.x - this.lastX;
            this.yChange = event.y - this.lastY;
            this.lastX = event.x;
            this.lastY = event.y;

            if (this.mouseButtonPressed[0]) {
                this.terrain.rotate(this.xChange * 0.3);
                this.camera.turn(0, this.yChange);
            }
        }
    }

    onMouseScroll(event) {
        if (event.deltaY > 0) {
            this.camera.moveForward(this.deltaTime);
        } else {
            if (event.deltaY < 0) {
                this.camera.moveBackward(this.deltaTime);
            }
        }
    }

    onKeyDow(event) {
        this.keyPressed[event.keyCode] = true;
        this.keyPressed[event.keyCode + 32] = true;
    }

    onKeyUp(event) {
        this.keyPressed[event.keyCode] = false;
        this.keyPressed[event.keyCode + 32] = false;
    }

    handleKeypress() {
        for (let i = 0; i < this.keyPressed.length; i++) {
            if (this.keyPressed[i]) {
                if (i === 65 || i === 97) {
                    this.terrain.rotate(-1);
                }
                if (i === 68 || i === 100) {
                    this.terrain.rotate(1);
                }
            }
        }
    }
}
