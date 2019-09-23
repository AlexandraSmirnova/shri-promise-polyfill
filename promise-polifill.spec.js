global.Promise = undefined;

const { Promise } = require("./promise-polyfill");

describe('test then', () => {
    test('test resolve', async () => {
        const result = await new Promise((resolve) => resolve(1))
            .then((val) => val);

        expect(result).toBe(1);
    });

    test('test chain resolve', async () => {
        const result = await new Promise((resolve) => resolve(1))
            .then((val) => val + 5)
            .then((val) => val + 1);

        expect(result).toBe(7);
    });

    test('test with timeout', async () => {
        const result = await new Promise((resolve) => {
            setTimeout(resolve(1), 1000)
        })
            .then((val) => val + 5)

        expect(result).toBe(6);
    });

    test('test chain with Promise in then', async () => {
        const result = await new Promise((resolve) => {
            setTimeout(resolve(1), 1000)
        })
            .then((val) => val + 5)
            .then((val) => {
                return new Promise((resolve) => resolve(1000))
            })

        expect(result).toBe(1000);
    });
})

describe('test constructor', () => {
    test('test pass null in constractor', async () => {
        expect(() => new Promise(null)).toThrow(
            new TypeError('Promise resolver null is not a function')
        );
    });

    test('test pass undefined in constractor', async () => {
        expect(() => new Promise(undefined)).toThrow(
            new TypeError('Promise resolver undefined is not a function')
        );
    });

    test('test pass number in constractor', async () => {
        expect(() => new Promise(1)).toThrow(
            new TypeError('Promise resolver 1 is not a function')
        );
    });

    test('test pass string in constractor', async () => {
        expect(() => new Promise('function')).toThrow(
            new TypeError('Promise resolver function is not a function')
        );
    });

    test('test pass object in constractor', async () => {
        expect(() => new Promise({})).toThrow(
            new TypeError('Promise resolver [object Object] is not a function')
        );
    });
})

describe('test then errors', () => {
    test('test error in resolver', async () => {
        const result = await new Promise((resolve) => {
            throw new Error(1);
        })
            .then(() => 'resolve', () => 'reject');

        expect(result).toBe('reject');
    });

    test('test error in then', async () => {
        const result = await new Promise((resolve) => resolve(1))
            .then(() => {
                throw new Error();
            })
            .then(() => 'resolve', () => 'reject');

        expect(result).toBe('reject')
    });
});