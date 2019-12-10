/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      revenueStore = function () {
        createRevenueData.getDataFromDB(function (data) {
          fs.writeFile("./../bakerydata.json", JSON.stringify(data), function () {
            console.log("DONE");
          })
        });
      };
    revenueStore();
    // setInterval(revenueStore, 30000);
}());
