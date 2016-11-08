// configuration BRAV
module.exports = {

    keyFile_produzione : './tmp/produzione2.pem',
    keyFile_test : './tmp/test.pem',     

    recuperaEventiElettorali: {
        templateFileName : './templateXML/recuperaEventiElettorali.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort'
    },

    recuperaInfoAreaAcquisizione: {
        templateFileName : './templateXML/recuperaInfoAreaAcquisizione.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSBase/ServiziElettoraliPort'
    },

    recuperaInfoAreaAcquisizioneVotantiReferendum: {
        templateFileName : './templateXML/recuperaInfoAreaAcquisizioneVotantiReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort'
    },

    recuperaInfoQuesiti: {
        templateFileName : './templateXML/recuperaInfoQuesiti.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort',
        xmlTagRisposta : 'InfoQuesitiReferendum'
    },

    invioSezioniReferendum: {
        templateFileName : './templateXML/invioSezioniReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumSezioni/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumSezioni/ServiziElettoraliPort'
    },


    invioElettoriReferendum: {
        templateFileName : './templateXML/invioElettoriReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumElettori/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumElettori/ServiziElettoraliPort'
    },

    invioElettoriReferendum: {
        templateFileName : './templateXML/invioElettoriReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumElettori/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumElettori/ServiziElettoraliPort'
    },

    inviaVotantiReferendum: {
        templateFileName : './templateXML/inviaVotantiReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumVotanti/ServiziElettoraliPort'
    },
    
    inviaScrutiniReferendum: {
        templateFileName : './templateXML/inviaScrutiniReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumScrutini/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumScrutini/ServiziElettoraliPort'
    },

    recuperaScrutiniReferendum: {
        templateFileName : './templateXML/recuperaScrutiniReferendum.xml',
        wsdl_produzione : 'https://elettoralews.interno.it/ServiziElettoraliWSReferendumScrutini/ServiziElettoraliPort',
        wsdl_test : 'https://elettoralews.preprod.interno.it/ServiziElettoraliWSReferendumScrutini/ServiziElettoraliPort'
    },


    log_filename: 'ELEZIONI.log',
    log_level : 'DEBUG',
    elastic_url : 'http://10.10.128.79:9200/elezioni/referendum/',
    proxy_url : 'http://proxy1.comune.rimini.it:8080',
    action_url : 'http://10.10.6.63:9988/elezioni/produzione/',

    storage_folder: 'folderNAME',
        
    key1 : '_'

};
