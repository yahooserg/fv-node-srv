/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    // var express = require('express'),
    //     app = express(),
    //     http,
    //     httpServer;
    //
    // http = require('http');
    // httpServer = http.createServer(app);
    // app.use(function (req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });
    // app.get('/api/test', function (req, res) {
    //     console.log('test');
    //     res.header("Content-Type", "application/json");
    //     res.send(JSON.stringify({forecast: 'testFromInSRV', date: 2}));
    // });
    // httpServer.listen(5556, function () {
    //     console.log('start');
    // });
    var createRevenueData = require('./services/createrevenuedata.js'),
      revenueStore = function () {
        createRevenueData.getDataFromDB(function (data) {
          console.log(data);
        });
      };
    setInterval(revenueStore, 3000);
}());
