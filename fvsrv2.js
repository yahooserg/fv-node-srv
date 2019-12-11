/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var createRevenueData = require('./services/createrevenuedata.js'),
      fs = require('fs'),
      myFunctions = require('./services/myfunctions'),
      revenueStore = function () {
        var date = new Date();
        var hour = date.getUTCHours()+3,
            minute = date.getUTCMinutes();
        console.log(hour, minute);
        if(hour <= 23 && minute % 30 === 15) {
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
        }

      };
    // revenueStore();
    setInterval(revenueStore, 60000);
}());
