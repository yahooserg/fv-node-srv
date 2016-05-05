/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    var express = require('express'),
        mysql = require('mysql'),
        sql = require('mssql'),
        mysqlConnection = require(__dirname + '/../dbconnectmysqlnode.js'),
        mssqlConnection = require(__dirname + '/../dbconnectmssqlnode.js'),
        app,
        // https = require('https'),
        // fs = require('fs'),
        // privateKey,
        // certificate,
        // credentials,
        // httpsServer;
        http,
        httpServer;
    app = express();


    //UNCOMMENT FOR production
    //
    // privateKey = fs.readFileSync(__dirname + '/../ssl.key');
    // certificate = fs.readFileSync(__dirname + '/../ssl.crt');
    // credentials = {key: privateKey, cert: certificate};
    // httpsServer = https.createServer(credentials, app);

    //COMMENT FOR production
    //
    http = require('http');
    httpServer = http.createServer(app);

    //after serve all app via node (no apache or php) you have to add http and redirection to https with something like following:
    // var redirectApp = express () ,
    // redirectServer = http.createServer(redirectApp);
    //
    // redirectApp.use(function requireHTTPS(req, res, next) {
    //   if (!req.secure) {
    //     return res.redirect('https://' + req.headers.host + req.url);
    //   }
    //   next();
    // })
    //
    // redirectServer.listen(8080);


    // app.use(express.static(__dirname + '/../fvolcheknet')); //use this when get rid of apache and php

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/api/storedata/store/:id/date/:date', function (req, res) {

        var connection = new sql.Connection(mssqlConnection, function (err) {

            var request = new sql.Request(connection),
                query = "select sum(c.Summa) as total, count(c.Summa) as checks from ChequeHead as c where convert(date,c.DateOperation) = '" + req.params.date + "' and c.Cash_Code = " + req.params.id;

            request.query(query, function (err, recordset) {
                // console.info(recordset);
                res.header("Content-Type", "application/json");
                res.send(JSON.stringify(recordset[0]));
            });
        });
    });

    app.post('/api/log/user/:id/action/:action', function (req, res) {

        var query = "call addLog(" + req.params.id + ", '" + req.params.action + "')",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send('OK');
        });

        connection.end();
    });

    app.get('/api/receipts/store/:id/date/:date', function (req, res) {

        var connection = new sql.Connection(mssqlConnection, function (err) {

            var request = new sql.Request(connection),
                query = "select c.Cash_Code as Store, c2.chequeID, c.Ck_Number as Ch,c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum, convert(date,c.DateOperation) as date,convert(char(8),c.DateOperation,108)as time from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and convert(date,c.DateOperation) = '" + req.params.date + "' and c.Cash_Code = " + req.params.id + " order by c2.ChequeId desc";

            request.query(query, function (err, recordset) {
                // console.info(recordset);
                var result = {}, i = 0, resultArray = [];
                for (i = 0; i < recordset.length; i += 1) {
                    if (!result[recordset[i].Ch]) {
                        result[recordset[i].Ch] = {};
                        // console.log(typeof 'recordset.Ch');
                    }
                    if (!result[recordset[i].Ch].number) {
                        result[recordset[i].Ch].number = recordset[i].Ch;
                        result[recordset[i].Ch].total = recordset[i].Total;
                        result[recordset[i].Ch].discount = recordset[i].discount;
                        result[recordset[i].Ch].time = recordset[i].time;
                    }
                    if (!result[recordset[i].Ch].goods) {
                        result[recordset[i].Ch].goods = [];
                    }
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length] = {};
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].code = recordset[i].code;
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].name = recordset[i].gName;
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].price = recordset[i].price;
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].qty = recordset[i].qty;
                    result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].sum = recordset[i].Sum;
                }
                //loop through all properties and make a result array
                for (i in result) {
                    resultArray[resultArray.length] = result[i];
                }
                res.header("Content-Type", "application/json");
                res.send(JSON.stringify(resultArray));
                // res.send(JSON.stringify(recordset));
            });
        });
    });

    app.get('/api/hourlystats/store/:id/date/:date/datefrom/:datefrom', function (req, res) {

        var connection = new sql.Connection(mssqlConnection, function (err) {

            var request = new sql.Request(connection),
                query = "select sum(c.Summa) as total, count(c.Summa) as checks, convert(date,c.DateOperation) as date,DATEPART(hh,c.DateOperation)as time from ChequeHead as c where convert(date,c.DateOperation) <= '" + req.params.date + "' and convert(date,c.DateOperation) >= '" + req.params.datefrom + "' and c.Cash_Code = " + req.params.id + " group by convert(date,c.DateOperation), DATEPART(hh,c.DateOperation) order by DATEPART(hh,c.DateOperation), convert(date,c.DateOperation)";

            request.query(query, function (err, recordset) {
                var result = {},
                    i = 0,
                    sumByTime = {},
                    checksByTime = {},
                    date;
                for (i; i < recordset.length; i += 1) {
                    date = recordset[i].date.getFullYear() + '-' + (recordset[i].date.getMonth() + 1) + '-' + recordset[i].date.getDate();
                    if (!result[recordset[i].time]) {
                        result[recordset[i].time] = {};
                    }
                    if (!result[recordset[i].time][date]) {
                        result[recordset[i].time][date] = {};
                    }
                    result[recordset[i].time][date].cash = recordset[i].total;
                    result[recordset[i].time][date].checks = recordset[i].checks;
                    result[recordset[i].time].time = recordset[i].time;
                    if (!sumByTime[date]) {
                        sumByTime[date] = 0;
                    }
                    if (!checksByTime[date]) {
                        checksByTime[date] = 0;
                    }
                    sumByTime[date] = sumByTime[date] + recordset[i].total;
                    checksByTime[date] = checksByTime[date] + recordset[i].checks;
                    result[recordset[i].time][date].sum = sumByTime[date];
                    result[recordset[i].time][date].checksByTime = checksByTime[date];
                }
                res.header("Content-Type", "application/json");
                res.send(JSON.stringify(result));
            });
        });
    });


    app.get('/api/orders/store/:id/date/:date', function (req, res) {
        var connection,
            dateToOrder = req.params.date,
            dateArray = dateToOrder.split('-'),
            dateWeekAgo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
            dateTwoWeeksAgo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
            dateWeekAgoPlusDay = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
            dateTwoWeeksAgoPlusDay = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
            getDateString;

        getDateString = function (date) {
            var day = date.getDate(),
                month = date.getMonth() + 1;
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            return date.getFullYear() + '-' + month + '-' + day;
        };

        dateWeekAgo.setDate(dateWeekAgo.getDate() - 7);
        dateTwoWeeksAgo.setDate(dateTwoWeeksAgo.getDate() - 14);
        dateWeekAgoPlusDay.setDate(dateWeekAgoPlusDay.getDate() - 6);
        dateTwoWeeksAgoPlusDay.setDate(dateTwoWeeksAgoPlusDay.getDate() - 13);


        dateWeekAgo = getDateString(dateWeekAgo);
        dateTwoWeeksAgo = getDateString(dateTwoWeeksAgo);
        dateWeekAgoPlusDay = getDateString(dateWeekAgoPlusDay);
        dateTwoWeeksAgoPlusDay = getDateString(dateTwoWeeksAgoPlusDay);


        connection = new sql.Connection(mssqlConnection, function (err) {

            var request = new sql.Request(connection),
            // this is query for losses 1 week ago
            //
            //query = "select sales.gName as good, sum(sales.qty) as qty, code from (select c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and c.DateOperation between '" + dateWeekAgo + " 12:00' and '" + dateWeekAgoPlusDay + " 12:00' and c.Cash_Code = " + req.params.id + " and price = 0) as sales group by sales.gName";

            query = "select sales.gName as good, sum(sales.qty) as qty, convert(date, dates), code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) = '" + dateWeekAgo + "' or convert(date,c.DateOperation) = '" + dateTwoWeeksAgo + "') and c.Cash_Code = " + req.params.id + " and price > 0) as sales group by convert(date, dates), sales.gName, code";

            request.query(query, function (err, recordset) {
                var result = [],
                    i = 0,
                    sumByTime = {},
                    checksByTime = {},
                    date,
                    index;
                for (i = 0; i < recordset.length; i += 1) {
                    index = result.length;
                    result[index] = {
                        good: recordset[i].good,
                        code: recordset[i].code,
                    };
                    if (recordset[i].code === recordset[i + 1].code) {
                        result[index].qtyOne = recordset[i + 1].qty;
                        result[index].qtyTwo = recordset[i].qty;
                        i += 1;
                    } else {
                        result[index].qtyTwo = result[index].qty;
                    }
                }
                res.header("Content-Type", "application/json");
                res.send(JSON.stringify(recordset));
            });
        });

        console.log(dateWeekAgo);
        console.log(dateWeekAgoPlusDay);
        console.log(dateTwoWeeksAgo);
        console.log(dateTwoWeeksAgoPlusDay);


        // res.send(JSON.stringify(req.params.date));
    });

    // httpsServer.listen(5555, function () {
    //     var date = new Date();
    //     console.log('fv server runs at 5555 ' + __dirname + ' ' + date);
    // });
    httpServer.listen(5555, function () {
        var date = new Date();
        console.log('fv server runs at 5555 ' + __dirname + ' ' + date);
    });
}());
