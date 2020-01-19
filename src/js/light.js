'use strict';

export class Light {
    constructor(color, ambientIntensity, direction, diffuseIntensity) {
        this.color = color;
        this.ambientIntensity = ambientIntensity;
        this.direction = direction;
        this.diffuseIntensity = diffuseIntensity;
    }

    useLight(shaderProgram) {
        shaderProgram.setUniform3f('u_DirectionalLight.color', this.color);
        shaderProgram.setUniform1f('u_DirectionalLight.ambientIntensity', this.ambientIntensity);
        shaderProgram.setUniform3f('u_DirectionalLight.direction', this.direction);
        shaderProgram.setUniform1f('u_DirectionalLight.diffuseIntensity', this.diffuseIntensity);
    }
}
