// configuration
module.exports = {

    secret : '$2a$08$Cah/7nw6N1SQx1M2OIaCN.dUm5KnfabEekBoaeWosGV6EpWdq/qIG',
    server_version : '1.0',
    client_version : '1.0',
    status1 : 'debug', //api SismicReport debug:production
    status2 : 'debug', //apiP ProtocollazioneMobile  debug:production
    usertest : true,

    logging : {
        level: 'DEBUG',   // ERROR logging level
        name: 'mush.js',  // Category name for logging
    },


    mysql : {
		MYSQLusername: 'rouser',
		MYSQLpassword: 'ropass',
	    MYSQLdatabase: 'rimini',
	    MYSQLhost:     'srv-sgcdb.comune.rimini.it',
	    MYSQLport: 3306
    },

    nodejs : {
		NODEJSip:   '10.0.1.101',
		NODEJSport:  '3000'
    },

    socketio : {
       port: '5000'
    },

    mongodb : {
		MONGODB_URL: 'mongodb://rwuser:12345678@10.10.128.40:27017/protocollo'
    },

    wsiride : {
        url: 'http://irideweb.comune.rimini.it/ulisse/iride/web_services_20/wsProtocolloDM/WSProtocolloDM.asmx?op=Login&wsdl'
        //url: 'http://10.10.128.63/ulisse/iride/web_services/wsprotocollodm/wsprotocollodm.asmx?wsdl'
    }
};
