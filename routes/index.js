let h2d = require('../functions/largeHexConv');

let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
const mysql = require('mysql');

let urlencodedParser = bodyParser.urlencoded({ extended: true });

/* Establish conn with DB*/
let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lora_web"
});
con.connect();

/* GET home page */
router
    .get('/', function(req, res) {
  res.render('index', { title: 'Résultats des noeuds' });
})
    /* POST user input */
    .post('/handler', urlencodedParser, function(req, res) {
        console.log("Post:", req.body.idinput);

        // large hex to dec function call
        let dmote = req.body.idinput;

        // avoid unecessary queries over 16 and check if correct hex (abcdef1234567890ABCDEF)
        let regex = /^[A-Fa-f0-9]{16}$/gm;

        if (dmote.match(regex) != null){
            // convert to dec
            let mote = h2d.h2d(req.body.idinput);
            console.log("Dec", mote);

            // just in case
            if (mote > 18446744073709551615){
                mote = "1";
            }

            /* Query to db */
            //Select last logged entry (test this mote: d'47DB55800029001F h'5177826204839378975 )
            con.query("select mote,time,data from mergedframes where mote="+mote+" order by time DESC LIMIT 11;", function (err, result) {
                console.log("Query result", result);
                // if not found
                if(result==undefined || result<1){
                    res.render('index', {
                        title: 'Résultats des noeuds',
                        state: "Noeud non trouvé!"
                    });
                }

                // if found in DB
                else {
                    res.status(201);

                    /* First element */
                    let stringData = result[0].data;
                    let arrayData = stringData.split('x');
                    let strTemps = JSON.stringify(result[0].time).substring(1,20);

                    /* Last log elements */
                    let stringLogData;
                    let arrayLogData;
                    let logTemps;
                    let strLogs ="";

                    // full log list
                    for (let i=1; i<result.length; i+=1){
                        console.log(i);
                        stringLogData = result[i].data;
                        arrayLogData = stringLogData.split('x');
                        logTemps = JSON.stringify(result[i].time).substring(1,20).replace("T", " ")
                        strLogs+=logTemps + " " + parseInt(arrayLogData[1], 16) + "d " + parseInt(arrayLogData[2], 16) + "%\r\n";
                    }

                    /* Send page*/
                    res.render('index', {
                        title: 'Résultats des noeuds',
                        state: "Noeud trouvé en bdd",
                        id: " "+dmote,
                        temps: " "+strTemps.replace("T", " "),
                        temperature: " "+parseInt(arrayData[1], 16) + " degrés",
                        humidite: " "+parseInt(arrayData[2], 16) + "%",
                        logs: strLogs

                    });

                }
            });
        }
        else {
            res.render('index', {
                title: 'Résultats des noeuds',
                state: "Nom de noeud incorrect !"
            });
        }

});
module.exports = router;
