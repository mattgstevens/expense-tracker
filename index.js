const fs = require('fs');
const Immutable = require('immutable');

const maths = require('./lib/maths');

// Data Api

// addMonth :: String -> Map -> Map
const addMonth = (month, data) => (
  data.set(month, Immutable.List())
);

// addExpensesForMonth :: List -> String -> Map -> Map
const addExpensesForMonth = (costs, month, data) => {
  if (!data.has(month)) {
    data = addMonth(month, data); // eslint-disable-line no-param-reassign
  }

  // allow single expense to be added
  if (!Array.isArray(costs) && !Immutable.List.isList(costs) && !isNaN(costs)) {
    costs = [costs]; // eslint-disable-line no-param-reassign
  }

  const update = data.get(month).concat(costs);
  return data.setIn([month], update);
};

// sumAllMonths :: Map -> Map
//
// monthSet: Map(k, v) => k(Keyword month), v(Map of named costs)
const sumAllMonths = (monthSet) => (
  monthSet.reduce((acc, expenses, month) => (
    acc.set(month, maths.sum(expenses))
  ), Immutable.Map())
);

// Data Persistence

// saveData :: Map -> IO effect
const saveData = (data) => {
  fs.writeFileSync('./data.json', JSON.stringify(data));
};

// loadData :: _ -> Map
const loadData = () => (
  Immutable.fromJS(JSON.parse(
    fs.readFileSync('./data.json', { encoding: 'utf8' })
  ))
);

// Main
(function main() {
  if (process.env.NODE_ENV !== 'cli') { return; }
  console.log(sumAllMonths(loadData())); // eslint-disable-line no-console
}());

module.exports = {
  // data api
  addExpensesForMonth,
  addMonth,
  sumAllMonths,

  // persistance
  loadData,
  saveData,
};
