'use strict';

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
        this.roughness = 5;
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

        this.initSidebarInputs();
    }

    hookSliderWithValueLabel(slider, valueLabel) {
        slider.addEventListener('input', (event) => {
            valueLabel.innerHTML = slider.value;
        });
    }

    initSidebarInputs() {
        const roughnessSlider = document.querySelector('#roughness-slider');
        const roughnessSliderValueLabel = document.querySelector('#roughness-slider-value');
        if (roughnessSlider && roughnessSliderValueLabel) {
            roughnessSlider.defaultValue = this.roughness;
            this.hookSliderWithValueLabel(roughnessSlider, roughnessSliderValueLabel);
        }
        const gridSizeSlider = document.querySelector('#grid-size-slider');
        const gridSizeSliderValueLabel = document.querySelector('#grid-size-slider-value');
        if (gridSizeSlider && gridSizeSliderValueLabel) {
            gridSizeSlider.defaultValue = this.gridSize;
            this.hookSliderWithValueLabel(gridSizeSlider, gridSizeSliderValueLabel);
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
        const thermalErosionIterationsSlider = document.querySelector('#thermal-iterations-slider');
        const thermalErosionIterationsSliderValueLabel = document.querySelector('#thermal-iterations-slider-value');
        if (thermalErosionIterationsSlider && thermalErosionIterationsSliderValueLabel) {
            thermalErosionIterationsSlider.defaultValue = 10;
            this.hookSliderWithValueLabel(thermalErosionIterationsSlider, thermalErosionIterationsSliderValueLabel);
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
        const hydraulicErosionIterationsSlider = document.querySelector('#hydraulic-iterations-slider');
        const hydraulicErosionIterationsValueLabel = document.querySelector('#hydraulic-iterations-slider-value');
        if (hydraulicErosionIterationsSlider && hydraulicErosionIterationsValueLabel) {
            hydraulicErosionIterationsSlider.defaultValue = 10;
            this.hookSliderWithValueLabel(hydraulicErosionIterationsSlider, hydraulicErosionIterationsValueLabel);
        }
        const waterQuantitySlider = document.querySelector('#water-quantity-slider');
        const waterQuantitySliderValueLabel = document.querySelector('#water-quantity-slider-value');
        if (waterQuantitySlider && waterQuantitySliderValueLabel) {
            waterQuantitySlider.defaultValue = 0.1;
            this.hookSliderWithValueLabel(waterQuantitySlider, waterQuantitySliderValueLabel);
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

    async loadTerrain() {
        this.terrain = new Terrain(this.gl, this.gridSize, this.roughness);
        await this.terrain.initialize();
        this.controls = new Controls(this.canvas, this.camera, this.terrain);
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
