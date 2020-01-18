import {isPowerOf2, randRange} from "./MathHelpers";
import {Vertex} from "./Vertex";
import {vec3, vec4} from 'gl-matrix';

export class DiamondSquareFractal {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.grid = [[]];
    }

    generateMesh() {
        const vertices = this.#computeVertices();
        const indices = this.#computeIndices();
        this.#computeNormals(vertices, indices);
        computeTextureColors(vertices);

        return {vertices, indices};
    }

    generateGrid(gridSize, seed, noise, randomMin, randomMax) {
        this.gridSize = gridSize;
        const s = gridSize - 1;
        if (!isPowerOf2(s) || randomMin >= randomMax) {
            return;
        }
        this.grid = this.#createGrid(0);
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
        let s0, s1, s2, s3, d0, d1, d2, d3, cn;

        let modNoise = 0.0;
        for (let i = s; i > 1; i /= 2) {
            // reduce the random range at each step
            modNoise = (randomMax - randomMin) * noise * (i / s);

            // diamonds
            for (let y = 0; y < s; y += i) {
                for (let x = 0; x < s; x += i) {
                    s0 = this.grid[x][y];
                    s1 = this.grid[x + i][y];
                    s2 = this.grid[x][y + i];
                    s3 = this.grid[x + i][y + i];

                    // cn
                    this.grid[x + (i / 2)][y + (i / 2)] =
                        ((s0 + s1 + s2 + s3) / 4.0) + randRange(-modNoise, modNoise);
                }
            }
            for (let y = 0; y < s; y += i) {
                for (let x = 0; x < s; x += i) {
                    s0 = this.grid[x][y];
                    s1 = this.grid[x + i][y];
                    s2 = this.grid[x][y + i];
                    s3 = this.grid[x + i][y + i];
                    cn = this.grid[x + (i / 2)][y + (i / 2)];

                    d0 = y <= 0 ? (s0 + s1 + cn) / 3.0 : (s0 + s1 + cn + this.grid[x + (i / 2)][y - (i / 2)]) / 4.0;
                    d1 = x <= 0 ? (s0 + cn + s2) / 3.0 : (s0 + cn + s2 + this.grid[x - (i / 2)][y + (i / 2)]) / 4.0;
                    d2 = x >= s - i ? (s1 + cn + s3) / 3.0 :
                        (s1 + cn + s3 + this.grid[x + i + (i / 2)][y + (i / 2)]) / 4.0;
                    d3 = y >= s - i ? (cn + s2 + s3) / 3.0 :
                        (cn + s2 + s3 + this.grid[x + (i / 2)][y + i + (i / 2)]) / 4.0;

                    this.grid[x + (i / 2)][y] = d0 + randRange(-modNoise, modNoise);
                    this.grid[x][y + (i / 2)] = d1 + randRange(-modNoise, modNoise);
                    this.grid[x + i][y + (i / 2)] = d2 + randRange(-modNoise, modNoise);
                    this.grid[x + (i / 2)][y + i] = d3 + randRange(-modNoise, modNoise);
                }
            }
        }
    }

    #createGrid(defaultValue) {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = defaultValue;
            }
        }
    }

    #computeVertices() {
        const vertices = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                vertices.push(new Vertex(
                    vec3.fromValues(
                        (x - (this.gridSize / 2.0)) * 0.25,
                        this.grid[x][y] / 2.0,
                        (y - (this.gridSize / 2.0)) * 0.25
                    ),
                    vec4.create(),
                    vec3.create()
                ));
            }
        }
        return vertices;
    }

    #computeIndices() {
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

    #computeNormals(vertices, indices) {
        for (let i = 0; i < indices.length; i += 3) {
            const index0 = indices[i];
            const index1 = indices[i + 1];
            const index2 = indices[i + 2];

             const vertex0 = vertices[index0];
             const vertex1 = vertices[index1];
             const vertex2 = vertices[index2];

             const v0 = vec3.min(vec3.create(), vertex0.coordinates, vertex1.coordinates);
             const v1 = vec3.min(vec3.create(), vertex0.coordinates, vertex2.coordinates);

             const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), v0, v1));

            vertex0.normal += normal;
            vertex1.normal += normal;
            vertex2.normal += normal;
        }

        for (Vertex &vertex: *vertices) {
            vertex.normal = glm::normalize(vertex.normal);
        }
    }
}
