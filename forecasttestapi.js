app.get('/api/test/', function (req, res) {
        var connection,
        forecastForItem,
        salesData,
        i,
        j,
        k,
        dateReceived = '2016-04-30',
        item = 'УТ000000023',
        store = 1,
        dateArray = dateReceived.split('-'),
        dateTo = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
        dateFrom = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),
        dateMinusFifteen = new Date(dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]),

        day = dateFrom.getDay() + 1;
        dateFrom.setDate(dateFrom.getDate() - 90);
        dateMinusFifteen.setDate(dateMinusFifteen.getDate() - 60);
        dateTo = getDateString(dateTo);
        dateFrom = getDateString(dateFrom);
        dateMinusFifteen = getDateString(dateMinusFifteen);
        connection = new sql.Connection(mssqlConnection, function (err) {
            var request = new sql.Request(connection),
            //this query for all sales 1 and 2 weeks ago
            //
            query = "select sales.gName as good, sum(sales.qty) as qty, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateMinusFifteen + "') and c.Cash_Code = " + store + " and price > 0 and g.Code = '" + item + "') as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";

            request.query(query, function (err, recordset) {
                salesData = recordset;
                connection = new sql.Connection(mssqlConnection, function (err) {

                    var request = new sql.Request(connection),
                    //this query for all losses
                    //
                    query = "select sales.gName as good, sum(sales.qty) as qty, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateMinusFifteen + "') and c.Cash_Code = " + store + " and price = 0 and g.Code = '" + item + "') as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";

                    request.query(query, function (err, recordset) {
                        for (i = 0; i < salesData.length; i += 1) {
                            salesData[i].loss = 0;
                            for (j = 0; j < recordset.length; j += 1){
                                if(salesData[i].date.toISOString() === recordset[j].date.toISOString()) {
                                    salesData[i].loss = recordset[j].qty;
                                    recordset.splice(j,1);
                                    break;
                                }
                            }

                        }
                        connection = new sql.Connection(mssqlConnection, function (err) {

                            var request = new sql.Request(connection),
                            //this query for all last sales
                            //
                            query = "select sales.gName as good, max(dates) as timeOfLastSale, convert(date, dates) as date, code from (select c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateMinusFifteen + "') and c.Cash_Code = " + store + " and price > 0 and g.Code = '" + item + "') as sales group by convert(date, dates), sales.gName, code order by  convert(date, dates) asc";
                            // query = "select DATEPART(dw, c.DateOperation) as dweek, c.DateOperation as dates, c.Cash_Code as Store, c.Summa as Total, c.Disc_Sum as discount, g.Code as code, g.goodsName as gName, c2.Quant as qty, c2.Price as price, c2.Summa as Sum from Goods4 as g,ChequeHead as c,ChequePos as c2 where g.Code=c2.Code and c2.ChequeId=c.Id and (convert(date,c.DateOperation) <= '" + dateTo + "' and convert(date,c.DateOperation) >= '" + dateFrom + "') and c.Cash_Code = " + req.params.store + " and price > 0 and g.Code = '" + item + "' and DATEPART(dw, c.DateOperation) = 4";

                            request.query(query, function (err, recordset) {
                                for (i = 0; i < salesData.length; i += 1) {
                                    for (j = 0; j < recordset.length; j += 1){
                                        if(salesData[i].date.toISOString() === recordset[j].date.toISOString()) {
                                            salesData[i].timeOfLastSale = recordset[j].timeOfLastSale;
                                            recordset.splice(j,1);
                                            break;
                                        }
                                    }
                                }

                                //now let's count income
                                //
                                forecastForItem = forecast(salesData);
                                // console.log(forecastForItem);
                                salesData.splice(salesData.length-1,1);
                                salesData.splice(salesData.length-1,1);
                                res.header("Content-Type", "application/json");
                                res.send(JSON.stringify(salesData));
                            });
                        });
                    });
                });
            });
        });
    });
