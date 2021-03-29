var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mysql = require('mysql');

var urlencodedParser = bodyParser.urlencoded({ extended: true });

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lora_web"
});
con.connect();

/* GET home page. */
router
    .get('/', function(req, res, next) {
  res.render('index', { title: 'Résultats des noeuds' });
})
    .post('/handler', urlencodedParser, function(req, res) {
        console.log(req.body.idinput);
        let mote = req.body.idinput;

            /* Query to db */
                //Select last logged entry
                con.query("select mote,time,data from mergedframes where mote="+mote+" order by time DESC LIMIT 1;", function (err, result, fields) {
                    if(result==undefined){
                        res.render('index', {
                            title: 'Résultats des noeuds',
                            state: "Noeud non trouvé!"
                        });
                    }
                    else {
                        let stringData = result[0].data;
                        let arrayData = stringData.split('x');
                        //console.log(result[0]);
                        res.render('index', {
                            title: 'Résultats des noeuds',
                            state: "Noeud trouvé en bdd",
                            id: mote,
                            temps:(result[0].time).substr(1, 19),
                            temperature:parseInt(arrayData[1], 16) + " degrés",
                            humidite:parseInt(arrayData[2], 16) + "%"

                        });
                    }
                });
});

module.exports = router;
