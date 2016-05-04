(function () {
    "use strict";
    var fs = require('fs'),
        https = require('https'),
        express = require('express'),
        mysql = require('mysql'),
        sql = require('mssql'),
        mysqlConnection = require(__dirname + '/../dbconnectmysqlnode.js'),
        mssqlConnection = require(__dirname + '/../dbconnectmssqlnode.js'),
        app,
        privateKey,
        certificate,
        credentials,
        httpsServer;
    app = express();


    //UNCOMMENT FOR production
    //
    // privateKey = fs.readFileSync(__dirname + '/../ssl.key');
    // certificate = fs.readFileSync(__dirname + '/../ssl.crt');
    // credentials = {key: privateKey, cert: certificate};
    // httpsServer = https.createServer(credentials, app);

    //COMMENT FOR production
    //
    var http = require('http');
    var httpServer,
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

    app.get('/test', function (req, res) {
        console.log('test');
        var user = {};
        user.firstName = 'serg';
        user.lastName = 'ovcharov';
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify(user));
        // var connection = mysql.createConnection(mysqlConnection);
        //
        // connection.connect();
        //
        // connection.query('SELECT firstName, lastName from users where id = 1', function (err, rows, fields) {
        //     if (err) {
        //         throw err;
        //     }
        //     user.firstName = rows[0].firstName;
        //     user.lastName = rows[0].lastName;
        //     res.header("Content-Type", "application/json");
        //     res.send(JSON.stringify(user));
        // });
        //
        // connection.end();
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
                for (i; i < recordset.length; i += 1) {
                    if(!result[recordset[i].Ch]) {
                        result[recordset[i].Ch] = {};
                        // console.log(typeof 'recordset.Ch');
                    }
                    if(!result[recordset[i].Ch].number){
                        result[recordset[i].Ch].number = recordset[i].Ch;
                        result[recordset[i].Ch].total = recordset[i].Total;
                        result[recordset[i].Ch].discount = recordset[i].discount;
                        result[recordset[i].Ch].time = recordset[i].time;
                    }
                    if(!result[recordset[i].Ch].goods) {
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
                for(i in result){
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
                    checksByTime = {};
                for (i; i < recordset.length; i += 1) {
                    var date = recordset[i].date.getFullYear() + '-' + (recordset[i].date.getMonth() + 1) + '-' + recordset[i].date.getDate();;
                    if(!result[recordset[i].time]) {
                        result[recordset[i].time] = {};
                    }
                    if(!result[recordset[i].time][date]) {
                        result[recordset[i].time][date] = {};
                    }
                    result[recordset[i].time][date].cash = recordset[i].total;
                    result[recordset[i].time][date].checks = recordset[i].checks;
                    result[recordset[i].time].time = recordset[i].time;
                    if(!sumByTime[date]) {
                        sumByTime[date] = 0;
                    }
                    if(!checksByTime[date]) {
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
            console.log("HURRAY");
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
