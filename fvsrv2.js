/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      myFunctions = require('./services/myfunctions'),
      revenueStore = function () {
        var date = new Date();
        var currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
        // console.log(currentDate);

        console.log("Start: ", date);
        createRevenueData.getDataFromDB(function (data) {
          data[data.length] = currentDate;
          fs.writeFile("./../bakerydata.json", JSON.stringify(data), function () {
            date = new Date();
            currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
            console.log("Finish: ", date);
            // console.log(currentDate);
          })
        });
      };
    // revenueStore();
    setInterval(revenueStore(), 120000);
}());
