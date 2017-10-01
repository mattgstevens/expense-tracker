const Immutable = require('immutable')
const test = require('ava')

const tagTemplates = require('./tagTemplates')

test('tags.hintTagTemplate', t => {
  const tagTemplate = ['seller:@seller@', 'nfa', 'for:@person@']

  const expected = Immutable.List(['seller', 'person'])
  const actual = tagTemplates.hintTagTemplate(tagTemplate)

  t.true(Immutable.is(actual, expected))
})
