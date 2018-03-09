const Immutable = require('immutable')

const tagTemplates = Immutable.fromJS({
  transitPass: ['BVG', '@daily | monthly card | ABO@'],
  ownedExpense: [
    'clothes|electronics',
    'for:@person@',
    'seller:@seller@',
    '?info:@what-did-you-buy@',
    'currency:@currency@'
  ],
  furniture: [
    'furniture',
    'seller:@seller@',
    '?info:@what-did-you-buy@',
    'currency:@currency@'
  ],
  groceries: ['groceries', 'seller:@seller@', 'currency:@currency@'],
  restaurant: [
    'restaurant',
    '@dinner | lunch | snack@',
    '?for:@person@',
    '?holiday',
    '?info:@type-of-food@',
    'currency:@currency@'
  ],
  invest: [
    'invest',
    'amount:@amount-purchase@',
    'asset:@asset-purchased@',
    'currency:@currency@',
    'exchange:@what-exchange@'
  ]
})

const hintTagTemplateRegex = /@(.*)@/

// hintTagTemplate :: List<Tag> -> List<TagHints>
const hintTagTemplate = tagTemplate =>
  Immutable.List(
    tagTemplate.reduce((acc, tag) => {
      const result = hintTagTemplateRegex.exec(tag)
      if (result) {
        acc.push(result[1])
      }
      return acc
    }, [])
  )

module.exports = {
  hintTagTemplate
}
