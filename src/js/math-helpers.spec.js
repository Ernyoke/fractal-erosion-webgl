import {isPowerOf2} from './math-helpers';

describe('math helpers', function () {
    it('should return true in case of a number which is a power of 2', function () {
        expect(isPowerOf2(4)).to.be.equal(true);
    });

    it('should return false in case of a number which is not a power of 2', function () {
        expect(isPowerOf2(5)).to.be.equal(false);
    });
});

