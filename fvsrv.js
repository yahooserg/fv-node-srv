/*jslint nomen: true, node: true, unparam: true*/
(function () {
    "use strict";
    // var test = require('./test');
    // console.log(test);
    //     return;

    var express = require('express'),
        // cookieParser = require('cookie-parser'),
        app = express(),
        mysql = require('mysql'),
        sql = require('mssql'),
        mysqlConnection = require(__dirname + '/../dbconnectmysqlnode.js'),
        // mssqlConnection = require(__dirname + '/../dbconnectmssqlnode.js'),
        // weatherKey = require(__dirname + '/../weatherkey'),
        // forecast = require('./forecast'),
        myFunctions = require('./services/myfunctions'),
        // createRevenueData = require('./services/createrevenuedata.js'),
        getTimeString = myFunctions.getTimeString,
        getDateString = myFunctions.getDateString,
        https = require('https'),
        fs = require('fs'),
        privateKey,
        certificate,
        credentials,
        ca,
        httpsServer;
        // http,
        // httpServer;

    //UNCOMMENT FOR production
    //
    privateKey = fs.readFileSync('/etc/letsencrypt/live/fvolchek.net/privkey.pem');
    certificate = fs.readFileSync('/etc/letsencrypt/live/fvolchek.net/cert.pem');
    ca = fs.readFileSync('/etc/letsencrypt/live/fvolchek.net/chain.pem');

    credentials = {
      ca: ca,
      key: privateKey,
      cert: certificate
    };
    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(5555, function () {
    });

    //COMMENT FOR production
    //
    // http = require('http');
    // httpServer = http.createServer(app);
    // httpServer.listen(5555, function () {
    //     console.log('start');
    // });

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

    // app.use(cookieParser());

    app.use(function (req, res, next) {
        var allowedOrigins = ['http://1.local', 'https://fvolchek.net', 'https://www.fvolchek.net'],
            origin = req.headers.origin;
        if (allowedOrigins.indexOf(origin) > -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        // res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "DELETE, PUT");
        next();
    });

    app.get('/api/storedata/store/:id/date/:date', function (req, res) {

        // var connection = new sql.Connection(mssqlConnection, function (err) {
        //
        //     var request = new sql.Request(connection),
        //         query = "select sum(c.Summa) as total, count(c.Summa) as checks from ChequeHead as c where convert(date,c.DateOperation) = '" + req.params.date + "' and c.Cash_Code = " + req.params.id;
        //
        //     request.query(query, function (err, recordset) {
        //         // console.info(recordset);
        //         res.header("Content-Type", "application/json");
        //         res.send(JSON.stringify(recordset[0]));
        //     });
        // });
        res.send("OK");
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

    // app.get('/api/receipts/store/:id/date/:date', function (req, res) {

        // var connection = new sql.Connection(mssqlConnection, function (err) {
        //
        //     var request = new sql.Request(connection),
        //         query = "select c.Cash_Code as Store, c2.chequeID, c.Ck_Number as Ch,c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum, convert(date,c.DateOperation) as date,convert(char(8),c.DateOperation,108)as time from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and convert(date,c.DateOperation) = '" + req.params.date + "' and c.Cash_Code = " + req.params.id + " order by c2.ChequeId desc";
        //
        //     request.query(query, function (err, recordset) {
        //         // console.info(recordset);
        //         var result = {}, i = 0, resultArray = [];
        //         for (i = 0; i < recordset.length; i += 1) {
        //             if (!result[recordset[i].Ch]) {
        //                 result[recordset[i].Ch] = {};
        //                 // console.log(typeof 'recordset.Ch');
        //             }
        //             if (!result[recordset[i].Ch].number) {
        //                 result[recordset[i].Ch].number = recordset[i].Ch;
        //                 result[recordset[i].Ch].total = recordset[i].Total;
        //                 result[recordset[i].Ch].discount = recordset[i].discount;
        //                 result[recordset[i].Ch].time = recordset[i].time;
        //             }
        //             if (!result[recordset[i].Ch].goods) {
        //                 result[recordset[i].Ch].goods = [];
        //             }
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length] = {};
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].code = recordset[i].code;
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].name = recordset[i].gName;
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].price = recordset[i].price;
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].qty = recordset[i].qty;
        //             result[recordset[i].Ch].goods[result[recordset[i].Ch].goods.length - 1].sum = recordset[i].Sum;
        //         }
        //         //loop through all properties and make a result array
        //         for (i in result) {
        //             if (result.hasOwnProperty(i)) {
        //                 resultArray[resultArray.length] = result[i];
        //             }
        //         }
        //
        //         res.header("Content-Type", "application/json");
        //         res.send(JSON.stringify(resultArray));
        //         // res.send(JSON.stringify(recordset));
        //     });
        // });
    // });

    // app.get('/api/hourlystats/store/:id/date/:date/datefrom/:datefrom', function (req, res) {
    //
    //     var connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //         var request = new sql.Request(connection),
    //             query = "select sum(c.Summa) as total, count(c.Summa) as checks, convert(date,c.DateOperation) as date,DATEPART(hh,c.DateOperation)as time from ChequeHead as c where convert(date,c.DateOperation) <= '" + req.params.date + "' and convert(date,c.DateOperation) >= '" + req.params.datefrom + "' and c.Cash_Code = " + req.params.id + " group by convert(date,c.DateOperation), DATEPART(hh,c.DateOperation) order by DATEPART(hh,c.DateOperation), convert(date,c.DateOperation)";
    //
    //         request.query(query, function (err, recordset) {
    //             var result = {},
    //                 i = 0,
    //                 sumByTime = {},
    //                 checksByTime = {},
    //                 date;
    //             for (i; i < recordset.length; i += 1) {
    //                 date = recordset[i].date.getFullYear() + '-' + (recordset[i].date.getMonth() + 1) + '-' + recordset[i].date.getDate();
    //                 if (!result[recordset[i].time]) {
    //                     result[recordset[i].time] = {};
    //                 }
    //                 if (!result[recordset[i].time][date]) {
    //                     result[recordset[i].time][date] = {};
    //                 }
    //                 result[recordset[i].time][date].cash = recordset[i].total;
    //                 result[recordset[i].time][date].checks = recordset[i].checks;
    //                 result[recordset[i].time].time = recordset[i].time;
    //                 if (!sumByTime[date]) {
    //                     sumByTime[date] = 0;
    //                 }
    //                 if (!checksByTime[date]) {
    //                     checksByTime[date] = 0;
    //                 }
    //                 sumByTime[date] = sumByTime[date] + recordset[i].total;
    //                 checksByTime[date] = checksByTime[date] + recordset[i].checks;
    //                 result[recordset[i].time][date].sum = sumByTime[date];
    //                 result[recordset[i].time][date].checksByTime = checksByTime[date];
    //             }
    //             res.header("Content-Type", "application/json");
    //             res.send(JSON.stringify(result));
    //         });
    //     });
    // });

    // app.get('/api/orders/store/:id/date/:date', function (req, res) {
    //     var connection,
    //         dateToOrder = req.params.date,
    //         dateArray = dateToOrder.split('-'),
    //         dateWeekAgo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
    //         dateTwoWeeksAgo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
    //         dateWeekAgoPlusDay = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
    //         dateTwoWeeksAgoPlusDay = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]);
    //
    //
    //
    //     dateWeekAgo.setDate(dateWeekAgo.getDate() - 7);
    //     dateTwoWeeksAgo.setDate(dateTwoWeeksAgo.getDate() - 14);
    //     dateWeekAgoPlusDay.setDate(dateWeekAgoPlusDay.getDate() - 6);
    //     dateTwoWeeksAgoPlusDay.setDate(dateTwoWeeksAgoPlusDay.getDate() - 13);
    //
    //
    //     dateWeekAgo = getDateString(dateWeekAgo);
    //     dateTwoWeeksAgo = getDateString(dateTwoWeeksAgo);
    //     dateWeekAgoPlusDay = getDateString(dateWeekAgoPlusDay);
    //     dateTwoWeeksAgoPlusDay = getDateString(dateTwoWeeksAgoPlusDay);
    //
    //
    //     connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //         var request = new sql.Request(connection),
    //             //this query for all sales 1 and 2 weeks ago
    //             //
    //             query = "select sales.gName as good, sales.groupName as groupName, sum(sales.qty) as qty, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, ggroup.GroupName as groupName, ggroup.Id as groupID, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2, GoodsGroup4 as ggroup where g.GroupID = ggroup.Id and g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) = '" + dateWeekAgo + "' or convert(date,c.DateOperation) = '" + dateTwoWeeksAgo + "') and c.Cash_Code = " + req.params.id + " and price > 0) as sales group by sales.gName, convert(date, dates), sales.groupName, code order by code";
    //
    //         request.query(query, function (err, recordset) {
    //
    //             var result = [],
    //                 i,
    //                 j,
    //                 index;
    //             // now iterating over the recordset got from query we will fill
    //             // result for each item (good)
    //             //
    //             for (i = 0; i < recordset.length; i += 1) {
    //                 index = result.length;
    //                 result[index] = {
    //                     good: recordset[i].good,
    //                     code: recordset[i].code,
    //                     group: recordset[i].groupName
    //                 };
    //                 if (recordset[i + 1] && recordset[i].code === recordset[i + 1].code) {
    //                     result[index].qtyOne = recordset[i + 1].qty;
    //                     result[index].qtyTwo = recordset[i].qty;
    //                     i += 1;
    //                 } else {
    //                     if (getDateString(recordset[i].date) === dateWeekAgo) {
    //                         result[index].qtyOne = recordset[i].qty;
    //                         result[index].qtyTwo = 0;
    //
    //                     } else {
    //                         result[index].qtyTwo = recordset[i].qty;
    //                         result[index].qtyOne = 0;
    //                     }
    //                 }
    //             }
    //             connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //                 request = new sql.Request(connection);
    //                 // this is query for losses 1 week ago
    //                 //
    //                 query = "select sales.gName as good, sum(sales.qty) as qty, code from (select c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum, ggroup.GroupName as groupName, ggroup.Id as groupID from Goods4 as g,ChequeHead as c,ChequePos as c2, GoodsGroup4 as ggroup where g.GroupID = ggroup.Id and  g.Code=c2.Code and c2.ChequeId=c.Id and c.DateOperation between '" + dateWeekAgo + " 12:00' and '" + dateWeekAgoPlusDay + " 12:00' and c.Cash_Code = " + req.params.id + " and price = 0) as sales group by sales.gName, code";
    //
    //
    //                 request.query(query, function (err, recordset) {
    //                     for (i = 0; i < result.length; i += 1) {
    //                         result[i].lossOne = 0;
    //                         for (j = 0; j < recordset.length; j += 1) {
    //                             if (result[i].code === recordset[j].code) {
    //                                 result[i].lossOne = recordset[j].qty;
    //                                 recordset.splice(j, 1);
    //                                 break;
    //                             }
    //                         }
    //                     }
    //
    //                     //if still losses left means all was in loss and no sales of the item.
    //                     //so let's add it to result
    //                     //
    //                     if (recordset.length) {
    //                         for (j = 0; j < recordset.length; j += 1) {
    //                             index = result.length;
    //                             result[index] = {
    //                                 good: recordset[j].good,
    //                                 code: recordset[j].code,
    //                                 group: recordset[i].groupName,
    //                                 qtyOne: 0,
    //                                 qtyTwo: 0,
    //                                 lossOne: recordset[j].qty
    //                             };
    //                         }
    //                     }
    //                     connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //                         request = new sql.Request(connection);
    //                         // this is query for losses 2 weeks ago
    //                         //
    //                         query = "select sales.gName as good, sum(sales.qty) as qty, code from (select c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum, ggroup.GroupName as groupName, ggroup.Id as groupID from Goods4 as g,ChequeHead as c,ChequePos as c2, GoodsGroup4 as ggroup where g.GroupID = ggroup.Id and  g.Code=c2.Code and c2.ChequeId=c.Id and c.DateOperation between '" + dateTwoWeeksAgo + " 12:00' and '" + dateTwoWeeksAgoPlusDay + " 12:00' and c.Cash_Code = " + req.params.id + " and price = 0) as sales group by sales.gName, code";
    //
    //                         request.query(query, function (err, recordset) {
    //                             for (i = 0; i < result.length; i += 1) {
    //                                 result[i].lossTwo = 0;
    //                                 for (j = 0; j < recordset.length; j += 1) {
    //                                     if (result[i].code === recordset[j].code) {
    //                                         result[i].lossTwo = recordset[j].qty;
    //                                         recordset.splice(j, 1);
    //                                         break;
    //                                     }
    //                                 }
    //                             }
    //
    //                             //if still losses left means all was in loss and no sales of the item.
    //                             //so let's add it to result
    //                             //
    //                             if (recordset.length) {
    //                                 for (j = 0; j < recordset.length; j += 1) {
    //                                     index = result.length;
    //                                     result[index] = {
    //                                         good: recordset[j].good,
    //                                         code: recordset[j].code,
    //                                         group: recordset[i].groupName,
    //                                         qtyOne: 0,
    //                                         qtyTwo: 0,
    //                                         lossTwo: recordset[j].qty,
    //                                         lossOne: 0
    //                                     };
    //                                 }
    //                             }
    //
    //                             //new connection to get last time of good was sold
    //                             //
    //                             connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //                                 request = new sql.Request(connection);
    //
    //                                 // this query gets times of last sale for each item 1 and 2 weeks ago
    //                                 //
    //                                 query = "select sales.gName as good, max(dates) as timeOfLastSale, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) = '" + dateWeekAgo + "' or convert(date,c.DateOperation) = '" + dateTwoWeeksAgo + "') and c.Cash_Code = " + req.params.id + " and price > 0) as sales group by convert(date, dates), sales.gName, code";
    //
    //
    //                                 request.query(query, function (err, recordset) {
    //                                     for (i = 0; i < result.length; i += 1) {
    //                                         result[i].qtyToOrder = Math.ceil(result[i].qtyOne);
    //                                         if (result[i].qtyToOrder < 0) {
    //                                             result[i].qtyToOrder = 0;
    //                                         }
    //                                         result[i].qtyRecommended = result[i].qtyToOrder;
    //                                         for (j = 0; j < recordset.length; j += 1) {
    //                                             if (result[i].code === recordset[j].code) {
    //                                                 if (getDateString(recordset[j].timeOfLastSale) === dateWeekAgo) {
    //                                                     result[i].lastSaleWeekAgo = getTimeString(recordset[j].timeOfLastSale);
    //                                                     recordset.splice(j, 1);
    //                                                     break;
    //                                                 }
    //                                                 result[i].lastSaleTwoWeeksAgo = getTimeString(recordset[j].timeOfLastSale);
    //                                                 recordset.splice(j, 1);
    //                                                 if (recordset[j] && result[i].code === recordset[j].code) {
    //                                                     result[i].lastSaleWeekAgo = getTimeString(recordset[j].timeOfLastSale);
    //                                                     recordset.splice(j, 1);
    //                                                 }
    //                                                 break;
    //                                             }
    //                                         }
    //                                     }
    //                                     res.header("Content-Type", "application/json");
    //                                     res.send(JSON.stringify(result));
    //                                 });
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });

    // app.get('/api/weather/date/:date', function (req, res) {
    //
    //     function dateDiffInDays(a, b) {
    //         var _MS_PER_DAY = 1000 * 60 * 60 * 24,
    //         // Discard the time and time-zone information.
    //             utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()),
    //             utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    //         return Math.floor((utc2 - utc1 + 10000) / _MS_PER_DAY);
    //     }
    //
    //     var url = 'https://api.forecast.io/forecast/' + weatherKey + '/59.934280,30.335099/?units=si&lang=ru&exclude=minutely,currently,hourly',
    //         dateReceived = req.params.date,
    //         dateToday = new Date(),
    //         dateDiff,
    //         dateWeekAgo,
    //         dateTwoWeeksAgo,
    //         urlWeekAgo,
    //         urlTwoWeeksAgo;
    //     dateReceived = dateReceived.split('-');
    //     dateWeekAgo = new Date(dateReceived[0] + '-' + dateReceived[1] + '-' + dateReceived[2]);
    //     dateTwoWeeksAgo = new Date(dateReceived[0] + '-' + dateReceived[1] + '-' + dateReceived[2]);
    //
    //     // 6 and 13 days since iso string will return from msk zone with time 00:00:00 gmt zone wich will be date -1 with time 21:00:00
    //     dateWeekAgo.setDate(dateWeekAgo.getDate() - 6);
    //     dateTwoWeeksAgo.setDate(dateTwoWeeksAgo.getDate() - 13);
    //
    //     dateReceived = new Date(dateReceived[0] + '-' + dateReceived[1] + '-' + dateReceived[2]);
    //     dateDiff = dateDiffInDays(dateToday, dateReceived);
    //     urlWeekAgo = dateWeekAgo.toISOString();
    //     urlWeekAgo = urlWeekAgo.slice(0, 19);
    //     urlWeekAgo = 'https://api.forecast.io/forecast/804d6376a63b076c4efe801a2948b761/59.934280,30.335099,' + urlWeekAgo + '/?units=si&lang=ru&exclude=minutely,currently,hourly';
    //     urlTwoWeeksAgo = dateTwoWeeksAgo.toISOString();
    //     urlTwoWeeksAgo = urlTwoWeeksAgo.slice(0, 19);
    //     urlTwoWeeksAgo = 'https://api.forecast.io/forecast/804d6376a63b076c4efe801a2948b761/59.934280,30.335099,' + urlTwoWeeksAgo + '/?units=si&lang=ru&exclude=minutely,currently,hourly';
    //
    //
    //     https.get(url, function (resp) {
    //         resp.on('data', function (d) {
    //             d = JSON.parse(d);
    //             var dataToSend = {
    //                 dateOfOrder: {
    //                     date: new Date(d.daily.data[dateDiff].temperatureMaxTime * 1000),
    //                     temperature: Math.round(d.daily.data[dateDiff].temperatureMax),
    //                     text: d.daily.data[dateDiff].summary,
    //                     humidity:  Math.round(d.daily.data[dateDiff].humidity * 100),
    //                     cloudCover: Math.round(d.daily.data[dateDiff].cloudCover * 100)
    //                 }
    //             };
    //             https.get(urlWeekAgo, function (resp) {
    //                 resp.on('data', function (d) {
    //                     d = JSON.parse(d);
    //                     dataToSend.weekAgo = {
    //                         date: new Date(d.daily.data[0].temperatureMaxTime * 1000),
    //                         temperature: Math.round(d.daily.data[0].temperatureMax),
    //                         text: d.daily.data[0].summary,
    //                         humidity:  Math.round(d.daily.data[0].humidity * 100),
    //                         cloudCover: Math.round(d.daily.data[0].cloudCover * 100)
    //                     };
    //                     https.get(urlTwoWeeksAgo, function (resp) {
    //                         resp.on('data', function (d) {
    //                             d = JSON.parse(d);
    //                             dataToSend.twoWeeksAgo = {
    //                                 date: new Date(d.daily.data[0].temperatureMaxTime * 1000),
    //                                 temperature: Math.round(d.daily.data[0].temperatureMax),
    //                                 text: d.daily.data[0].summary,
    //                                 humidity:  Math.round(d.daily.data[0].humidity * 100),
    //                                 cloudCover: Math.round(d.daily.data[0].cloudCover * 100)
    //                             };
    //                             res.header("Content-Type", "application/json");
    //                             res.send(dataToSend);
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });

    // app.get('/api/forecast/store/:store/date/:date/item/:item', function (req, res) {
    //     var connection,
    //         request,
    //         query,
    //         forecastForItem,
    //         salesData,
    //         i,
    //         j,
    //         dateReceived = req.params.date,
    //         item = req.params.item,
    //         dateArray = dateReceived.split('-'),
    //         dateTo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
    //         dateFrom = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
    //         day = dateFrom.getDay() + 1;
    //     dateFrom.setDate(dateFrom.getDate() - 90);
    //     dateTo = getDateString(dateTo);
    //     dateFrom = getDateString(dateFrom);
    //     connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //         request = new sql.Request(connection);
    //         //this query for all sales 1 and 2 weeks ago
    //         //
    //         query = "select sales.gName as good, sum(sales.qty) as qty, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateFrom + "') and c.Cash_Code = " + req.params.store + " and price > 0 and g.Code = '" + item + "' and DATEPART(dw, c.DateOperation) = " + day + ") as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";
    //
    //         request.query(query, function (err, recordset) {
    //             salesData = recordset;
    //             connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //                 request = new sql.Request(connection);
    //                 //this query for all losses
    //                 //
    //                 query = "select sales.gName as good, sum(sales.qty) as qty, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateFrom + "') and c.Cash_Code = " + req.params.store + " and price = 0 and g.Code = '" + item + "' and DATEPART(dw, c.DateOperation) = " + day + ") as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";
    //
    //                 request.query(query, function (err, recordset) {
    //                     for (i = 0; i < salesData.length; i += 1) {
    //                         salesData[i].loss = 0;
    //                         for (j = 0; j < recordset.length; j += 1) {
    //                             if (salesData[i].date.toISOString() === recordset[j].date.toISOString()) {
    //                                 salesData[i].loss = recordset[j].qty;
    //                                 recordset.splice(j, 1);
    //                                 break;
    //                             }
    //                         }
    //
    //                     }
    //                     connection = new sql.Connection(mssqlConnection, function (err) {
    //
    //                         request = new sql.Request(connection);
    //                         //this query for all last sales
    //                         //
    //                         query = "select sales.gName as good, max(dates) as timeOfLastSale, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateFrom + "') and c.Cash_Code = " + req.params.store + " and price > 0 and g.Code = '" + item + "' and DATEPART(dw, c.DateOperation) = " + day + ") as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";
    //                         // query = "select DATEPART(dw, c.DateOperation) as dweek, c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateFrom + "') and c.Cash_Code = " + req.params.store + " and price > 0 and g.Code = '" + item + "' and DATEPART(dw, c.DateOperation) = 4";
    //
    //                         request.query(query, function (err, recordset) {
    //                             for (i = 0; i < salesData.length; i += 1) {
    //                                 for (j = 0; j < recordset.length; j += 1) {
    //                                     if (salesData[i].date.toISOString() === recordset[j].date.toISOString()) {
    //                                         salesData[i].timeOfLastSale = recordset[j].timeOfLastSale;
    //                                         recordset.splice(j, 1);
    //                                         break;
    //                                     }
    //                                 }
    //                             }
    //
    //                             //now let's count income
    //                             //
    //                             forecastForItem = forecast(salesData);
    //                             // console.log(forecastForItem);
    //
    //                             res.header("Content-Type", "application/json");
    //                             res.send(JSON.stringify({forecast: forecastForItem, date: dateTo}));
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });

    app.post('/api/passwordChange/user/:id/password/:password', function (req, res) {

        var query = "call passwordChange(" + req.params.id + ", '" + req.params.password + "')",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send('OK');
        });

        connection.end();
    });

    app.get('/api/userDataCheck/:id', function (req, res) {

        var query = "call userDataCheck(" + req.params.id + ")",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send(rows);
        });

        connection.end();
    });

    app.get('/api/users/user/:id/token/:token/type/:type', function (req, res) {

        var query = "call getUsers(" + req.params.id + ", " + req.params.token + ","+ req.params.type +")",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send(rows);
        });

        connection.end();

    });

    app.delete('/api/user/:id/token/:token/userToDelete/:userToDelete', function (req, res) {

        var query = "call deleteUser(" + req.params.id + ", " + req.params.token + ", " + req.params.userToDelete + ")",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send(rows);
        });

        connection.end();

    });

    app.put('/api/user/:id/token/:token/userFirstName/:firstName/userLastName/:lastName/userEmail/:email/type/:type', function (req, res) {

        var query = "call addUser(" + req.params.id + ", " + req.params.token + ", '" + req.params.firstName + "', '" + req.params.lastName + "', '" + req.params.email + "',"+ req.params.type +")",
            connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            res.send(rows);
        });

        connection.end();

    });

    // app.get('/api/test/', function (req, res) {
    //     // var url = 'http://172.31.36.229:5556/api/test';
    //     var url = 'http://127.0.0.1:5556/api/test';
    //
    //     http.get(url, function (resp) {
    //         resp.on('data', function (d) {
    //             d = JSON.parse(d);
    //             console.log(req.path);
    //
    //             // res.header("Content-Type", "application/json");
    //             // res.send(dataToSend);
    //         });
    //     });
    //     res.header("Content-Type", "application/json");
    //     res.send(JSON.stringify({forecast: 1, date: 2}));
    // });

    // var revenueStore = function () {
    //   createRevenueData.getDataFromDB(function (data) {
    //     console.log(data);
    //   });
    // };
    //
    // setInterval(revenueStore, 3000);

    ////////////////////////////////////
    // THIS IS TO GET BAKERIES
    // var getBakeriesIDsFromServer = function () {
    //   var config = require(__dirname + '/../dbconnectmssqlnode.js');
    //   var query = "SELECT SIFR, CODE, NAME, NETNAME FROM CASHES order by sifr desc;";
    //   sql.connect(config, err => {
    //     const request = new sql.Request();
    //     request.query(query, (err, result) => {
    //         // ... error checks
    //         if(err) {
    //           console.log("Error: ", err);
    //         }
    //         console.log(result.recordset);
    //     })
    //   })
    
    // };
    // getBakeriesIDsFromServer();
    //////////////////////////////

}());
