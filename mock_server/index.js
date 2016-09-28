"use strict";

const chokidar = require('chokidar');
const express = require('express');
const micromatch = require('micromatch');
const globby = require('globby');
const extend = require('deep-extend');
const http = require('http');
const path = require('path');

let mockData = {},
    mockHandlers = [],
    defaultCfg = {
      port: 9001,
      mockResources: path.join(__dirname, './mock_resources'),
      mockData: path.join(__dirname, './mock_data')
    };

function tryRequire(name) {
  try {
    // clear the cache, so the json is updated
    delete require.cache[require.resolve(name)];
    return require(name);
  } catch (e) {
    console.warn(e);
    return null;
  }
}

function relativePath (baseDirs, to) {
  return baseDirs.map((base) => {
    return path.relative(base, to);
  }).filter((rel) => {
    return !/\.\./.test(rel);
  }).sort()[0];
}

function start (cfg) {
  // merge configuration
  cfg = extend({}, defaultCfg, (cfg || {}));

  cfg.mockBaseDirs = globby.sync(path.join(cfg.mockData));
  console.log('Watching:', cfg.mockBaseDirs);

  // watch the mock_data directory for json files and keep mock data
  // strctures up to date.
  chokidar.watch(path.join(cfg.mockData, './**/*.json'), {})
    .on('all', (event, jsonPath) => {
      //console.log('\n', event, jsonPath);
      let relPath = relativePath(cfg.mockBaseDirs, jsonPath);
      if(!relPath){
        return;
      }
      //console.log(relPath);

      let dirs = path.dirname(relPath).split(path.sep);
      let data = tryRequire(jsonPath);
      let id = data.id || path.basename(jsonPath, '.json');

      if (data) {
        //console.log(data);
        //console.log(dirs);
        let parent = dirs.reduce((parent, segment) => {
          parent[segment] = parent[segment] || {};
          // walk down to the next level
          return parent[segment];
        }, mockData);

        parent[id] = data;
      } else {
        // TODO: clean up data at this path
      }

      mockHandlers.forEach((aWatchPair) => {
        if( micromatch.isMatch(jsonPath, aWatchPair.pattern) ){
          aWatchPair.fn(jsonPath, data);
        }
      });
    });

  startHttpServer(cfg);
}

function startHttpServer(cfg) {
  let mockApp = express(),
      mockDataRouter = express.Router(),
      server = http.createServer(mockApp);

  let handlerGlob = path.join(cfg.mockData, './**/index.js');

  // watch the mock_data directory for js files that need to be set up
  // as handlers and therefore require replacing the express app.
  chokidar.watch(handlerGlob, {ignoreInitial: true})
    .on('all', (event, jsPath) => {
      console.log(event, jsPath);
      server.close(() => {
        // restart server
        startHttpServer(cfg);
      });
    });


  // TODO: find all the handlers and get them set up
  let handlerPaths = globby.sync(handlerGlob);
  //console.log('Found modules at', handlerPaths);

  mockHandlers = [];
  handlerPaths.forEach( (aPath) => {
    let relPath = relativePath(cfg.mockBaseDirs, aPath);
    //console.log(relPath);

    let dirs = path.dirname(relPath).split(path.sep);
    let aHandler = tryRequire(aPath);

    if (aHandler) {
      //console.log('Found handler module for', aPath);
      let pathPattern = [].concat('', dirs, '').join('/');
      //console.log(pathPattern);
      mockDataRouter.use(pathPattern, aHandler.router || aHandler);
      if(aHandler.watch) {
        (Array.isArray(aHandler.watch)? aHandler.watch : [aHandler.watch])
          .forEach((watchPair) => {
            mockHandlers.push(watchPair);
          });
      }
    }
  });


  // serve provided static files
  if(cfg.static) {
    (Array.isArray(cfg.static)? cfg.static : [cfg.static]).forEach((staticDir) => {
      mockApp.use('/', express.static(staticDir));
    });
  }

  // serve mock resources
  mockApp.use('/', express.static(cfg.mockResources));

  mockApp.use('/',
    // employ the mock handlers
    mockDataRouter,
    // serve up basic json data
    (req, res, next) => {
      console.log('Attempting to get data for', req.path);
      //console.log(mockData);

      let dirs = req.path.split('/').filter((segment) => {
        return !!segment;
      });
      console.log(dirs);
      let data = dirs.reduce((parent, segment) => {
        if(parent && parent[segment]){
          // walk down to the next level
          return parent[segment];
        }
        return undefined;
      }, mockData);

      if (data) {
        return res.json(data);
      }

      return next();
    }
  );

  server.listen(cfg.port);

  return server;
}

if(require.main === module){
  start();
}

module.exports = start;
