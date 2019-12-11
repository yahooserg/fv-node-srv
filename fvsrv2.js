/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      myFunctions = require('./services/myfunctions'),
      revenueStore = function () {
        console.log(Date.now());
        createRevenueData.getDataFromDB(function (data) {
          fs.writeFile("./../bakerydata.json", JSON.stringify(data), function () {
            console.log("DONE");
            console.log(Date.now());
          })
        });
      };
    revenueStore();
    // setInterval(revenueStore, 30000);
}());
