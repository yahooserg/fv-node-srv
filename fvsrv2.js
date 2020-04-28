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
        if(hour <= 23 && hour >= 8 && minute % 15 === 5) {
          console.log("Start: ", date);
          createRevenueData.getDataFromDB(function (data) {
            date = new Date();
            var currentDate = myFunctions.getDateString(date) + " " + myFunctions.getTimeString(date);
            data[data.length] = currentDate;
            fs.writeFile(__dirname + "/../bakerydata.json", JSON.stringify(data), function (err) {
              console.log(__dirname);
              if(err) {
                console.log(err);
              }
              date = new Date();
              console.log("Finish: ", date);
            })
          });
        }

      };
    // revenueStore();
    setInterval(revenueStore, 60000);
}());
