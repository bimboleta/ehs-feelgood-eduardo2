
/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

var express = require('express')
    , http = require('http')
    , path = require('path')


/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* load configuration settings from ENV, then settings.json.  Contains keys for OAuth logins. See 
* settings.example.json.  
**/

var jwt = require("jsonwebtoken");
var SecretKey = require("./utils/Keys").SecretKey;
var Database = require("./models/Database");
var Tarifacao = Database.Tarifacao;
var sequelize = Database.sequelize;

var app = express();
var makeID = (function () {
    var index = 0;
    return function () {
        return index++;
    }
})();

app.use(function (req, res, next) {
    req.id = makeID()
    next()
});
var async = require("async");

var requestTimer = {};
var userTax = {};
setInterval(function () {
    async.mapSeries(Object.keys(userTax), (id, next) => {

        Tarifacao.find({ where: { identificador: id } }).then(__ => {
            if (__ !== null) {
                sequelize.transaction(t => {
                    return Tarifacao.find({ where: { identificador: id } }, { transaction: t }).then(tarifa => {
                        tarifa.tempo += userTax[id] / 1000;
                        return tarifa.save({ transaction: t });
                    });
                }).then(() => {
                    userTax[id] = 0;
                    next();
                })
            } else {
                sequelize.transaction(t => {
                    return Tarifacao.create({ identificador: id, tempo: userTax[id] / 1000 }, { transaction: t });
                }).then(() => {
                    userTax[id] = 0;
                    next();
                });
            }
        });
    }, () => { });
}, 10000);
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'pug');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(function (req, res, next) {
        let user = null;
        if (req["cookies"].authorization) {
            try {
                user = jwt.verify(req["cookies"].authorization, SecretKey);
            }
            catch (e) { }
        }
        req["user"] = user;
        next();
    });
    app.use(function (req, res, next) {
        if (req["user"]) {
            requestTimer[req.id] = process.hrtime()[0] * 1000 + process.hrtime()[1] / 1000000;
            let processedTime;
            setTimeout(() => {
                // Se passar de 15 segundos e não responder, não cobrar
                if (processedTime !== undefined && !isNaN(processedTime)) {
                    let user = req["user"];
                    if (user.type === "Gerente") {
                        if (userTax[user.cpf] !== undefined)
                            userTax[user.cpf] += processedTime;
                        else {
                            userTax[user.cpf] = processedTime;
                        }
                    }
                }
                delete requestTimer[req.id];
            }, 15000);
            req.on("end", function () {
                if (requestTimer[req.id] !== undefined) {

                    processedTime = process.hrtime()[0] * 1000 + process.hrtime()[1] / 1000000 - requestTimer[req.id];
                }
            });
        }
        next();
    });
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);
});



app.configure('development', function () {
    app.use(express.errorHandler());
});

/**
* ROUTING
* -------------------------------------------------------------------------------------------------
* include a route file for each major area of functionality in the site
**/
require('./routes/home')(app);
require('./routes/tarifacao')(app);

var server = http.createServer(app);

/**
* RUN
* -------------------------------------------------------------------------------------------------
* this starts up the server on the given port
**/

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});