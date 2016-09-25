const fs = require('fs');
const Immutable = require('immutable');
const moment = require('moment');

const maths = require('./lib/maths');

//
// Data Records
//

// immutable record doesnt set defaults when a value is present and it is nil
const ExpenseRecord = Immutable.Record({
  cost: 0,
  date: moment().format('YYYYMMDD'),
  tags: Immutable.List(),
});

// createExpenseRecord :: [Map | Object] -> ExpenseRecord
const createExpenseRecord = (expense) => (
  Immutable.Map.isMap(expense) ? (
    ExpenseRecord({
      cost: expense.get('cost') || 0,
      date: expense.get('date') || moment().format('YYYYMMDD'),
      tags: expense.has('tags') ? Immutable.List(expense.get('tags')) : Immutable.List(),
    })
  ) : (
    ExpenseRecord({
      cost: expense.cost || 0,
      date: expense.date || moment().format('YYYYMMDD'),
      tags: expense.tags ? Immutable.List(expense.tags) : Immutable.List(),
    })
  )
);

//
// Data Api
//

// expenseListCreateWithGroupInfo :: List -> Map -> List<ExpenseRecord>
const expenseListCreateWithGroupInfo = (costs, groupInfo) => (
  Immutable.List(costs.map((cost) => createExpenseRecord({
    cost,
    date: groupInfo.date,
    tags: groupInfo.tags,
  })))
);

// expenseListUpdateWithTags :: List<ExpenseRecord> -> List -> List<ExpenseRecord>
const expenseListUpdateWithTags = (expenseList, tags) => (
  expenseList.map((expense) => (
    expense.set('tags', expense.get('tags').concat(tags))
  ))
);

// TODO: max, min, average costs, => by tag, by day of week, by month

const expenseListGroupByMonth = (expenseList) => (
  expenseList.reduce((acc, expense) => {
    const dateKey = moment(expense.get('date')).format('YYYYMM');
    return (acc.has(dateKey))
      ? acc.set(dateKey, acc.get(dateKey).push(expense))
      : acc.set(dateKey, Immutable.List.of(expense));
  }, Immutable.Map())
);

// sumAllMonths :: List<ExpenseRecord> -> Map[month: costSum]
const expenseListSumByMonth = (expenseList) => (
  expenseListGroupByMonth(expenseList).map((expenseListForMonth) => (
    maths.sum(expenseListForMonth.map((expense) => expense.get('cost')))
  ))
);

//
// Storage Api
//

// saveData :: Map -> IO effect
const saveData = (data) => {
  fs.writeFileSync('./data.json', JSON.stringify(data));
};

// loadData :: _ -> Map
const loadData = () => (
  Immutable.fromJS(JSON.parse(
    fs.readFileSync('./data.json', { encoding: 'utf8' }).replace(/\n/g, '').trim() || '{}'
  ).map((expense) => createExpenseRecord(expense)))
);

module.exports = {
  // Data Records
  ExpenseRecord,
  createExpenseRecord,

  // Data Api
  expenseListCreateWithGroupInfo,
  expenseListGroupByMonth,
  expenseListSumByMonth,
  expenseListUpdateWithTags,

  // Storage Api
  loadData,
  saveData,
};
