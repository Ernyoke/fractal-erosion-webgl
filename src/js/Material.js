export class Material {
    constructor(specularIntensity, shininess) {
        this.specularIntensity = specularIntensity;
        this.shininess = shininess;
    }

    useMaterial(shaderProgram) {
        shaderProgram.setUniform1f("u_Material.specularIntensity", this.specularIntensity);
        shaderProgram.setUniform1f("u_Material.shininess", this.shininess);
    }
}
