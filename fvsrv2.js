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
        // console.log(hour, minute);
        if(hour <= 23 && hour >= 8 && minute % 5 === 3) {

          var currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
          // console.log(currentDate);
          console.log("Start: ", date);
          createRevenueData.getDataFromDB(function (data) {

            date = new Date();
            currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
            console.log("Data formed: ", date);

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
