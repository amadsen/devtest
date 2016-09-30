"use strict";

const express = require('express');
const path = require('path');

const idToCategory = {};
const categoryLists = {};
let watchList = [];
let lastUpdate;

// watch the mock_data/articles directory for json files and keep mock data
// strctures up tp date.
watchList.push({
  pattern: path.resolve(__dirname, '../articles/*.json'),
  fn: (articlePath, article) => {
    //console.log(articlePath);
    let id = article.id || path.basename(articlePath, '.json');
    let category = article.category || idToCategory[id];

    if (article) {
      //console.log(article);
      categoryLists[category] = categoryLists[category] || {};
      categoryLists[category].content = categoryLists[category].content || {};
      categoryLists[category].content[id] = article;
      idToCategory[id] = category;
    } else {
      if(categoryLists[category] && categoryLists[category].content) {
        delete categoryLists[category].content[id];
      }
      delete idToCategory[id];
    }

    lastUpdate = new Date();
  }
});

// watch the mock_data/articles directory for json files and keep mock data
// strctures up tp date.
watchList.push({
  pattern: path.resolve(__dirname, '../categories/*.json'),
  fn: (categoryPath, category) => {
    //console.log(categoryPath);
    let id = category.id || path.basename(categoryPath, '.json');

    if (category) {
      //console.log(category);
      categoryLists[id] = categoryLists[id] || {};
      categoryLists[id].title = category.title;
      categoryLists[id].id = id;
      categoryLists[id].content = categoryLists[id].content || {};
    }

    lastUpdate = new Date();
  }
});

let categoryRouter = express.Router();
categoryRouter.use('/', function (req, res, next) {
  if(req.path === '/'){
    res.setHeader('Cache-Control', 'public, max-age=0');
    return res.json({
      "last-update": lastUpdate.toUTCString(),
      "list": Object.keys(categoryLists)
    });
  }
  return next();
});

categoryRouter.use('/:categoryId', function (req, res, next) {
  let category = categoryLists[req.params.categoryId];
  if(category){
    res.setHeader('Cache-Control', 'public, max-age=0');
    return res.json({
      id: category.id,
      title: category.title,
      content: Object.keys(category.content)
    });
  }
  return next('route');
});

module.exports = {
  router: categoryRouter,
  watch: watchList
};
