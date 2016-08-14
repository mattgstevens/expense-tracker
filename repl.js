const repl = require('repl');

const last = (list) => (list[list.length - 1]);

const readModuleId = (moduleRef) => (
  moduleRef.id === '.' ? moduleRef.filename : moduleRef.id
);

// remove from module _pathCache as file paths may have changed
// TODO: the _pathCache is potentially false positive removals for common names like index.js
const cleanModulePathCache = (moduleRef) => {
  const moduleFilename = last(moduleRef.filename.split('/'));
  Object.keys(module.constructor._pathCache).forEach((cacheKey) => { // eslint-disable-line no-underscore-dangle, max-len
    if (cacheKey.indexOf(moduleFilename) !== -1) {
      delete module.constructor._pathCache[cacheKey]; // eslint-disable-line no-underscore-dangle
    }
  });
};

const cleanModuleRequireCache = (moduleRef) => {
  // find all children of the module
  const cacheEntry = require.cache[readModuleId(moduleRef)];
  if (!cacheEntry) return;

  cacheEntry.children.forEach(
    (child) => cleanModuleRequireCache(child)
  );
  // remove the module from cache
  delete require.cache[moduleRef.id];
};

// inspired by
// http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate
const cleanModuleCache = (moduleRef) => {
  cleanModuleRequireCache(moduleRef);
  cleanModulePathCache(moduleRef);
};

const reload = (moduleName) => {
  const cacheId = require.resolve(moduleName);
  if (cacheId) cleanModuleCache(require.cache[cacheId]);
  require(moduleName); // eslint-disable-line global-require
};

/* eslint-disable no-param-reassign */
const intializeContext = (context) => {
  context.reload = (moduleName) => {
    reload(moduleName || '.');
    intializeContext(context);
  };

  // if we reloaded, get the latest
  context.Immutable = require('immutable'); // eslint-disable-line global-require
  context.moment = require('moment'); // eslint-disable-line global-require

  context.expenses = require('./index'); // eslint-disable-line global-require
  context.data = context.expenses.loadData();

  // keep context.data up to date for easy access
  const saveData = context.expenses.saveData;
  context.expenses.saveData = (data) => {
    saveData(data);
    context.data = data;
  };
};
/* eslint-enable no-param-reassign */

const replServer = repl.start({
  prompt: '(wheres-my? $ €) ',
});
intializeContext(replServer.context);
// when .clear is entered into repl
replServer.on('reset', intializeContext);
