const _ = require('lodash');
const Bluebird = require('bluebird');
const express = require('express');
const Feed = require('../src/feed');
const helper = require('../src/helper');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (req.accepts('text/html')) {
    handleHtmlRequest(req, res, next);
  } else {
    handleJsonRequest(req, res, next);
  }
});

module.exports = router;

function handleHtmlRequest(req, res, next) {
  res.render('index', { title: 'Express' });
}

function handleJsonRequest(req, res, next) {
  getResponseData(req).then(function (feed) {
    if (req.query.callback) {
      return {
        headers: {
          'content-type': 'text/javascript; charset=utf-8'
        },
        body: `${req.query.callback}(${JSON.stringify(feed)});`
      };
    } else {
      return feed;
    }
  }).then((data) => res.json(data));
}

function getResponseData(req) {
  const feedUrl = req.query.q;
  const feedOptions = _.pick(req.query, 'num');

  if (feedUrl) {
    return new Feed(feedUrl).read(feedOptions).then((feed) => {
      return { responseStatus: 200, responseDetails: null, responseData: { feed } };
    }).catch((e) => {
      console.error(e);
      return helper.badRequest({ message: 'Parsing the provided feed url failed.' });
    });
  } else {
    return Bluebird.resolve(helper.badRequest({
      message: 'No q param found!',
      details: 'Please add a query parameter "q" to the request URL which points to a feed!'
    }));
  }
}
