function radians(angle) {
    return angle * Math.PI / 180;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

export {
    radians,
    isPowerOf2,
    randRange
}
