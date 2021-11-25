const { assert } = require('chai');
const { parsePrice } = require('../dist/index');

describe('Price Parsing', () => {
    const price1 = {
        sellKeys: 10,
        buyKeys: 9,
        sellHalfScrap: 12,
        buyHalfScrap: 202,
    };

    const price2 = {
        sellKeys: 84,
        buyKeys: 33,
        sellHalfScrap: 32,
        buyHalfScrap: 34,
    };

    it('(Price1) Sell price should be 10 keys 0.66 ref, buy price 9 keys 11.22 ref', () => {
        assert.deepEqual(parsePrice(price1), {
            sell: { keys: 10, metal: 0.66 },
            buy: { keys: 9, metal: 11.22 },
        });
    });

    it('(Price2) Sell price should be 84 keys 1.77 ref, buy price 33 keys 1.88 ref', () => {
        assert.deepEqual(parsePrice(price2), {
            sell: { keys: 84, metal: 1.77 },
            buy: { keys: 33, metal: 1.88 },
        });
    });
});
