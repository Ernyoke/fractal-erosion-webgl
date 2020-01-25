'use strict';

import {Vertex} from './vertex';
import {Mesh} from './mesh';
import {getTerrainColorForHeight} from './material-helper';

import {isPowerOf2, randRange, minMax} from './math-helpers';
import {vec3, vec4} from 'gl-matrix';

export class DiamondSquareFractal {
    constructor() {
        this.grid = [[]];
    }

    async generateMesh() {
        const vertices = this.computeVertices();
        const indices = this.computeIndices();
        this.computeNormals(vertices, indices);
        this.computeTextureColors(vertices);

        return new Mesh(vertices, indices);
    }

    async generateGrid(gridSize, noise, randomMin = 0.0, randomMax = 40.0) {
        this.gridSize = gridSize;
        const s = gridSize - 1;
        if (!isPowerOf2(s) || randomMin >= randomMax) {
            return;
        }
        this.grid = this.createGrid(0);
        /*
         * Use temporary named variables to simplify equations
         *
         * s0 . d0. s1
         *  . . . . .
         * d1 . cn. d2
         *  . . . . .
         * s2 . d3. s3
         *
         * */
        for (let i = s; i > 1; i /= 2) {
            // reduce the random range at each step
            const modNoise = (randomMax - randomMin) * noise * (i / s);

            // diamonds
            for (let y = 0; y < s; y += i) {
                for (let x = 0; x < s; x += i) {
                    const s0 = this.grid[x][y];
                    const s1 = this.grid[x + i][y];
                    const s2 = this.grid[x][y + i];
                    const s3 = this.grid[x + i][y + i];

                    // cn
                    this.grid[x + (i / 2)][y + (i / 2)] =
                        ((s0 + s1 + s2 + s3) / 4.0) + randRange(-modNoise, modNoise);
                }
            }
            for (let y = 0; y < s; y += i) {
                for (let x = 0; x < s; x += i) {
                    const s0 = this.grid[x][y];
                    const s1 = this.grid[x + i][y];
                    const s2 = this.grid[x][y + i];
                    const s3 = this.grid[x + i][y + i];
                    const cn = this.grid[x + (i / 2)][y + (i / 2)];

                    const d0 = y <= 0 ? (s0 + s1 + cn) / 3.0 :
                        (s0 + s1 + cn + this.grid[x + (i / 2)][y - (i / 2)]) / 4.0;
                    const d1 = x <= 0 ? (s0 + cn + s2) / 3.0 :
                        (s0 + cn + s2 + this.grid[x - (i / 2)][y + (i / 2)]) / 4.0;
                    const d2 = x >= s - i ? (s1 + cn + s3) / 3.0 :
                        (s1 + cn + s3 + this.grid[x + i + (i / 2)][y + (i / 2)]) / 4.0;
                    const d3 = y >= s - i ? (cn + s2 + s3) / 3.0 :
                        (cn + s2 + s3 + this.grid[x + (i / 2)][y + i + (i / 2)]) / 4.0;

                    this.grid[x + (i / 2)][y] = d0 + randRange(-modNoise, modNoise);
                    this.grid[x][y + (i / 2)] = d1 + randRange(-modNoise, modNoise);
                    this.grid[x + i][y + (i / 2)] = d2 + randRange(-modNoise, modNoise);
                    this.grid[x + (i / 2)][y + i] = d3 + randRange(-modNoise, modNoise);
                }
            }
        }
    }

