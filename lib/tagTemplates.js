const Immutable = require('immutable')

const tagTemplates = Immutable.fromJS({
  groceries: ['groceries', 'seller:@seller@', 'currency:@currency@'],
  restaurant: [
    'restaurant',
    'type-of-food:@type-of-food@',
    '@dinner|lunch@',
    '?for:@person@'
  ],
  clothes: [
    'clothes',
    'for:@person@',
    'seller:@seller@',
    'info:@what-did-you-buy@'
  ],
  investBTC: [
    '@currency@->BTC',
    'exchange:@exchange@',
    '@amount-BTC@BTC',
    'currency:@currency@'
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
