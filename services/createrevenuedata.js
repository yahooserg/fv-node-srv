/*jslint nomen: true, node: true*/
(function () {
    "use strict";
    var config = require(__dirname + '/../../dbconnectmssqlnode.js'),
      mysqlConnection = require(__dirname + '/../../dbconnectmysqlnode.js'),
      myFunctions = require('./myfunctions');
    const sql = require('mssql'),
      mysql = require('mysql');

    sql.on('error', err => {
      console.log("Error in SQL: ", err);
    })

    module.exports = {
        getDataFromDB: function (callback) {

          var query = "select id, bakery, name from stores where bakery < 1000 order by bakery limit 3;",
          connection = mysql.createConnection(mysqlConnection),
          data = [];
          connection.connect();
          connection.query(query, function (err, rows, fields) {
            sql.connect(config, err => {
              var j = 0;
              for(j = 0; j < rows.length; j += 1) {
                data[j] = {
                  name: "№ " + rows[j].bakery + " " + rows[j].name,
                  id: rows[j].id,
                  bakeryData: {}
                };
                msSQLJob (data[j].id, data, function (bakeryData, index) {
                  data[index].bakeryData = bakeryData;
                });
              }
              // console.log(data);
            })
          });
          connection.end();
        }
    };

    var msSQLJob = function (bakery, callback) {
      // console.log("in JOB: ", bakery);
      // Query
      return 0;
      var query = "select sum(t1.nationalsum)as cash, count(t1.nationalsum) as checks, t1.IPRINTSTATION as cassa, day(t1.CLOSEDATETIME) as day, month(t1.CLOSEDATETIME) as month, DATEPART(dw,t1.CLOSEDATETIME) as dw from  [RK7].[dbo].[PRINTCHECKS] as t1 where year(t1.CLOSEDATETIME) = year(getdate()) and month(t1.CLOSEDATETIME) >= month(getdate())-2 and t1.IPRINTSTATION = " + bakery + " group by t1.IPRINTSTATION, day(t1.CLOSEDATETIME), month(t1.CLOSEDATETIME), DATEPART(dw,t1.CLOSEDATETIME) order by cassa, month desc, day desc;";
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
          for (var i = 0; i < result.recordset.length; i += 1) {
            if(i<8) {
              bakeryData.eightDays.revenue[7-i] = result.recordset[i].cash;
              bakeryData.eightDays.checks[7-i] = result.recordset[i].checks;
              bakeryData.eightDays.average[7-i] = Math.ceil(result.recordset[i].cash/result.recordset[i].checks);
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
          bakeryData.thisMonth.average = Math.ceil(bakeryData.thisMonth.revenue/bakeryData.thisMonth.checks);
          bakeryData.lastMonth.average = Math.ceil(bakeryData.lastMonth.revenue/bakeryData.lastMonth.checks);
          bakeryData.monthBeforeLastMonth.average = Math.ceil(bakeryData.monthBeforeLastMonth.revenue/bakeryData.monthBeforeLastMonth.checks);

          callback(bakeryData, bakery);
          // console.log(bakeryData);

      })

    }
}());
