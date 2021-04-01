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
                //Select last logged entry (test this mote: 5177826204839378975 )
                con.query("select mote,time,data from mergedframes where mote="+mote+" order by time DESC LIMIT 11;", function (err, result, fields) {
                    if(result==undefined){
                        res.render('index', {
                            title: 'Résultats des noeuds',
                            state: "Noeud non trouvé!"
                        });
                    }
                    else {
                        res.status(201);

                        /* First element */
                        console.log(result);
                        let stringData = result[0].data;
                        let arrayData = stringData.split('x');
                        let strTemps = JSON.stringify(result[0].time).substring(1,20);

                        /* Last log elements */
                        let stringLogData;
                        let arrayLogData;
                        let logTemps;
                        let strLogs ="";

                        for (let i=1; i<11; i+=1){
                            console.log(i);
                            stringLogData = result[i].data;
                            arrayLogData = stringLogData.split('x');
                            logTemps = JSON.stringify(result[i].time).substring(1,20).replace("T", " ")
                            strLogs+=logTemps + " " + parseInt(arrayLogData[1], 16) + "d " + parseInt(arrayLogData[2], 16) + "%\r\n";
                        }

                        res.render('index', {
                            title: 'Résultats des noeuds',
                            state: "Noeud trouvé en bdd",
                            id: " "+mote,
                            temps: " "+strTemps.replace("T", " "),
                            temperature: " "+parseInt(arrayData[1], 16) + " degrés",
                            humidite: " "+parseInt(arrayData[2], 16) + "%",
                            logs: strLogs

                        });


                    }
                });
});

module.exports = router;
