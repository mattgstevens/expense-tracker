const Immutable = require('immutable')
const test = require('ava')

const expenses = require('./index')

test('expenses.createExpenseRecord will ensure tags are an Immutable.Set', t => {
  // Wish there was a better way to do this, Immutable.Record only guarantees keys & default values
  const mockData = {
    cost: 1,
    date: '2020-01-01',
    tags: ['dinner']
  }

  const actual = expenses.createExpenseRecord(mockData)
  const expected = expenses.ExpenseRecord({
    cost: mockData.cost,
    date: mockData.date,
    tags: Immutable.Set(['currency:EUR'].concat(mockData.tags))
  })

  t.true(Immutable.is(actual, expected))
})

test('expenses.createExpenseRecord will work without tags', t => {
  const mockData = {
    cost: 1,
    date: '2020-01-01'
  }

  const actual = expenses.createExpenseRecord(mockData)
  const expected = expenses.ExpenseRecord({
    cost: mockData.cost,
    date: mockData.date,
    tags: Immutable.Set()
  })
  t.true(Immutable.is(actual, expected))
})

test('expenses.expenseListCreateWithGroupInfo', t => {
  const mockData = {
    cost: 1,
    groupInfo: {
      date: '2020-01-01',
      tags: ['dinner', 'indian']
    }
  }

  const expected = Immutable.List.of(
    expenses.createExpenseRecord({
      cost: mockData.cost,
      date: mockData.groupInfo.date,
      tags: mockData.groupInfo.tags
    })
  )
  const actual = expenses.expenseListCreateWithGroupInfo(
    [mockData.cost],
    mockData.groupInfo
  )
  t.true(Immutable.is(actual, expected))
})

test('expenses.expenseListGroupByMonth', t => {
  const mockData = Immutable.List.of(
    expenses.createExpenseRecord({ cost: 1, date: '2020-01-01' }),
    expenses.createExpenseRecord({ cost: 1, date: '2020-02-01' })
  )

  const actual = expenses.expenseListGroupByMonth(mockData)
  const expected = Immutable.Map({
    '2020-01': Immutable.List.of(
      expenses.createExpenseRecord({ cost: 1, date: '2020-01-01' })
    ),
    '2020-02': Immutable.List.of(
      expenses.createExpenseRecord({ cost: 1, date: '2020-02-01' })
    )
  })
  t.true(Immutable.is(actual, expected))
})

test('expenses.expenseListSumByMonth', t => {
  const mockData = Immutable.List.of(
    expenses.createExpenseRecord({ cost: 1, date: '2020-01-01' }),
    expenses.createExpenseRecord({ cost: 1, date: '20200105' })
  )
  const actual = expenses.expenseListSumByMonth(mockData)
  const expected = Immutable.Map({
    '2020-01': 2
  })

  actual.forEach((v, k) => t.true(expected.get(k) === v))
})

test('expenses.expenseListUpdateWithTags', t => {
  const mockData = {
    expenseList: Immutable.List.of(
      expenses.createExpenseRecord({
        cost: 1,
        date: '2020-01-01',
        tags: ['groceries']
      })
    ),
    tags: ['neu bio GMO']
  }
  const actual = expenses.expenseListUpdateWithTags(
    mockData.expenseList,
    mockData.tags
  )
  const expected = Immutable.List.of(
    expenses.createExpenseRecord({
      cost: 1,
      date: '2020-01-01',
      tags: ['groceries', 'neu bio GMO']
    })
  )
  t.true(actual.equals(expected))
})
