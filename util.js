const last = list => list[list.length - 1]

const diff = (xs, ys) =>
  xs.reduce((acc, x) => {
    if (ys.indexOf(x) === -1) {
      acc.push(x)
    }
    return acc
  }, [])

module.exports = {
  diff,
  last
}
