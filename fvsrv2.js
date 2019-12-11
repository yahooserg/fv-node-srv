/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      myFunctions = require('./services/myfunctions'),
      revenueStore = function () {
        var date = new Date();
        var currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
        console.log(currentDate);
        createRevenueData.getDataFromDB(function (data) {
          fs.writeFile("./../bakerydata.json", JSON.stringify(data), function () {
            console.log("DONE");
            date = new Date();

            currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
            console.log(currentDate);
          })
        });
      };
    revenueStore();
    // setInterval(revenueStore, 30000);
}());
