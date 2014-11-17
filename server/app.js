var express = require('express');
var Grex = require('grex');
var http = require('http');
var querystring = require('querystring');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var _ = require('underscore');

var app = express();
app.enable('trust proxy');
app.use(cookieParser());
app.use(session({
                secret: 'randomsecretklsajl',
                cookie: { secure: true },
                proxy: true,
                resave: true,
                saveUninitialized: true
                })
        );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var sess;

var graphSettings = {
    'host': '127.0.0.1',
    'port': 8182,
    'graph': 'graph',
};
//create a rexster client
var client = Grex.createClient();
var gremlin = Grex.gremlin;
var g = Grex.g;


var checkSession = function(session) {
   if(!session.userId) {
     return false
   }
   return true;
}
client.connect(graphSettings, function(err, client){
    if(err) { console.log(err); }


    app.get('/api/isauth', function (req, res) {
        if(checkSession(req.session)) {
            res.send('true');
        }
        else {
            res.send('false');
        }
    });
    app.get('/api/details/movie/:id', function (req, res) {
        query = g.v(req.params.id).outE().inV();
        client.exec(query).done(function(response) {
            res.json(response.results);
        });
    });
    app.get('/api/details/actor/:id', function (req, res) {
        query = g.v(req.params.id).inE('Acted').outV();
        client.exec(query).done(function(response) {
            res.json(response.results);
        });
    });
    app.get('/api/details/director/:id', function (req, res) {
        query = g.v(req.params.id).inE('Directed').outV();
        client.exec(query).done(function(response) {
            res.json(response.results);
        });
    });
    app.get('/api/details/genre/:id', function (req, res) {
        query = g.v(req.params.id).inE('GENRE').outV();
        client.exec(query).done(function(response) {
            res.json(response.results);
        });
    });
    app.post('/api/like/:id', function (req, res) {
        if(checkSession(req.session)) {
            var query = gremlin();
            var v1 = query.var(g.v(req.session.userId));
            var v2 = query.var(g.v(req.params.id));
            query(g.addEdge(v1, v2,'Likes', { created : new Date().getTime() }));
            client.exec(query).done(function(response) {
                //console.log(response);
                res.send('done');
            });
        }
    });
    app.get('/api/isliked/:id', function (req, res) {
        if(checkSession(req.session)) {
            query = g.v(req.params.id).both('Likes').filter('{it == g.v('+req.session.userId+')}').count();
            client.exec(query).done(function(response) {
                //console.log(response);
                res.json(response.results);
            });
        }
    });
    app.post('/api/logout', function(req, res) {
        req.session.destroy();
        res.send('')
    });
    app.post('/api/login', function(req, res) {
        username = req.body.username;
        password = req.body.password;
        query = g.V('password',password)
        client.exec(query).done(function(response) {
            //console.log(response);
            if(response.results.length > 0){
                req.session.userId = response.results[0]['_id'];
                req.session.username = response.results[0]['username'];
                //console.log(req.session)
                res.send('done')
            }
            else
                res.send('error');
        });
    });
    app.post('/api/register', function(req, res) {
        username = req.body.username;
        password = req.body.password;
        email = req.body.email;
        bio = req.body.about;
        fullName = req.body.name;
        q = g.addVertex({'username':username, 'password':password, 'email':email, 'bio':bio, 'fullName':fullName})
        client.exec(q).done(function(response){
            //console.log(response)
            res.send('done')
        });
    });
    /*client.exec(g.v(334848)).done(function(response){
    /*client.exec(g.v(334848)).done(function(response){
        console.log(response);
    });*/
});

app.get('/api/rec', function(req, res) {
    var count = 0;
    var result = [];
    var qs = [];
    qs.push({
        script: 'i0=g.v('+req.session.userId+')\nx=[];i0.outE(\'Likes\').inV().has(\'type\',\'Movie\').aggregate(x);i0.outE(\'Likes\').inV().has(\'type\',\'Actor\').inE(\'Acted\').outV().outE(\'GENRE\').inV().inE(\'Likes\').outV().filter(){it == i0}.back(5).except(x).order({it.b.getProperty(\'rating\') <=> it.a.getProperty(\'rating\')})',
        'rexster.showTypes':true
    })
    qs.push({
        script: 'i0=g.v('+req.session.userId+')\nx=[];i0.outE(\'Likes\').inV().has(\'type\',\'Movie\').aggregate(x);i0.outE(\'Likes\').inV().has(\'type\',\'Actor\').inE(\'Acted\').outV().outE(\'Directed\').inV().inE(\'Likes\').outV().filter(){it == i0}.back(5).except(x).order({it.b.getProperty(\'rating\') <=> it.a.getProperty(\'rating\')})',
        'rexster.showTypes':true
    });
    qs.push({
        script: 'i0=g.v('+req.session.userId+')\nx=[];i0.outE(\'Likes\').inV().has(\'type\',\'Movie\').aggregate(x);i0.outE(\'Likes\').inV().has(\'type\',\'Director\').inE(\'Directed\').outV().outE(\'GENRE\').inV().inE(\'Likes\').outV().filter(){it == i0}.back(5).except(x).order({it.b.getProperty(\'rating\') <=> it.a.getProperty(\'rating\')})',
        'rexster.showTypes':true
    });
    /*qs.push({
        script: 'i0=g.v('+req.session.userId+')\ni0.outE(\'Likes\').inV().inE().outV().has(\'type\',\'Movie\').outE().inV().inE(\'Likes\').outV().filter(){it == i0}.back(5).has(\'type\',\'Movie\').order({it.b.getProperty(\'rating\') <=> it.a.getProperty(\'rating\')})',
        'rexster.showTypes':true
    });*/
    function getOptions(i){
        var options = {
            hostname: graphSettings.host,
            port: graphSettings.port,
            path: '/graphs/' + graphSettings.graph + '/tp/gremlin?'+ querystring.stringify(qs[i]),
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
        };
        return options;
    }
    function sendRes(){
        console.log('sending');
       res.json((_.sortBy(_.uniq(_.flatten(result)), function(item){return item.rating.value})).reverse())
    }
    for(i=0;i<qs.length;i++) {
        http.get(getOptions(i), function(resp) {
            var body = '';
            resp.on('data', function(chunk) {
                body += chunk;
            });
            resp.on('end', function() {
                body = JSON.parse(body);
                result.push(body.results)
                count++;
                if(count == qs.length)
                    sendRes();
            });
            if (body.message || body.success === false) {
                count++;
            }
        }).on('error', function(){
            count++
        });
    }

});

app.get('/api/search/:query', function (req, res) {
    //console.log(req.session);
    var qs = {
        script: 'g.V.has("name", Text.CONTAINS_REGEX, ".*'+req.params.query+'.*")',
        'rexster.showTypes': true
    };
    var options = {
        hostname: graphSettings.host,
        port: graphSettings.port,
        path: '/graphs/' + graphSettings.graph + '/tp/gremlin?'+ querystring.stringify(qs),
        headers: {
            'Content-type': 'application/json;charset=utf-8'
        }
    };
    //console.log(options)
    http.get(options, function(resp) {
        var body = '';
        resp.on('data', function(chunk) {
            body += chunk;
        });
        resp.on('end', function() {
            body = JSON.parse(body);
            res.json(body.results)
        });
        if (body.message || body.success === false) {
            res.send('error')
        }
    }).on('error', function(){
        res.send('error')
    });
});
app.get('/api', function (req, res) {
    res.send('GoodWatch API is running');
});


app.listen(12345)
