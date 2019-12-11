/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      revenueStore = function () {
        var currentDate = myFunctions.getDateString + " " + myFunctions.getTimeString;
        console.log(currentDate);
        createRevenueData.getDataFromDB(function (data) {
          fs.writeFile("./../bakerydata.json", JSON.stringify(data), function () {
            console.log("DONE");
            currentDate = myFunctions.getDateString + " " + myFunctions.getTimeString;
            console.log(currentDate);
          })
        });
      };
    revenueStore();
    // setInterval(revenueStore, 30000);
}());
