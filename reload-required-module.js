const util = require('./util')

const DEBUG = false
const log = (...x) => {
  if (DEBUG) console.log('\nDEBUG reload-required-module ::', ...x)
}

const readModuleId = moduleRef =>
  moduleRef.id === '.' ? moduleRef.filename : moduleRef.id

// remove from module _pathCache as file paths may have changed
// TODO: the _pathCache is potentially false positive removals for common names like index.js
const cleanModulePathCache = moduleRef => {
  const moduleFilename = util.last(moduleRef.filename.split('/'))
  Object.keys(module.constructor._pathCache).forEach(cacheKey => {
    // eslint-disable-line no-underscore-dangle, max-len
    if (cacheKey.indexOf(moduleFilename) !== -1) {
      delete module.constructor._pathCache[cacheKey] // eslint-disable-line no-underscore-dangle
    }
  })
}

const cleanModuleRequireCache = moduleRef => {
  log('moduleRef', moduleRef)
  // find all children of the module
  const cacheEntry = require.cache[readModuleId(moduleRef)]
  if (!cacheEntry) return

  cacheEntry.children.forEach(child => cleanModuleRequireCache(child))
  // remove the module from cache
  delete require.cache[moduleRef.id]
}

// inspired by
// http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate
const cleanModuleCache = moduleRef => {
  if (!moduleRef) return
  cleanModuleRequireCache(moduleRef)
  cleanModulePathCache(moduleRef)
}

const reload = moduleName => {
  const cacheId = require.resolve(moduleName)
  log('cacheId', cacheId)
  if (cacheId) cleanModuleCache(require.cache[cacheId])
  require(moduleName) // eslint-disable-line global-require
}

module.exports = reload
