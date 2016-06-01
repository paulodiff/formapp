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

    mysql_sequelize : {
        MYSQLusername: 'protoW',
        MYSQLpassword: 'protoWpassword',
        MYSQLdatabase: 'sequelize',
        MYSQLhost:     '10.10.128.40',
        MYSQLport: 3306
    },



    mysql : {
		MYSQLusername: 'protoW',
		MYSQLpassword: 'protoWpassword',
	    MYSQLdatabase: 'protocollo',
	    MYSQLhost:     '10.10.128.40',
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
    },


    // OAuth 2.0
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || 'YOUR_FACEBOOK_CLIENT_SECRET',
    FOURSQUARE_SECRET: process.env.FOURSQUARE_SECRET || 'YOUR_FOURSQUARE_CLIENT_SECRET',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    GITHUB_SECRET: process.env.GITHUB_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
    INSTAGRAM_SECRET: process.env.INSTAGRAM_SECRET || 'YOUR_INSTAGRAM_CLIENT_SECRET',
    LINKEDIN_SECRET: process.env.LINKEDIN_SECRET || 'YOUR_LINKEDIN_CLIENT_SECRET',
    TWITCH_SECRET: process.env.TWITCH_SECRET || 'YOUR_TWITCH_CLIENT_SECRET',
    WINDOWS_LIVE_SECRET: process.env.WINDOWS_LIVE_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
    YAHOO_SECRET: process.env.YAHOO_SECRET || 'YOUR_YAHOO_CLIENT_SECRET',
    BITBUCKET_SECRET: process.env.YAHOO_SECRET || 'YOUR_BITBUCKET_CLIENT_SECRET',

    // OAuth 1.0
    TWITTER_KEY: process.env.TWITTER_KEY || 'YOUR_TWITTER_CONSUMER_KEY',
    TWITTER_SECRET: process.env.TWITTER_SECRET || 'YOUR_TWITTER_CONSUMER_SECRET'

};
