'use strict';
const chai = require('chai');

it('init', () => {
    const a = 2;
    const b = 2;

    const result = a + b;

    chai.expect(result).to.be.eq(4);
});
