/*jslint nomen: true, node: true*/
(function () {
    "use strict";
    var mssqlConnection = require(__dirname + '/../../dbconnectmssqlnode.js'),
        myFunctions = require('./myfunctions');

    module.exports = {
        getDataFromDB: function (callback) {
            callback(mssqlConnection);
        },
        getDateString: function (date) {
            var day = date.getDate(),
                month = date.getMonth() + 1;
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            return date.getFullYear() + '-' + month + '-' + day;
        }
    };
}());
