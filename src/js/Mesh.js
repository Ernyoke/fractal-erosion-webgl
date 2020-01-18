export class Mesh {
    constructor(vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
    }

    get vertexData() {
        const data = [];
        for (const element of this.vertices) {
            data.push(...element.coordinates);
            data.push(...element.normal);
            data.push(...element.color);
        }
        return data;
    }

    get indexData() {
        return this.indices;
    }
}