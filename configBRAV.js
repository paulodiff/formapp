// configuration BRAV
module.exports = {

    log_filename: 'log-brav.log',
    log_level : 'DEBUG',
    security_company_filter : 'BRAV S.R.L.',
    wsJiride : {
        url_produzione : 'http://test-sicraweb:58000/client/services/ProtocolloSoap?wsdl',
        url_test : 'http://10.10.129.111:58000/client/services/ProtocolloSoap?wsdl',
        // url : 'http://srv-irideweb.ad.comune.rimini.it/ulisse/iride/web_services_20/wsProtocolloDM/WSProtocolloDM.asmx?wsdl',
        tipo_documento : '01001',
        classifica : '001 006 001',
        mittente_interno :'404',
        utente : "M05831",
        ruolo : "SETTORE SISTEMA INFORMATIVO",
        inCaricoA : '404'
    },
    
    wsiride : {
        url_produzione : 'http://irideweb.comune.rimini.it/ulisse/iride/web_services_20/wsProtocolloDM/WSProtocolloDM.asmx?wsdl',
        url_test : 'http://10.10.128.63/ulisse/iride/web_services/wsprotocollodm/wsprotocollodm.asmx?wsdl',
        // url : 'http://srv-irideweb.ad.comune.rimini.it/ulisse/iride/web_services_20/wsProtocolloDM/WSProtocolloDM.asmx?wsdl',
        tipo_documento : '01001',
        classifica : '001 006 001',
        mittente_interno :'404',
        utente : "M05831",
        ruolo : "SETTORE SISTEMA INFORMATIVO",
        inCaricoA : '404'
    },

    /*
        logger.trace('Entering cheese testing');
        logger.debug('Got cheese.');
        logger.info('Cheese is Gouda.');
        logger.warn('Cheese is quite smelly.');
        logger.error('Cheese is too ripe!');
        logger.fatal('Cheese was breeding ground for listeria.');
    */
    storage_folder: 'brav',
        
    key1 : '_',

    key2 : {
        k1: 'k1',
        k2: 'k2'
    }
};


/*


    "userCompany": "BRAV S.R.L.",
    "userId": "utente",
    "userEmail": "info@brav.it",
    "userDescription": "Via del Portello 4/B 41058 Vignola (MO)",
    "userPassword": "password"

*/