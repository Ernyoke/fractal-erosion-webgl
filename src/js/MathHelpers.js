function radians(angle) {
    return angle * Math.PI / 180;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function minMax(array, compareFn) {
    if (!array || array.length < 0) {
        return {};
    }
    const result = {
        min: array[0],
        max: array[0]
    };
    for (const element of array) {
        if (compareFn(result.max, element) < 0) {
            result.max = element;
        }
        if (compareFn(result.min, element) > 0) {
            result.min = element;
        }
    }
    return result;
}

export {
    radians,
    isPowerOf2,
    randRange,
    normalize,
    minMax
}
