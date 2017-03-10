
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
var Service = Database.Service;
var Integrador = Database.Integrador;
var Contrato = Database.Contrato;
var Cliente = Database.Cliente;
var Fornecedor = Database.Fornecedor;

var app = express();
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
            let user = req["user"];
            if (user.type === "Cliente") {
                Cliente.find({ where: { cpf: user.cpf } }).then(function (cliente) {
                    if (!cliente) {
                        Cliente.create({ cpf: user.cpf }).then(function () { next() });
                    } else {
                        next();
                    }
                });
            } else if (user.type === "Integrador") {
                Integrador.find({ where: { cnpj: user.cnpj } }).then(function (integrador) {
                    if (!integrador)
                        Integrador.create({ cnpj: user.cnpj }).then(function () { next() });
                    else
                        next();
                });
            } else if (user.type === "Fornecedor") {
                Fornecedor.find({ where: { cnpj: user.cnpj } }).then(function (fornecedor) {
                    if (!fornecedor)
                        Fornecedor.create({ cnpj: user.cnpj }).then(function () { next() });
                    else
                        next();
                });
            }
        } else {
            next();
        }
    });
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
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


var server = http.createServer(app);

/**
* RUN
* -------------------------------------------------------------------------------------------------
* this starts up the server on the given port
**/

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});