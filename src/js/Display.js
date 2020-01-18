import {DiamondSquareFractal} from "./DiamondSquareFractal";
import {Terrain} from "./Terrain";

export class Display {
    constructor(gl) {
        this.gl = gl;

        this.gridSize = 7;
        this.seed = 25;
        this.roughness = 5;
        this.fractal = new DiamondSquareFractal();

        this.terrain = null;
    }

    initialize() {
        this.fractal.generateGrid(Math.pow(2, this.gridSize) + 1, this.seed, this.roughness /  5.0);
        this.loadTerrain();
    }

    loadTerrain() {
        const mesh = this.fractal.generateMesh();
        const rotationAngle =  this.terrain ? this.terrain.rotationAngle : 0.0;
        this.terrain = new Terrain(this.gl, mesh, rotationAngle);
    }
}