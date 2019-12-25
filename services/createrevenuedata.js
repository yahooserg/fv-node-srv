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


          var query = "select id, bakery, name from stores where bakery < 1000 order by bakery limit 2;",
          sqlQueryStore = "",
          connection = mysql.createConnection(mysqlConnection),
          data = [];
          connection.connect();
          connection.query(query, function (err, rows, fields) {

            //test
            for(var j = 0; j < rows.length; j += 1) {
              if (j === 0) {
                sqlQueryStore = " (t1.IPRINTSTATION = " + rows[j].id;
              } else {
                sqlQueryStore += " or t1.IPRINTSTATION = " + rows[j].id;
              }
              data[j] = {
                name: "№ " + rows[j].bakery + " " + rows[j].name,
                id: rows[j].id,
                bakeryData: {
                  eightDays: {
                    revenue:[0,0,0,0,0,0,0,0],
                    checks: [0,0,0,0,0,0,0,0],
                    average: [0,0,0,0,0,0,0,0],
                    date: []
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
                }
              };
            }
            sqlQueryStore += ") ";
            // console.log(sqlQueryStore);
            var query = "select sum(t1.nationalsum)as cash, count(t1.nationalsum) as checks, t1.IPRINTSTATION as cassa, day(t1.CLOSEDATETIME) as day, month(t1.CLOSEDATETIME) as month, DATEPART(dw,t1.CLOSEDATETIME) as dw from  [RK7].[dbo].[PRINTCHECKS] as t1 where year(t1.CLOSEDATETIME) = year(getdate()) and month(t1.CLOSEDATETIME) >= month(getdate())-2 and " + sqlQueryStore + " group by t1.IPRINTSTATION, day(t1.CLOSEDATETIME), month(t1.CLOSEDATETIME), DATEPART(dw,t1.CLOSEDATETIME) order by cassa, month desc, day desc;";
            console.log(query);

            sql.connect(config, err => {
              const request = new sql.Request();
              request.query(query, (err, result) => {
                  // ... error checks
                  if(err) {
                    console.log("Error: ", err);
                  }
                  console.log("Result: ", result);
                  console.log("Resulter");
                  var currentBakeryId = 0,
                  j = 0,
                  k = 0,
                  currentMonth = result.recordset[0].month;
                  for (var i = 0; i < result.recordset.length; i += 1) {
                    if (currentBakeryId !== result.recordset[i].cassa) {
                      for(var z = 0; z < data.length; z += 1) {
                        if(data[z].id === result.recordset[i].cassa) {
                          currentBakeryId = result.recordset[i].cassa;
                          j = z;
                          k = 0;
                        }
                      }
                    }
                    var bakeryData = {
                      eightDays: {
                        revenue:[0,0,0,0,0,0,0,0],
                        checks: [0,0,0,0,0,0,0,0],
                        average: [0,0,0,0,0,0,0,0],
                        date: []
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
                    if(k<8) {
                      bakeryData.eightDays.date[7-i] = {
                        day: result.recordset[i].day,
                        month: result.recordset[i].month,
                        dw: result.recordset[i].dw
                      }
                      bakeryData.eightDays.revenue[7-i] = result.recordset[i].cash;
                      bakeryData.eightDays.checks[7-i] = result.recordset[i].checks;
                      bakeryData.eightDays.average[7-i] = Math.ceil(result.recordset[i].cash/result.recordset[i].checks);
                    }
                    k += 1;
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

                    bakeryData.thisMonth.average = Math.ceil(bakeryData.thisMonth.revenue/bakeryData.thisMonth.checks);
                    bakeryData.lastMonth.average = Math.ceil(bakeryData.lastMonth.revenue/bakeryData.lastMonth.checks);
                    bakeryData.monthBeforeLastMonth.average = Math.ceil(bakeryData.monthBeforeLastMonth.revenue/bakeryData.monthBeforeLastMonth.checks);

                    data[j].bakeryData = bakeryData;
                  }
                  console.log(data);


              })


            })

            //test end

            // sql.connect(config, err => {
            //   // var j = 0,
            //   //   z = 0;
            //   // for(j = 0; j < rows.length; j += 1) {
            //   var msSQLJob = function (j) {
            //     // console.log("in JOB: ", bakery);
            //     // Query
            //     data[j] = {
            //       name: "№ " + rows[j].bakery + " " + rows[j].name,
            //       id: rows[j].id,
            //       bakeryData: {}
            //     };
            //     var query = "select sum(t1.nationalsum)as cash, count(t1.nationalsum) as checks, t1.IPRINTSTATION as cassa, day(t1.CLOSEDATETIME) as day, month(t1.CLOSEDATETIME) as month, DATEPART(dw,t1.CLOSEDATETIME) as dw from  [RK7].[dbo].[PRINTCHECKS] as t1 where year(t1.CLOSEDATETIME) = year(getdate()) and month(t1.CLOSEDATETIME) >= month(getdate())-2 and t1.IPRINTSTATION = " + rows[j].id + " group by t1.IPRINTSTATION, day(t1.CLOSEDATETIME), month(t1.CLOSEDATETIME), DATEPART(dw,t1.CLOSEDATETIME) order by cassa, month desc, day desc;";
            //     const request = new sql.Request();
            //     request.query(query, (err, result) => {
            //         // ... error checks
            //         console.log("Error: ", err);
            //         var bakeryData = {
            //           eightDays: {
            //             revenue:[0,0,0,0,0,0,0,0],
            //             checks: [0,0,0,0,0,0,0,0],
            //             average: [0,0,0,0,0,0,0,0],
            //             date: []
            //           },
            //           thisMonth: {
            //             revenue: 0,
            //             checks: 0,
            //             average: 0
            //           },
            //           lastMonth: {
            //             revenue: 0,
            //             checks: 0,
            //             average: 0
            //           },
            //           monthBeforeLastMonth: {
            //             revenue: 0,
            //             checks: 0,
            //             average: 0
            //           }
            //         };
            //         var currentMonth = result.recordset[0].month;
            //         for (var i = 0; i < result.recordset.length; i += 1) {
            //           if(i<8) {
            //             bakeryData.eightDays.date[7-i] = {
            //               day: result.recordset[i].day,
            //               month: result.recordset[i].month,
            //               dw: result.recordset[i].dw
            //             }
            //             bakeryData.eightDays.revenue[7-i] = result.recordset[i].cash;
            //             bakeryData.eightDays.checks[7-i] = result.recordset[i].checks;
            //             bakeryData.eightDays.average[7-i] = Math.ceil(result.recordset[i].cash/result.recordset[i].checks);
            //           }
            //           if(currentMonth === result.recordset[i].month) {
            //             bakeryData.thisMonth.revenue += result.recordset[i].cash;
            //             bakeryData.thisMonth.checks += result.recordset[i].checks;
            //
            //           } else if (currentMonth === result.recordset[i].month + 1) {
            //             bakeryData.lastMonth.revenue += result.recordset[i].cash;
            //             bakeryData.lastMonth.checks += result.recordset[i].checks;
            //           } else {
            //             bakeryData.monthBeforeLastMonth.revenue += result.recordset[i].cash;
            //             bakeryData.monthBeforeLastMonth.checks += result.recordset[i].checks;
            //           }
            //
            //         }
            //         bakeryData.thisMonth.average = Math.ceil(bakeryData.thisMonth.revenue/bakeryData.thisMonth.checks);
            //         bakeryData.lastMonth.average = Math.ceil(bakeryData.lastMonth.revenue/bakeryData.lastMonth.checks);
            //         bakeryData.monthBeforeLastMonth.average = Math.ceil(bakeryData.monthBeforeLastMonth.revenue/bakeryData.monthBeforeLastMonth.checks);
            //
            //         data[j].bakeryData = bakeryData;
            //         if (j < rows.length - 1) {
            //           msSQLJob (j + 1);
            //         } else {
            //           callback(data);
            //         }
            //     })
            //
            //   }
            //   msSQLJob (0);
            //   // }
            //   // console.log(data);
            // })
          });
          connection.end();
        }
    };


}());
