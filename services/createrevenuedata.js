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
          // console.log("Error: ", err);
          // Query
          var query = "select sum(t1.nationalsum)as cash, count(t1.nationalsum) as checks, t1.IPRINTSTATION as cassa, day(t1.CLOSEDATETIME) as day, month(t1.CLOSEDATETIME) as month, DATEPART(dw,t1.CLOSEDATETIME) as dw from  [RK7].[dbo].[PRINTCHECKS] as t1 where year(t1.CLOSEDATETIME) = year(getdate()) and month(t1.CLOSEDATETIME) >= month(getdate())-2 and t1.IPRINTSTATION = 15101 group by t1.IPRINTSTATION, day(t1.CLOSEDATETIME), month(t1.CLOSEDATETIME), DATEPART(dw,t1.CLOSEDATETIME) order by cassa, month desc, day desc;";
          const request = new sql.Request();
          request.query(query, (err, result) => {
              // ... error checks
              // console.log("Error: ", err);
              var bakeryData = {
                eightDays: {
                  revenue:[0,0,0,0,0,0,0,0],
                  checks: [0,0,0,0,0,0,0,0],
                  average: [0,0,0,0,0,0,0,0]
                },
                thisMonth: {
                  revenue: 0,
                  checks: 0,
                  average: 0
                },
                lastMonth: {
                  revenue: 0,
                  checks: 0,
                  average: 0
                },
                monthBeforeLastMonth: {
                  revenue: 0,
                  checks: 0,
                  average: 0
                }
              };
              var currentMonth = result.recordset[0].month;
              for (i = 0; i < results.recordset.length; i += 1) {
                if(i<8) {
                  bakeryData.eightDays.revenue[7-i] = result.recordset[i].cash;
                  bakeryData.eightDays.checks[7-i] = result.recordset[i].checks;
                  bakeryData.eightDays.average[7-i] = result.recordset[i].cash/result.recordset[i].checks;
                }
                if(currentMonth === result.recordset[i].month) {
                  bakeryData.thisMonth.revenue += result.recordset[i].cash;
                  bakeryData.thisMonth.checks += result.recordset[i].checks;

                } else if (currentMonth === result.recordset[i].month + 1) {
                  bakeryData.lastMonth.revenue += result.recordset[i].cash;
                  bakeryData.lastMonth.checks += result.recordset[i].checks;
                } else {
                  bakeryData.monthBeforeLastMonth.revenue += result.recordset[i].cash;
                  bakeryData.monthBeforeLastMonth.checks += result.recordset[i].checks;
                }

              }
              bakeryData.thisMonth.average = bakeryData.thisMonth.revenue/bakeryData.thisMonth.checks;
              bakeryData.lastMonth.average = bakeryData.lastMonth.revenue/bakeryData.lastMonth.checks;
              bakeryData.monthBeforeLastMonth.average = bakeryData.monthBeforeLastMonth.revenue/bakeryData.monthBeforeLastMonth.checks;

              console.log("resulte: ", bakeryData);

          })
        })
        }
    };
}());
