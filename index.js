const fs = require('fs')
const Immutable = require('immutable')
const moment = require('moment')

const maths = require('./lib/maths')
const tagTemplates = require('./lib/tagTemplates')

const defaultDataFile = './data.json'

//
// Data Records
//

const defaultCurrencyTag = 'currency:EUR'
const currencyTagRegExp = /^currency:[A-Z]+$/

const dateFormat = 'YYYY-MM-DD'

// hasCurrencyTag :: List<Tag> -> Bool
const hasCurrencyTag = tagList =>
  tagList.find(tag => currencyTagRegExp.test(tag)) !== undefined

// immutable record doesnt set defaults when a value is present and it is nil
const ExpenseRecord = Immutable.Record({
  cost: 0,
  date: moment().format(dateFormat),
  tags: Immutable.List([defaultCurrencyTag])
})

// createExpenseRecord :: [Map | Object] -> ExpenseRecord
const createExpenseRecord = (expense = {}) => {
  let expenseRecord = Immutable.Map.isMap(expense)
    ? ExpenseRecord({
        cost: expense.get('cost') || 0,
        date: (moment(expense.get('date')) || moment()).format(dateFormat),
        tags: expense.has('tags')
          ? Immutable.Set(expense.get('tags'))
          : Immutable.Set()
      })
    : ExpenseRecord({
        cost: expense.cost || 0,
        date: (moment(expense.date) || moment()).format(dateFormat),
        tags: expense.tags ? Immutable.Set(expense.tags) : Immutable.Set()
      })

  const tagList = expenseRecord.get('tags')
  if (!tagList.isEmpty() && !hasCurrencyTag(tagList)) {
    expenseRecord = expenseRecord.set('tags', tagList.add(defaultCurrencyTag))
  }

  return expenseRecord
}

//
// Data Api
//

// expenseListCreateWithGroupInfo :: List -> Map -> List<ExpenseRecord>
const expenseListCreateWithGroupInfo = (costs, groupInfo) =>
  Immutable.List(
    costs.map(cost =>
      createExpenseRecord({
        cost,
        date: groupInfo.date,
        tags: groupInfo.tags
      })
    )
  )

// expenseListUpdateWithTags :: List<ExpenseRecord> -> List -> List<ExpenseRecord>
const expenseListUpdateWithTags = (expenseList, tags) =>
  expenseList.map(expense =>
    expense.set('tags', expense.get('tags').concat(tags))
  )

// TODO: max, min, average costs, => by tag, by day of week, by month

const expenseListGroupByMonth = expenseList =>
  expenseList.reduce((acc, expense) => {
    const dateKey = moment(expense.get('date')).format('YYYY-MM')
    return acc.has(dateKey)
      ? acc.set(dateKey, acc.get(dateKey).push(expense))
      : acc.set(dateKey, Immutable.List.of(expense))
  }, Immutable.Map())

// sumAllMonths :: List<ExpenseRecord> -> Map[month: costSum]
const expenseListSumByMonth = expenseList =>
  expenseListGroupByMonth(expenseList).map(expenseListForMonth =>
    maths.sum(expenseListForMonth.map(expense => expense.get('cost')))
  )

//
// Storage Api
//

// saveData :: Map -> IO effect
const saveData = (data, filePath = defaultDataFile) => {
  fs.writeFileSync(filePath, JSON.stringify(data))
}

// loadData :: _ -> Map
const loadData = () =>
  Immutable.fromJS(
    JSON.parse(
      fs
        .readFileSync(defaultDataFile, { encoding: 'utf8' })
        .replace(/\n/g, '')
        .trim() || '{}'
    ).map(expense => createExpenseRecord(expense))
  )

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
  saveData
}
