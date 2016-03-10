(function () {
    "use strict";
    var express = require('express'),
        mysql = require('mysql'),
        sql = require('mssql'),
        mysqlConnection = require(__dirname + '/../dbconnectmysqlnode.js'),
        mssqlConnection = require(__dirname + '/../dbconnectmssqlnode.js'),
        app = express();

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/test', function (req, res) {

        var connection = mysql.createConnection(mysqlConnection);

        connection.connect();

        connection.query('SELECT firstName, lastName from users where id = 1', function (err, rows, fields) {
            if (err) {
                throw err;
            }
            user.firstName = rows[0].firstName;
            user.lastName = rows[0].lastName;
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify(user));
        });

        connection.end();
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
            console.log(query);

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            console.info(rows);
        });

        connection.end();
    });

    app.listen(5555, function () {
        var date = new Date();
        console.log('fv server runs at 5555 ' + __dirname + ' ' + date);
    });
}());
