'use strict';

import {vec4} from 'gl-matrix';
import {normalize} from './MathHelpers';

function hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? vec4.fromValues(
        parseInt(result[1], 16) / 255.0,
        parseInt(result[2], 16) / 255.0,
        parseInt(result[3], 16) / 255.0,
        1.0) : null;
}

const colors = new Map([
    [0, hexToRGB('#00FA9A')],
    [1, hexToRGB('#00FF66')],
    [2, hexToRGB('#00FF33')],
    [3, hexToRGB('#00FF00')],
    [4, hexToRGB('#00FF00')],
    [5, hexToRGB('#00FA9A')],
    [6, hexToRGB('#D1E231')],
    [7, hexToRGB('#CDC673')],
    [8, hexToRGB('#8B6914')],
    [9, hexToRGB('#8B4500')],
    [10, hexToRGB('#5E2605')],
]);

function getTerrainColorForHeight(height, minHeight, maxHeight) {
    return colors.get(Math.trunc(normalize(height, minHeight, maxHeight) * 10.0));
}

export {
    getTerrainColorForHeight,
};
