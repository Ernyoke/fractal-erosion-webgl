import {ShaderProgram} from "./ShaderProgram";
import {Shader} from "./Shader";
import {VertexBuffer} from "./VertexBuffer";
import {VertexBufferLayout} from "./VertexBufferLayout";
import {IndexBuffer} from "./IndexBuffer";
import {VertexArray} from "./VertexArray";
import {Renderer} from "./Renderer";
import {Camera} from "./Camera";
import {Controls} from "./Controls";

import {vec3, mat4} from "gl-matrix";

import fragmentShader from "../shaders/fragmentShader.glsl";
import vertexShader from "../shaders/vertexShader.glsl";

import '../css/main.scss';
import {Material} from "./Material";
import {Light} from "./Light";

const ready = (fn) => {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};


ready(() => {
    let gl;

    class App {
        constructor() {
            this.canvas = document.getElementById("gl-surface");
            this.gl = this.canvas.getContext("webgl2");
            if (!this.gl) {
                console.error("Experimental webgl not supported!");
            }

            const positions = [
                -0.5, -0.5, 1.0, 1.0, 1.0, 0.0, 1.0, 0.2, 0.0, -0.8,
                0.5, -0.5, 1.0, 1.0, 1.0, 0.0, 1.0, 0.2, 0.0, -0.8,
                0.5, 0.5, 1.0, 1.0, 1.0, 0.0, 1.0, 0.2, 0.0, -0.8,
                -0.5, 0.5, 1.0, 1.0, 1.0, 0.0, 1.0, 0.2, 0.0, -0.8,
            ];

            this.indices = [
                0, 1, 2,
                2, 3, 0
            ];

            this.resize();

            this.camera = new Camera(this.gl, vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0), -90, 0);
            this.perspective = mat4.perspective(mat4.create(), 70.0, this.width / this.height, 0.1, 100.0);

            this.controls = new Controls(this.canvas, this.camera);

            this.vertexArray = new VertexArray(this.gl);
            this.vertexBuffer = new VertexBuffer(this.gl);
            this.vertexBuffer.init(positions);

            this.vertexBufferLayout = new VertexBufferLayout(this.gl);
            this.vertexArray.bind();
            this.vertexBufferLayout.pushFloat(3);
            this.vertexBufferLayout.pushFloat(4);
            this.vertexBufferLayout.pushFloat(3);
            this.vertexArray.addBuffer(this.vertexBuffer, this.vertexBufferLayout);

            this.indexBuffer = new IndexBuffer(this.gl);
            this.indexBuffer.init(this.indices);

            const vShader = new Shader(this.gl, vertexShader, this.gl.VERTEX_SHADER);
            vShader.compile();
            const fShader = new Shader(this.gl, fragmentShader, this.gl.FRAGMENT_SHADER);
            fShader.compile();
            this.shaderProgram = new ShaderProgram(this.gl, vShader, fShader);
            this.shaderProgram.attachShaders();

            this.material = new Material(0.5, 32.0);
            this.light = new Light(vec3.fromValues(1.0, 1.0, 1.0), 0.5, vec3.fromValues(2.0, -2.0, -2.0), 0.7);

            this.renderer = new Renderer(this.gl);
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }

        draw(delta) {
            this.controls.deltaTime = delta;
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.renderer.clear();
            this.shaderProgram.bind();
            this.light.useLight(this.shaderProgram);
            this.material.useMaterial(this.shaderProgram);
            this.shaderProgram.setUniform4f("u_View", this.camera.calculateViewMatrix());
            this.shaderProgram.setUniform4f("u_Projection", this.perspective);
            this.renderer.draw(this.vertexArray, this.indexBuffer, this.shaderProgram);
        }
    }

    const app = new App();

    const render = delta => {
        app.draw(delta);
        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});

