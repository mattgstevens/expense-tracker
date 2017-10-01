const Immutable = require('immutable');

// prettyNumber :: Number -> Number
const prettyNumber = number => Math.round(number * 100) / 100;

// calculateTax :: Number -> Number -> Map
const calculateTax = (gross, taxPercent = 0.45) => {
  if (taxPercent > 1 || taxPercent < 0) {
    throw Error('taxPercent must be between 0 & 1');
  }

  const taxes = gross * taxPercent;
  const net = gross - taxes;

  return Immutable.Map({
    gross,
    net,
    taxes,
    taxPercent,
  });
};

// sum :: List<Number> -> Number
const sum = list => prettyNumber(list.reduce((acc, x) => acc + x, 0));

module.exports = {
  calculateTax,
  sum,
};
