require('node-jsx').install({extension: '.jsx'});
require('rootpath')();
var express = require('express');
var router = express.Router();
var React = require('react/addons');
var RouteContainer = React.createFactory(require('app/bus-departures-demo/bus-route-list-jsx/components/route-container.jsx'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bus Departures Demo'/*, RouteContainer: React.renderToString(RouteContainer())*/ });
});

module.exports = router;
