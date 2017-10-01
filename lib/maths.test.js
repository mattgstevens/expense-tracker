const Immutable = require('immutable');
const test = require('ava');
const testcheck = require('testcheck');

const maths = require('./maths');

test('maths.calculateTax returns a Map with keys [gross, net, taxes, taxPercent]', t => {
  const mockData = {
    gross: 1000,
    taxPercent: 0.2,
  };

  const expected = Immutable.fromJS({
    gross: mockData.gross,
    taxPercent: mockData.taxPercent,
    net: 800,
    taxes: 200,
  });
  const actual = maths.calculateTax(mockData.gross, mockData.taxPercent);

  t.true(Immutable.Map.isMap(actual));
  expected.forEach((v, k) => t.true(actual.get(k) === v));
});

test('maths.calculateTax throws an error when out of bounds 0 < taxPercent < 1', t => {
  t.throws(() => maths.calculateTax(null, 10));
  t.throws(() => maths.calculateTax(null, -1));
});

test('maths.sum returns the sum of a List of numbers', t => {
  const mockData = [1, 2, 3.5];

  const expected = 6.5;
  const actual = maths.sum(mockData);
  t.true(expected === actual);
});

test('maths.sum testcheck', t => {
  const actual = testcheck.check(
    testcheck.property([testcheck.gen.array(testcheck.gen.int)], list =>
      Number.isInteger(maths.sum(list))
    )
  );

  t.true(actual.result);
});
