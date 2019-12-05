/*jslint nomen: true, node: true*/
(function () {
    "use strict";
    var config = require(__dirname + '/../../dbconnectmssqlnode.js'),
        myFunctions = require('./myfunctions');
    const sql = require('mssql');
    sql.on('error', err => {
      console.log("Error in SQL: ", err);
    })

    module.exports = {
        getDataFromDB: function (callback) {

        sql.connect(config, err => {
          // Query
          new sql.Request().query('select 1 as number', (err, result) => {
              // ... error checks
              console.log("resulte: ", result)
          })
        })
          // var connection = new sql.Connection(mssqlConnection, function (err) {
          //
          //     var request = new sql.Request(connection),
          //         // query = "select sum(t1.nationalsum)as cash, count(t1.nationalsum) as checks, t1.IPRINTSTATION as cassa, day(t1.CLOSEDATETIME) as day, month(t1.CLOSEDATETIME) as month, DATEPART(dw,t1.CLOSEDATETIME) as dw from  [RK7].[dbo].[PRINTCHECKS] as t1 where year(t1.CLOSEDATETIME) = year(getdate()) and month(t1.CLOSEDATETIME) >= month(getdate())-2 and t1.IPRINTSTATION = 15101 group by t1.IPRINTSTATION, day(t1.CLOSEDATETIME), month(t1.CLOSEDATETIME), DATEPART(dw,t1.CLOSEDATETIME) order by cassa, month desc, day desc;";
          //         query = "select 1;";
          //
          //     request.query(query, function (err, recordset) {
          //       console.info(mssqlConnection);
          //
          //         console.info(err);
          //         // callback(JSON.stringify(connection));
          //         callback(connection);
          //     });
          // });
            callback(config);
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
