var express = require('express'),
    ntlm = require('express-ntlm');

var app = express();

var ntlm_cfg = {
    debug: function() {
        var args = Array.prototype.slice.apply(arguments);
        console.log.apply(null, args);
    },
    domain: 'CR-AD',
    domaincontroller: 'ldap://SRV-DC10',
    forbidden: function(request, response, next) {
        response.end(JSON.stringify( {"DomainName":"FORBIDDEN","UserName":"FORBIDDEN","Workstation":"FORBIDDEN"} ));    
    }
};

//app.use(ntlm(ntlm_cfg));

app.get('/test', ntlm(ntlm_cfg), function(request, response) {
    console.log(request.ntlm);
    response.end(JSON.stringify( request.ntlm )); 
    // {"DomainName":"MYDOMAIN","UserName":"MYUSER","Workstation":"MYWORKSTATION"}
});


app.get('/test2', function(request, response) {
    console.log(request.ntlm);
    response.end(JSON.stringify( {"DomainName":"ok"} )); 
    // {"DomainName":"MYDOMAIN","UserName":"MYUSER","Workstation":"MYWORKSTATION"}
});


app.all('*', function(request, response) {
    response.end(JSON.stringify(request.ntlm)); // {"DomainName":"MYDOMAIN","UserName":"MYUSER","Workstation":"MYWORKSTATION"}
});

console.log('Listen : 9989');

app.listen(9989);