    createGrid(defaultValue) {
        const grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                grid[i][j] = defaultValue;
            }
        }
        return grid;
    }

    computeVertices() {
        const vertices = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                vertices.push(new Vertex(
                    vec3.fromValues(
                        (x - (this.gridSize / 2.0)) * 0.25,
                        this.grid[x][y] / 2.0,
                        (y - (this.gridSize / 2.0)) * 0.25,
                    ),
                    vec4.create(),
                    vec3.create(),
                ));
            }
        }
        return vertices;
    }

    computeIndices() {
        const indices = [];
        for (let y = 0; y < this.gridSize - 1; y++) {
            for (let x = 0; x < this.gridSize - 1; x++) {
                // tl - - tr
                //  | \   |
                //  |   \ |
                // bl - - br

                const tl = x + (y) * this.gridSize;
                const tr = (x + 1) + (y) * this.gridSize;
                const bl = x + (y + 1) * this.gridSize;
                const br = (x + 1) + (y + 1) * this.gridSize;

                // indices for first triangle
                indices.push(tl);
                indices.push(br);
                indices.push(bl);

                // indices for 2nd triangle
                indices.push(tl);
                indices.push(tr);
                indices.push(br);
            }
        }
        return indices;
    }

    computeNormals(vertices, indices) {
        for (let i = 0; i < indices.length; i += 3) {
            const index0 = indices[i];
            const index1 = indices[i + 1];
            const index2 = indices[i + 2];

            const vertex0 = vertices[index0];
            const vertex1 = vertices[index1];
            const vertex2 = vertices[index2];

            const v0 = vec3.subtract(vec3.create(), vertex0.coordinates, vertex1.coordinates);
            const v1 = vec3.subtract(vec3.create(), vertex0.coordinates, vertex2.coordinates);

            const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), v0, v1));

            vec3.add(vertex0.normal, vertex0.normal, normal);
            vec3.add(vertex1.normal, vertex1.normal, normal);
            vec3.add(vertex2.normal, vertex2.normal, normal);
        }

        for (const vertex of vertices) {
            vec3.normalize(vertex.normal, vertex.normal);
        }
    }

    computeTextureColors(vertices) {
        const minmax = minMax(vertices, (a, b) => a.coordinates[1] - b.coordinates[1]);
        for (const vertex of vertices) {
            vertex.color = getTerrainColorForHeight(
                vertex.coordinates[1],
                minmax.min.coordinates[1],
                minmax.max.coordinates[1]);
        }
    }

    async applyThermalErosion() {
        let peak = this.grid[0][0];
        let low = this.grid[0][0];

        // look for the highest point
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] > peak) {
                    peak = this.grid[i][j];
                }
                if (this.grid[i][j] < low) {
                    low = this.grid[i][j];
                }
            }
        }
        const erosionHeight = (peak - low) / 1000.0;
        this.applyThermalErosionTonNeighbour(erosionHeight);
    }

    applyThermalErosionTonNeighbour(erosionHeight) {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                for (let i = -1; i <= 1; i++) {
                    const positionX = x;
                    const positionY = y;
                    for (let j = -1; j <= 1; j++) {
                        // check if neighbour is inside the matrix
                        if (positionX + i >= 0 &&
                            positionX + i < this.gridSize &&
                            positionY + j >= 0 &&
                            positionY + j < this.gridSize) {
                            // check if material needs to be moved to the neighbour
                            if (this.grid[positionX + i][positionY + j] < this.grid[positionX][positionY]) {
                                this.grid[positionX + i][positionY + j] += erosionHeight;
                                this.grid[positionX][positionY] -= erosionHeight;
                            }
                        }
                    }
                }
            }
        }
    }

    async applyHydraulicErosion(quantity, sedimentFactor) {
        const peaks = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (this.isPeak(this.grid[x][y], x, y, true)) {
                    peaks.push(new Peak(this.grid[x][y], x, y));
                }
            }
        }

        const gridChecked = this.createGrid(false);
        const waterQuantity = this.createGrid(quantity);
        const sedimentQuantity = this.createGrid(quantity * sedimentFactor);

        for (const peak of peaks) {
            this.applyHydraulicErosionFromPeak(peak, gridChecked, sedimentFactor, waterQuantity, sedimentQuantity);
        }
    }

    isPeak(value, x, y, upper) {
        let isPeak = true;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // check if neighbour is inside the matrix
                if (x + i >= 0 &&
                    x + i < this.gridSize &&
                    y + j >= 0 &&
                    y + j < this.gridSize) {
                    if (upper) {
                        if (this.grid[x + i][y + j] > value) {
                            isPeak = false;
                        }
                    } else {
                        if (this.grid[x + i][y + j] < value) {
                            isPeak = false;
                        }
                    }
                }
            }
        }
        return isPeak;
    }

    applyHydraulicErosionFromPeak(peak, gridChecked, sedimentFactor, waterQuantity, sedimentQuantity) {
        gridChecked[peak.x][peak.y] = true;

        const neighbourCount = this.countNeighbours(peak);
        if (neighbourCount === 0) {
            return;
        }

        const kd = 0.1;
        const kc = 5.0;
        const ks = 0.3;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (peak.x + i >= 0 &&
                    peak.x + i < this.gridSize &&
                    peak.y + j >= 0 &&
                    peak.y + j < this.gridSize) {
                    if (!(i === 0 || j === 0)) {
                        continue;
                    }
                    // we do this only if the peak is higher
                    if (this.grid[peak.x][peak.y] > this.grid[peak.x + i][peak.y + j]) {
                        if (!this.isMargin(peak, i, j)) {
                            // 1. Move water from the peak to the neighbours
                            const height = this.grid[peak.x][peak.y];
                            const neighbourHeight = this.grid[peak.x + i][peak.y + j];
                            const wt = this.moveWater(height, neighbourHeight, waterQuantity[peak.x][peak.y],
                                waterQuantity[peak.x + i][peak.y + j]);

                            if (wt > 0) {
                                waterQuantity[peak.x][peak.y] -= wt;
                                waterQuantity[peak.x + i][peak.y + j] += wt;

                                // 2. Move sediment to the neighbours
                                this.grid[peak.x][peak.y] -= wt * sedimentFactor;
                                this.grid[peak.x + i][peak.y + j] += wt * sedimentFactor;
                                const cs = kc * wt;

                                if (sedimentQuantity[peak.x][peak.y] >= cs) {
                                    sedimentQuantity[peak.x + i][peak.y + j] += cs;
                                    this.grid[peak.x][peak.y] += kd * (sedimentQuantity[peak.x][peak.y] - cs);
                                    sedimentQuantity[peak.x][peak.y] = (1 - kd) *
                                        (sedimentQuantity[peak.x][peak.y] - cs);
                                } else {
                                    sedimentQuantity[peak.x + i][peak.y + j] +=
                                        sedimentQuantity[peak.x][peak.y] +
                                        ks * (cs - sedimentQuantity[peak.x][peak.y]);
                                    this.grid[peak.x][peak.y] += -ks * (cs - sedimentQuantity[peak.x][peak.y]);
                                    sedimentQuantity[peak.x][peak.y] = 0;
                                }
                            } else {
                                this.grid[peak.x][peak.y] += ks * sedimentQuantity[peak.x][peak.y];
                            }
                        } else {
                            waterQuantity[peak.x + i][peak.y + j] = 0;
                            sedimentQuantity[peak.x + i][peak.y + j] = 0;
                        }
                        if (!gridChecked[peak.x + i][peak.y + j]) {
                            this.applyHydraulicErosionFromPeak(new Peak(
                                this.grid[peak.x + i][peak.y + j],
                                peak.x + i,
                                peak.y + j), gridChecked, sedimentFactor, waterQuantity, sedimentQuantity);
                        }
                    }
                }
            }
        }
    }

    countNeighbours(peak) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (peak.x + i >= 0 &&
                    peak.x + i < this.gridSize &&
                    peak.y + j >= 0 &&
                    peak.y + j < this.gridSize) {
                    if (this.grid[peak.x + i][peak.y + j] < this.grid[peak.x][peak.y]) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    isMargin(peak, i, j) {
        return peak.x + i === 0 ||
            peak.x + i === this.gridSize ||
            peak.y + j === 0 ||
            peak.y + j === this.gridSize;
    }

    moveWater(height, neighbourHeight, waterQuantity, waterQuantityNeighbour) {
        return Math.min(waterQuantity, (waterQuantity + height) - (waterQuantityNeighbour + neighbourHeight));
    }
}

class Peak {
    constructor(value, x, y) {
        this._value = value;
        this._x = x;
        this._y = y;
    }

    get value() {
        return this._value;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }
}
