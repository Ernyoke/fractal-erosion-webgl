'use strict';

import '../css/main.scss';
import 'bootstrap';
import {Display} from './Display';

const ready = (fn) => {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};


ready(() => {
    const canvas = document.getElementById('gl-surface');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('Experimental webgl not supported!');
    }

    const display = new Display(gl, canvas);
    display.initialize().then(() => {
    });

    const render = (delta) => {
        display.update(delta);
        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
});

