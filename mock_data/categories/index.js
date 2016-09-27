"use strict";

const chokidar = require('chokidar');
const path = require('path');

const idToCategory = {};
const categoryLists = {};
let lastUpdate;

function tryRequire(name) {
  try {
    return require(name);
  } catch (e) {
    console.warn(e);
    return null;
  }
}

// watch the mock_data/articles directory for json files and keep mock data
// strctures up tp date.
chokidar.watch('../articles/*.json', {})
  .on('all', (event, articlePath) => {
    console.log(event, articlePath);
    let article = tryRequire(articlePath);
    let id = article.id || path.basename(articlePath, '.json');
    let category = article.category || idToCategory[id];

    if (article) {
      console.log(article);
      categoryLists[category] = categoryLists[category] || {};
      categoryLists[category][id] = article;
      idToCategory[id] = category;
    } else {
      delete categoryLists[category][id];
      delete idToCategory[id];
    }

    lastUpdate = new Date();
  });
