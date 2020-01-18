import '../css/main.scss';
import {Display} from "./Display";

const ready = (fn) => {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};


ready(() => {
    class App {
        constructor() {
            this.canvas = document.getElementById("gl-surface");
            this.gl = this.canvas.getContext("webgl2");
            if (!this.gl) {
                console.error("Experimental webgl not supported!");
            }

            this.resize();

            this.display = new Display(this.gl, this.canvas);
            this.display.initialize();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }

        draw(delta) {
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.display.update(delta);
        }
    }

    const app = new App();

    const render = delta => {
        app.draw(delta);
        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});

