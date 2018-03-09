const repl = require('repl')

const util = require('./util')
const reload = require('./reload-required-module')

/* eslint-disable no-param-reassign */
const intializeContext = context => {
  context.reload = moduleName => {
    reload(moduleName || './index')
    intializeContext(context)
  }

  // if we reloaded, update the context refs
  context.Immutable = require('immutable')
  context.moment = require('moment')
  context.expenses = require('./index')
  context.data = context.expenses.loadData()

  // keep context.data up to date for easy access
  const saveData = context.expenses.saveData
  context.expenses.saveData = data => {
    saveData(data)
    context.data = data
  }
}
/* eslint-enable no-param-reassign */

const replServer = repl.start({
  prompt: '(wheres-my-money?) '
})

const startContext = Object.keys(replServer.context)
intializeContext(replServer.context)
// remind repl user what is available in context
console.log(
  'Greetings! Here is what you have in context:\n',
  util.diff(Object.keys(replServer.context), startContext)
)
console.log(
  '\nexpenses has the following exports:\n',
  Object.keys(replServer.context.expenses)
)

// when .clear is entered into repl
replServer.on('reset', intializeContext)
// when .exit, ctrl-C entered twice for SIGINT, or ctrl-D entered for 'end' input stream
replServer.on('exit', () => console.log('\nKeeping on spending and saving'))
