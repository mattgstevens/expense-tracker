const Immutable = require('immutable');
const test = require('ava');

const expenses = require('./index');

const mockMonths = () => (Immutable.fromJS({
  201603: [1, 2, 3],
  201604: [5, 6, 7],
}));

test('expenses.addExpensesForMonth returns a Immutable.Map with new month added as a key and Immutable.list of costs as value', (t) => { // eslint-disable-line max-len
  const mockInput = {
    costs: [1, 2, 3],
    month: '202001',
  };

  const expected = Immutable.fromJS({
    202001: Immutable.List([1, 2, 3]),
  });
  const actual = expenses.addExpensesForMonth(mockInput.costs, mockInput.month, Immutable.Map());
  t.true(Immutable.Map.isMap(actual));
  t.true(Immutable.is(expected, actual));
});

test('expenses.addMonth returns a Immutable.Map with the new month added as a key and an empty Immutable.List as value', (t) => { // eslint-disable-line max-len
  const newMonth = '202001';
  const actual = expenses.addMonth(newMonth, mockMonths());
  t.true(Immutable.Map.isMap(actual));
  t.true(Immutable.List.isList(actual.get(newMonth)));
  t.true(actual.get(newMonth).isEmpty());
});

test('expenses.sumAllMonths returns Immutable.Map with keys as months and values as summed month expenses', (t) => { // eslint-disable-line max-len
  const expected = Immutable.fromJS({
    201603: 6,
    201604: 18,
  });
  const actual = expenses.sumAllMonths(mockMonths());

  t.true(Immutable.Map.isMap(actual));
  expected.forEach((v, k) => (
    t.true(actual.get(k) === v)
  ));
});

test('expenses.createExpenseListWithGroupInfo', (t) => {
  const mockData = {
    costs: [1],
    groupInfo: {
      date: '202001',
      tags: ['dinner', 'indian'],
    },
  };

  const expected = Immutable.List([new expenses.ExpenseRecord({
    cost: mockData.costs[0],
    date: mockData.groupInfo.date,
    tags: mockData.groupInfo.tags,
  })]);
  const actual = expenses.createExpenseListWithGroupInfo(mockData.costs, mockData.groupInfo);
  t.true(Immutable.is(actual, expected));
});
