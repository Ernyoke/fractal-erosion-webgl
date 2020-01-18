export class Vertex {
    constructor(coordinates, color, normal) {
        this._coordinates = coordinates;
        this._color = coordinates;
        this._normal = coordinates;
    }

    set coordinates(coordinates) {
        this._coordinates = coordinates;
    }

    get coordinates() {
        return this._coordinates;
    }

    set color(color) {
        this._color = color;
    }

    get color() {
        return this._color;
    }

    set normal(normal) {
        this._normal = normal;
    }

    get normal() {
        return this._normal;
    }
}
