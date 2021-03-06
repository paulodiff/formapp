// Route for BRAV

// Api di protocollo per BRAV

// Suddivisa in parti: 
// 1. Autenticazione, 
// 2. Controllo JSON, 
// 3. Salvataggio Dati / log
// 4. Chiamata a Web Service per il protocollo
// 5. Risposta


var express = require('express');
var router = express.Router();
// var request = require('request');
var os = require('os');
var fs = require('fs');
var path = require('path');
var util = require('util');
var soap = require('soap');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jwt = require('jwt-simple');
var ENV   = require('../config.js'); // load configuration data
var ENV_BRAV   = require('../configBRAV.js'); // load user configuration data
var mongocli = require('../models/mongocli');
// var Segnalazione  = require('../models/segnalazione.js'); // load configuration data
// var flow = require('../models/flow-node.js')('tmp'); // load configuration data
var utilityModule  = require('../models/utilityModule.js'); 

var ACCESS_CONTROLL_ALLOW_ORIGIN = false;
// var DW_PATH = (path.join(__dirname, './storage'));
// var DW_PATH = './storage';
// var DW_PATH = ENV.storagePath;
var _ = require('lodash');

var log4js  = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', 
      filename: 'log/error-' + ENV_BRAV.log_filename, 
      category: 'error-file-logger',
      maxLogSize: 120480,
      backups: 10 
    },
    { type: 'file', 
      filename: 'log/access-' + ENV_BRAV.log_filename, 
      category: 'access-file-logger',
      maxLogSize: 120480,
      backups: 10 
    }
  ]
});
var logger = log4js.getLogger();
// init logging
var logCon  = log4js.getLogger();
// var loggerDB = log4js.getLogger('mongodb');

var log2file = log4js.getLogger('error-file-logger');
log2file.setLevel(ENV_BRAV.log_level);

var log2fileAccess = log4js.getLogger('access-file-logger');


module.exports = function(){

var WS_IRIDE =  "";
var MODO_OPERATIVO = "TEST";

router.get('/ping', function (req, res) {
  res.send('BRAV route pong!');
});


router.post('/protocollo',  utilityModule.ensureAuthenticated, function(req, res){

    // console.log(req.headers);
    // console.log(req.query);
    // console.log(req.user);

    // WS_IRIDE = ENV_BRAV.wsiride.url_test;
    WS_IRIDE = ENV_BRAV.wsJiride.url_test;

    if(req.body.produzione) {
        console.log('[##PRODUZIONE##]');
        WS_IRIDE = ENV_BRAV.wsiride.url_produzione;
        MODO_OPERATIVO = "PRODUZIONE";
    } 

    log2fileAccess.info('MODO OPERATIVO:' + MODO_OPERATIVO);
    console.log(MODO_OPERATIVO);
    console.log(WS_IRIDE);
    // ## log info ip

    console.log('[*] Test auth ...');

    // test req.user.userCompany
    if(req.user.userCompany != ENV_BRAV.security_company_filter){
        var msg = 'userCompany NO MATCH'
        console.error(msg);
        log2file.error(msg);
        res.status(401).json({message : msg});
        return;
    } 

    log2fileAccess.info('Log in:');
    log2fileAccess.info(req.user);

    // ## test Json Validation
    console.log('[*] Validation ...');
    // console.log(req.body);
    
    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    
    var schema = JSON.parse(fs.readFileSync('./bravSchema.json'));
    // var j2validate = JSON.parse(fs.readFileSync('./pacchettoBRAV.json'));
 
    var validate = ajv.compile(schema);
    var valid = validate(req.body);
    // console.log(valid);
    if (!valid) {
        console.error(validate.errors);
        var msg = 'Json validation error';
        console.error(msg);
        log2file.error(msg);
        log2file.error(validate.errors);
        res.status(401).json({message : msg, jsonvalidation : validate.errors});
        return;
    }

    //  ## Chiamata a protocollo ....

    console.log('// BODY ------------------------------------------------- ');
    console.log(req.body);
    console.log('// RICHIEDENTE ------------------------------------------------- ');
    console.log(req.body.richiedente);
    console.log('// RICHIEDENTE ------------------------------------------------- ');
    console.log(req.body.richiedente.nome);

    var DataProtocollo = "01/01/2000";
    var OggettoDescrizione = "BRAV PERMESSO N. " + req.body.numeroIdentificativoPermesso;
    var IdTipoDocumento = ENV_BRAV.wsiride.tipo_documento;
    var CodiceFiscale = req.body.richiedente.codiceFiscale;
    var CognomeNome = req.body.richiedente.cognome + ' ' + req.body.richiedente.nome;
    var DataDiNascita =  req.body.richiedente.dataDiNascita;
    var Note = "NOTE";
    var base64content = new Buffer(Note).toString('base64');


    var args = { 
           ProtoIn : {
                Data: DataProtocollo,
                Classifica: ENV_BRAV.wsiride.classifica,
                TipoDocumento: IdTipoDocumento,
                Oggetto: OggettoDescrizione,
                Origine: 'A',
                MittenteInterno: ENV_BRAV.wsiride.mittente_interno,
                //MittenteInterno_Descrizione": "",
                 
               MittentiDestinatari: {
                MittenteDestinatario: [
                  {
                    CodiceFiscale : CodiceFiscale,
                    CognomeNome: CognomeNome,
                    // DataNascita : DataDiNascita,
                    // Nome : 'RUGGERO',
                    // Spese_NProt : 0,
                    // TipoSogg: 'S',
                    // TipoPersona : 'F'
                  }
                ]
              },
              
              AggiornaAnagrafiche : 'S',
              InCaricoA : ENV_BRAV.wsiride.inCaricoA,
              NumeroDocumento : 1,
              NumeroAllegati : 2,
              Utente: ENV_BRAV.wsiride.utente,
              Ruolo: ENV_BRAV.wsiride.ruolo,
              Allegati: {  Allegato: []  }
            }
        };

// build attachements array

    
    
    // allegato principale
    args.ProtoIn.Allegati.Allegato.push(
        {
            TipoFile : 'pdf',
            ContentType : 'application/pdf',
            Image: fPDF,
            Commento : 'Allegato Principale'
        }
    );

    // allegati secondari
    console.log(req.body.numeroAllegati);
    if (parseInt(req.body.numeroAllegati) > 0) {
        req.body.allegati.forEach( function(item){

            args.ProtoIn.Allegati.Allegato.push(
                {
                    TipoFile : 'pdf',
                    ContentType : item.mimeType,
                    Image: fPDF,
                    Commento : item.nomeFile
                }
            );

        })
    }


    console.log(util.inspect(args));
    console.log(util.inspect(args.ProtoIn.MittentiDestinatari));
    console.log(util.inspect(args.ProtoIn.Allegati));
    console.log('wsurl:');

    console.log(WS_IRIDE);

    var soapResult = { result : '....'};
    

    soap.createClient(WS_IRIDE, function(err, client){
        
        console.log('soap call.....');
        // log2file.debug(client.describe());
        // console.log(client.describe());

        if (err) {
            var msg = 'Errore nella creazione del client soap';
            console.log(err);
            log2file.error(msg);
            log2file.error(err);
           res.status(500).json({
                msg : msg,
                message : err
            });
            return;
        }


        console.log(client.describe());
 
 /*
        var pars = {
            AnnoProtocollo : 2016,
            NumeroProtocollo : 44654,
            Utente : "M05831",
            Ruolo : "SETTORE SISTEMA INFORMATIVO"
        };

        client.LeggiProtocollo(pars, function(err, result) {
           log2file.debug(result);
           console.log(result);

           if (err) {
               var msg = 'Errore nella chiamata ad LeggiProtocollo';
                console.log(client.describe());
                console.log(err);
                log2file.error(msg);
                log2file.error(err);
                res.status(500).json({msg : msg, message : err});
                return;
            };

            soapResult = result;
  
        }); 
 */
 
        client.InserisciProtocolloEAnagrafiche(args, function(err, result) {
           
           // log2file.debug(result);
           // console.log(result);

           if (err) {
               var msg = 'Errore nella chiamata ad InserisciProtocollo';
                console.log(client.describe());
                console.log(err);
                log2file.error(msg);
                log2file.error(err);
                console.log(util.inspect(args.ProtoIn.MittentiDestinatari));
                console.log(util.inspect(args.ProtoIn.Allegati));
                // console.log(util.inspect(args.ProtoIn.Allegati2));
 
                res.status(500).json({msg : msg, message : err});
                return;
            };

            //soapResult = result;
            result.modoOperativo = MODO_OPERATIVO;
            log2fileAccess.debug(JSON.stringify(result));
            res.status(200).send(result);

        }); //client.InserisciProtocollo

	}); //soap.createClient


    // Memorizzazioni ulteriori

    console.log('Saving data to disk ...');

    // save to disk
   
    var dir = ENV.storagePath + "/" +  ENV_BRAV.storage_folder;
    console.log(dir);
    
    try {
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        
        // var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.txt';
        // fs.writeFileSync(fileName, req.body);

        // var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.json.txt';
        // fs.writeFileSync(fileName, JSON.stringify(req.body), 'utf-8');

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-req.body.util.txt';
        fs.writeFileSync(fileName,util.inspect(req.body), 'utf-8');

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '-args.txt';
        //str = JSON.stringify(obj, null, 4);
        fs.writeFileSync(fileName,JSON.stringify(args, null, 4), 'utf-8');

        log2fileAccess.debug('2disk!:' + fileName);

    } catch (err) {
        log2file.error('Errore save file!');
    }
    

});


router.get('/leggiProtocolloTest', function(req, res) {

       // WS_IRIDE = ENV_BRAV.wsiride.url_test;
        WS_IRIDE = ENV_BRAV.wsJiride.url_test;

        console.log(WS_IRIDE);
        console.log('create client....');

        var soapOptions = {
            endpoint: 'http://10.10.129.111:58000/client/services/ProtocolloSoap?CID=COCATEST'
        };


        soap.createClient(WS_IRIDE, soapOptions, function(err, client){
        
            console.log('soap call.....');
            // log2file.debug(client.describe());
            // console.log(client.describe());

            if (err) {
                var msg = 'Errore nella creazione del client soap';
                console.log(err);
                res.status(500).json({
                        msg : msg,
                        message : err
                    });
                return;
            }

            // console.log(client.describe());
    
            var pars = {
                AnnoProtocollo : 2016,
                NumeroProtocollo : 1,
                Utente : "wsalbo",
                Ruolo : "SETTORE SISTEMA INFORMATIVO"
            };

            client.LeggiProtocollo(pars, function(err, result) {
                // log2file.debug(result);
                // console.log(result);

                if (err) {
                    var msg = 'Errore nella chiamata a LeggiProtocollo';
                    //console.log(client.describe());
                    // console.log(err);
                    console.log('##', new Date(), "--------------------------------------");
                    console.log(err.response.request);
                    // log2file.error(msg);
                    // log2file.error(err);
                    res.status(500).json({"msg" : msg, "message" : err.response});
                    return;
                } else {
                    res.status(200).json(result);
                }
   
            }); 
 
        });

        // res.status(201).json('ok');
});


router.get('/token', function(req, res) {
    var user = {
        "userCompany": "BRAV S.R.L.",
        "userId": "utente",
        "userEmail": "info@brav.it",
        "userDescription": "Via del Portello 4/B 41058 Vignola (MO)",
        "userPassword": "password"
    };
    res.status(200).send(utilityModule.createJWT(user));

});

router.get('/j', function(req, res) {
    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    var schema = JSON.parse(fs.readFileSync('./bravSchema.json'));
    var j2validate = JSON.parse(fs.readFileSync('./pacchettoBRAV.json'));


    log2file.debug('Saving data to disk');

    // save to disk
   
    var dir = ENV.storagePath + "/" +  ENV_BRAV.storage_folder;
    log2file.debug('Errore nella creazione del client soap...');
    
    console.log(dir);
    
    try {

        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

        var fileName = dir + '/' + utilityModule.getTimestampPlusRandom() + '.data';
        console.log(fileName);

        fs.writeFileSync(fileName, j2validate);

        log2file.debug('Data saved!');
        log2file.debug(fileName);
    } catch (err) {
        log2file.error('Errore save file!');
    }

    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    }


    fs.writeFileSync('./b64PDF.txt', base64_encode('./prova.min.pdf'));
    fs.writeFileSync('./b64JPG.txt', base64_encode('./prova.min.jpg'));
    fs.writeFileSync('./b64TIF.txt', base64_encode('./prova.min.tif'));

    console.log(schema);
    console.log(j2validate);


    
    var validate = ajv.compile(schema);
    var valid = validate(j2validate);
    console.log(valid);
    if (!valid) console.log(validate.errors);
    res.status(201).json(valid);
});

var fTIF =

"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";

var fJPG = "/9j/4AAQSkZJRgABAQEAlgCWAAD/4gogSUNDX1BST0ZJTEUAAQEAAAoQAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tUAAQAAAADTLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAHxjcHJ0AAABeAAAACh3dHB0AAABoAAAABRia3B0AAABtAAAABRyWFlaAAAByAAAABRnWFlaAAAB3AAAABRiWFlaAAAB8AAAABRyVFJDAAACBAAACAxnVFJDAAACBAAACAxiVFJDAAACBAAACAxkZXNjAAAAAAAAACJBcnRpZmV4IFNvZnR3YXJlIHNSR0IgSUNDIFByb2ZpbGUAAAAAAAAAAAAAACJBcnRpZmV4IFNvZnR3YXJlIHNSR0IgSUNDIFByb2ZpbGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdGV4dAAAAABDb3B5cmlnaHQgQXJ0aWZleCBTb2Z0d2FyZSAyMDExAFhZWiAAAAAAAADzUQABAAAAARbMWFlaIAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9jdXJ2AAAAAAAABAAAAAAFAAoADwAUABkAHgAjACgALQAyADcAOwBAAEUASgBPAFQAWQBeAGMAaABtAHIAdwB8AIEAhgCLAJAAlQCaAJ8ApACpAK4AsgC3ALwAwQDGAMsA0ADVANsA4ADlAOsA8AD2APsBAQEHAQ0BEwEZAR8BJQErATIBOAE+AUUBTAFSAVkBYAFnAW4BdQF8AYMBiwGSAZoBoQGpAbEBuQHBAckB0QHZAeEB6QHyAfoCAwIMAhQCHQImAi8COAJBAksCVAJdAmcCcQJ6AoQCjgKYAqICrAK2AsECywLVAuAC6wL1AwADCwMWAyEDLQM4A0MDTwNaA2YDcgN+A4oDlgOiA64DugPHA9MD4APsA/kEBgQTBCAELQQ7BEgEVQRjBHEEfgSMBJoEqAS2BMQE0wThBPAE/gUNBRwFKwU6BUkFWAVnBXcFhgWWBaYFtQXFBdUF5QX2BgYGFgYnBjcGSAZZBmoGewaMBp0GrwbABtEG4wb1BwcHGQcrBz0HTwdhB3QHhgeZB6wHvwfSB+UH+AgLCB8IMghGCFoIbgiCCJYIqgi+CNII5wj7CRAJJQk6CU8JZAl5CY8JpAm6Cc8J5Qn7ChEKJwo9ClQKagqBCpgKrgrFCtwK8wsLCyILOQtRC2kLgAuYC7ALyAvhC/kMEgwqDEMMXAx1DI4MpwzADNkM8w0NDSYNQA1aDXQNjg2pDcMN3g34DhMOLg5JDmQOfw6bDrYO0g7uDwkPJQ9BD14Peg+WD7MPzw/sEAkQJhBDEGEQfhCbELkQ1xD1ERMRMRFPEW0RjBGqEckR6BIHEiYSRRJkEoQSoxLDEuMTAxMjE0MTYxODE6QTxRPlFAYUJxRJFGoUixStFM4U8BUSFTQVVhV4FZsVvRXgFgMWJhZJFmwWjxayFtYW+hcdF0EXZReJF64X0hf3GBsYQBhlGIoYrxjVGPoZIBlFGWsZkRm3Gd0aBBoqGlEadxqeGsUa7BsUGzsbYxuKG7Ib2hwCHCocUhx7HKMczBz1HR4dRx1wHZkdwx3sHhYeQB5qHpQevh7pHxMfPh9pH5Qfvx/qIBUgQSBsIJggxCDwIRwhSCF1IaEhziH7IiciVSKCIq8i3SMKIzgjZiOUI8Ij8CQfJE0kfCSrJNolCSU4JWgllyXHJfcmJyZXJocmtyboJxgnSSd6J6sn3CgNKD8ocSiiKNQpBik4KWspnSnQKgIqNSpoKpsqzysCKzYraSudK9EsBSw5LG4soizXLQwtQS12Last4S4WLkwugi63Lu4vJC9aL5Evxy/+MDUwbDCkMNsxEjFKMYIxujHyMioyYzKbMtQzDTNGM38zuDPxNCs0ZTSeNNg1EzVNNYc1wjX9Njc2cjauNuk3JDdgN5w31zgUOFA4jDjIOQU5Qjl/Obw5+To2OnQ6sjrvOy07azuqO+g8JzxlPKQ84z0iPWE9oT3gPiA+YD6gPuA/IT9hP6I/4kAjQGRApkDnQSlBakGsQe5CMEJyQrVC90M6Q31DwEQDREdEikTORRJFVUWaRd5GIkZnRqtG8Ec1R3tHwEgFSEtIkUjXSR1JY0mpSfBKN0p9SsRLDEtTS5pL4kwqTHJMuk0CTUpNk03cTiVObk63TwBPSU+TT91QJ1BxULtRBlFQUZtR5lIxUnxSx1MTU19TqlP2VEJUj1TbVShVdVXCVg9WXFapVvdXRFeSV+BYL1h9WMtZGllpWbhaB1pWWqZa9VtFW5Vb5Vw1XIZc1l0nXXhdyV4aXmxevV8PX2Ffs2AFYFdgqmD8YU9homH1YklinGLwY0Njl2PrZEBklGTpZT1lkmXnZj1mkmboZz1nk2fpaD9olmjsaUNpmmnxakhqn2r3a09rp2v/bFdsr20IbWBtuW4SbmtuxG8eb3hv0XArcIZw4HE6cZVx8HJLcqZzAXNdc7h0FHRwdMx1KHWFdeF2Pnabdvh3VnezeBF4bnjMeSp5iXnnekZ6pXsEe2N7wnwhfIF84X1BfaF+AX5ifsJ/I3+Ef+WAR4CogQqBa4HNgjCCkoL0g1eDuoQdhICE44VHhauGDoZyhteHO4efiASIaYjOiTOJmYn+imSKyoswi5aL/IxjjMqNMY2Yjf+OZo7OjzaPnpAGkG6Q1pE/kaiSEZJ6kuOTTZO2lCCUipT0lV+VyZY0lp+XCpd1l+CYTJi4mSSZkJn8mmia1ZtCm6+cHJyJnPedZJ3SnkCerp8dn4uf+qBpoNihR6G2oiailqMGo3aj5qRWpMelOKWpphqmi6b9p26n4KhSqMSpN6mpqhyqj6sCq3Wr6axcrNCtRK24ri2uoa8Wr4uwALB1sOqxYLHWskuywrM4s660JbSctRO1irYBtnm28Ldot+C4WbjRuUq5wro7urW7LrunvCG8m70VvY++Cr6Evv+/er/1wHDA7MFnwePCX8Lbw1jD1MRRxM7FS8XIxkbGw8dBx7/IPci8yTrJuco4yrfLNsu2zDXMtc01zbXONs62zzfPuNA50LrRPNG+0j/SwdNE08bUSdTL1U7V0dZV1tjXXNfg2GTY6Nls2fHadtr724DcBdyK3RDdlt4c3qLfKd+v4DbgveFE4cziU+Lb42Pj6+Rz5PzlhOYN5pbnH+ep6DLovOlG6dDqW+rl63Dr++yG7RHtnO4o7rTvQO/M8Fjw5fFy8f/yjPMZ86f0NPTC9VD13vZt9vv3ivgZ+Kj5OPnH+lf65/t3/Af8mP0p/br+S/7c/23////bAEMACAYGBwYFCAcHBwkJCAoMFA0MCwsMGRITDxQdGh8eHRocHCAkLicgIiwjHBwoNyksMDE0NDQfJzk9ODI8LjM0Mv/bAEMBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIBtoE2AMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APf6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACikdlRGdjhVGSfQVzjfEDwoktvG2uWoa4CsnJxhuV3HGFyOecUAdJRWVq3iXRtCZF1TUIbUvG0q+ZnlVxkj8xx1OeKiuPF2gWmj22qz6nDHZXX+okbOZfZVxuJ9sUAbVFYlr4v0C90q61O21OGS0tP8Aj4cAgxf7ykbh+VXbzWdO0/Shqd1dxxWRCETHoQxAXGPXIoAvUVi6t4u0HQ7n7NqGpRRXG3eYgrOyr6kKCQPc1pWN9a6lZQ3tlOk9tMu6ORDkMKALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBBff8AHhc/9cm/ka8k0zUPDy/s/wBzB51n5n2KRJIgQHNyc7MjqWztIPoPSvXbmMzWssSkBnQqM9ORXL+F/A+naZomkrqmmafPq1lCqG5EQcggkjDEZ4zQBhR2DSeMPAEWqQh7q30mRnV+dsqpGCfqDmtDUpYLX4x6XLqLpHbPpEiWTynC/aPMG8An+LZj867N7O1kvIrx7eJrmJWSOYoC6BsZAPUZwKi1HStP1e2+zalZW93DnOyeMOAfUZ6GgDioYLPWfirrSWuybT5NDW11BomBVpmkO0H1by8/hXPaFLPrNx4f8EXRLvoV7LJf8HmO3OIPqrb1/wC+a9Y0/TLDSbUWunWcFpADny4Iwi59cDvRDplhb6hPfw2cEd5cACadYwHkA6ZPU0Achfa9f3Pi/V9J0+40jSo7GKF7q7vYt7zblJ+UblG1RwSTTvhOQfAkO1kZftVxhkXCkea3Qdh7V0t/4f0bVLqK5v8ASrK6ni+5JNArsv4kVctrS2sojFawRQRlmcrGgUFmOScDuSSaAJqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9k=";

var fPDF ="JVBERi0xLjQNCiXi48/TDQo0IDAgb2JqDQo8PA0KL0xpbmVhcml6ZWQgMQ0KL0wgMTMwMDANCi9IIFsgOTMwIDEzMyBdDQovTyA2DQovRSA5NzI1DQovTiAxDQovVCAxMjc5NA0KPj4NCmVuZG9iag0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICANCnhyZWYNCjQgOQ0KMDAwMDAwMDAxNyAwMDAwMCBuDQowMDAwMDAwNjQ2IDAwMDAwIG4NCjAwMDAwMDEwNjMgMDAwMDAgbg0KMDAwMDAwMTI1MCAwMDAwMCBuDQowMDAwMDAxNDMyIDAwMDAwIG4NCjAwMDAwMDE3MDMgMDAwMDAgbg0KMDAwMDAwOTM0NyAwMDAwMCBuDQowMDAwMDA5NTU4IDAwMDAwIG4NCjAwMDAwMDA5MzAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDEzDQovUHJldiAxMjc4NA0KL0luZm8gMiAwIFINCi9Sb290IDUgMCBSDQovSUQgWzw1NmYxYzM3MzdmZTcwZDZlNGI2MzhhNzM0MmUyZmIwYj48NTZmMWMzNzM3ZmU3MGQ2ZTRiNjM4YTczNDJlMmZiMGI+XQ0KPj4NCnN0YXJ0eHJlZg0KMA0KJSVFT0YNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICANCjUgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL1BhZ2VzIDEgMCBSDQovTGFuZyAoaXQtSVQpDQovT3V0cHV0SW50ZW50cyBbIDw8IC9UeXBlIC9PdXRwdXRJbnRlbnQgL1MgL0dUU19QREZBMQ0KL091dHB1dENvbmRpdGlvbklkZW50aWZpZXIgKHNSR0IpIC9SZWdpc3RyeU5hbWUgKGh0dHA6Ly93d3cuY29sb3Iub3JnKSAvSW5mbw0KKENyZWF0b3I6IEhQICAgICBNYW51ZmFjdHVyZXI6SUVDICAgIE1vZGVsOnNSR0IpIC9EZXN0T3V0cHV0UHJv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";


//-------------------------------------------------------------------------------------------------------

router.get('/i',function(req, res) {

    console.log('i--protocollazione---------------');
    
    var DataProtocollo = "01/01/2000";
    var OggettoDescrizione = "BRAV - TEST - OGGETTO";
    var IdTipoDocumento = ENV_BRAV.wsiride.tipo_documento;
    var CodiceFiscale = 'RGGRGR70E25H294T';
    var CognomeNome = "RUGGERI RUGGERO";
    var DataDiNascita =  "25/05/1970";
    var Note = "NOTE";
    var base64content = new Buffer(Note).toString('base64');


    var args = { 
           ProtoIn : {
                Data: DataProtocollo,
                Classifica: ENV_BRAV.wsiride.classifica,
                TipoDocumento: IdTipoDocumento,
                Oggetto: OggettoDescrizione,
                Origine: 'A',
                MittenteInterno: ENV_BRAV.wsiride.mittente_interno,
                //MittenteInterno_Descrizione": "",
                 
               MittentiDestinatari: {
                MittenteDestinatario: [
                  {
                    CodiceFiscale : CodiceFiscale,
                    CognomeNome: CognomeNome,
                    DataNascita : DataDiNascita,
                    // Nome : 'RUGGERO',
                    // Spese_NProt : 0,
                    // TipoSogg: 'S',
                    // TipoPersona : 'F'
                  }
                ]
              },
              
              AggiornaAnagrafiche : 'S',
              InCaricoA : ENV_BRAV.wsiride.inCaricoA,
              NumeroDocumento : 1,
              NumeroAllegati : 1,
              Utente: ENV_BRAV.wsiride.utente,
              Ruolo: ENV_BRAV.wsiride.ruolo,
               
                Allegati: {
                  Allegato: [
                    {
                      TipoFile : 'txt',
                      ContentType : 'text/plain',
                      Image: base64content,
                      Commento : 'txt'
                    },
                    {
                      TipoFile : 'pdf',
                      ContentType : 'application/pdf',
                      Image: fPDF,
                      Commento : 'PDF'
                    },
                    {
                      TipoFile : 'tiff',
                      ContentType : 'image/tiff',
                      Image: fTIF,
                      Commento : 'TIF'
                    },
                    {
                      TipoFile : 'jpeg',
                      ContentType : 'image/jpeg',
                      Image: fJPG,
                      Commento : 'JPG'
                    }
                  ]
                }
               
            }
        };

    console.log(args);
    console.log('wsurl:');
    console.log(ENV_BRAV.wsiride.url);

    soap.createClient(ENV_BRAV.wsiride.url, function(err, client){
        
        console.log('soap call.....');
        log2file.debug(client.describe());
        console.log(client.describe());

        if (err) {
            console.log(err);
            log2file.error('Errore nella creazione del client soap...');
            log2file.error(err);
            res.status(500).json({message : err});
            return;
        }
 
        client.InserisciProtocollo(args, function(err, result) {
           
           log2file.debug(result);

           if (err) {
                console.log(err);
                log2file.error('Errore nella chiamata ad InserisciProtocollo');
                log2file.error(err);
                res.status(500).json({message : err});
                return;
              // TODO: RISPOSTA CON ERRORI
            };

  
            res.status(200).json({   
                      description : 'Risultato chiamata a protocollo', 
                      message: result 
            });
            return;
        }); //client.InserisciProtocollo
	}); //soap.createClient


    console.log('fine soap!');

});


// route per la protocollazione
router.post('/protocollo', multipartMiddleware, /* utilityModule.ensureAuthenticated, */  function(req, res) {
      console.log('/protocollo .... ');
      
      console.log(req.body);
      console.log(req.query);
      console.log(req.user);

      // var pagesize = parseInt(req.query.pageSize); 
      // var n =  parseInt(req.query.currentPage);
      // var collection = mongocli.get().collection('helpdesk');
      // var rand = Math.floor(Math.random()*100000000).toString();
      // db.users.find().skip(pagesize*(n-1)).limit(pagesize)
      // var searchCriteria = { "userData.userProvider": req.user.userProvider, $and: [ { "userData.userId": req.user.userId } ] };

      var searchCriteria = {};

      // from button OR
      var filterObjArray = [];
      if (req.query.filterButton) {
        if(_.isArray(req.query.filterButton)) {
          _(req.query.filterButton).forEach(function(v){
              console.log(v);
              var regex = new RegExp(".*" + v + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": v   };
              filterObjArray.push(obj1);
          });
        } else {
              var regex = new RegExp(".*" + req.query.filterButton + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": req.query.filterButton   };
              filterObjArray.push(obj1);
        }
      }

      console.log(filterObjArray);      

      // from input text
      if(req.query.filterData){
        var filterData = JSON.parse(req.query.filterData);
        console.log(filterData);
      }

      if(filterData) {
        console.log('1');
        console.log(req.query.filterData);
        if(filterData.globalTxt){
          console.log('2');

          //var stringToGoIntoTheRegex = "abc";
          var regex = new RegExp(".*" + filterData.globalTxt + ".*", "i");
          // at this point, the line above is the same as: var regex = /#abc#/g;

          var filterDataSearchCriteria =  {  "formModel.segnalazione.utenteRichiedenteAssistenza": regex   };
          searchCriteria["formModel.segnalazione.utenteRichiedenteAssistenza"] = regex;
        };    
      }
       
      console.log('----------------searchCriteria----------------------');
      if (!_.isEmpty(filterObjArray)){
          searchCriteria['$or'] =  filterObjArray;
      }
      console.log(searchCriteria);

      collection.find( searchCriteria ).skip(pagesize*(n-1)).limit(pagesize).toArray(function(err, docs) {
        console.log("Found the following records ... ");
        //console.dir(err);
        console.log(err);
        if(err){
            res.status(500).json(err);
        }else{
            res.status(201).json(docs);
        }
      });      
});


router.post('/hdupload', utilityModule.ensureAuthenticated,  multipartMiddleware, function(req, res) {
  console.log('/hduploading.....');
  console.log(req.files);
  console.log('/body.....');
  console.log(req.user);
  console.log(req.body);

  console.log('Counting insert'); 

  //var transactionId = req.body.fields.transactionId;
  var transactionId = 'segnalazioni';
  var ts = utilityModule.getTimestampPlusRandom();
  var dir = DW_PATH + "/" +  transactionId;
  var listOfFiles = [];

  if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

  if (req.files && req.files.files && req.files.files.length) {
    for (var i = 0; i < req.files.files.length; i++) {
      console.log(req.files.files[i].path);
      console.log(req.files.files[i].originalFilename);
      console.log(req.files.files[i].size);

      fs.renameSync(req.files.files[i].path, dir + "/" + ts + "-" + req.files.files[i].originalFilename);

      var oneFile = {
          path : dir,
          ts : ts,
          originalFilename: req.files.files[i].originalFilename,
          type: req.files.files[i].type,
          size :  req.files.files[i].size
      };

      console.log(oneFile);

      listOfFiles.push(oneFile);
    }
  }
  
  console.log(listOfFiles);

  var fileUploadedObj = { "fileUploaded" : oneFile};
  var tsObj = {
        "type" : 'helpdesk', 
        "ts" : new Date()
      };
  var userD = { "userData" : req.user };
  var fullObj = _.merge(req.body.fields, fileUploadedObj, tsObj, userD);

  //console.log(fullObj);

  var collection = mongocli.get().collection('helpdesk'); 

   collection.insert( fullObj, function(err, result) {
      if(err){
        console.log(err);
        return res.status(500).json({ message: 'Error insert segnalazione' });
      } else {
       return res.status(200).json({ message: 'Segnalazione inserted!' }); 
      }

    });
    
});


router.get('/getList', function(req, res) {
      console.log('/getList .... ');
      console.log(req.query);
      console.log(req.user);
      var pagesize = parseInt(req.query.pageSize); 
      var n =  parseInt(req.query.currentPage);
      var collection = mongocli.get().collection('helpdesk');
      var rand = Math.floor(Math.random()*100000000).toString();
      //db.users.find().skip(pagesize*(n-1)).limit(pagesize)
      //var searchCriteria = { "userData.userProvider": req.user.userProvider, $and: [ { "userData.userId": req.user.userId } ] };

      var searchCriteria = {};

      // from button OR
      var filterObjArray = [];
      if (req.query.filterButton) {
        if(_.isArray(req.query.filterButton)) {
          _(req.query.filterButton).forEach(function(v){
              console.log(v);
              var regex = new RegExp(".*" + v + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": v   };
              filterObjArray.push(obj1);
          });
        } else {
              var regex = new RegExp(".*" + req.query.filterButton + ".*", "i");
              var obj1 =  {  "formModel.segnalazione.softwareLista": req.query.filterButton   };
              filterObjArray.push(obj1);
        }
      }


      console.log(filterObjArray);      

      // from input text
      if(req.query.filterData){
        var filterData = JSON.parse(req.query.filterData);
        console.log(filterData);
      }

      if(filterData) {
        console.log('1');
        console.log(req.query.filterData);
        if(filterData.globalTxt){
          console.log('2');

          //var stringToGoIntoTheRegex = "abc";
          var regex = new RegExp(".*" + filterData.globalTxt + ".*", "i");
          // at this point, the line above is the same as: var regex = /#abc#/g;

          var filterDataSearchCriteria =  {  "formModel.segnalazione.utenteRichiedenteAssistenza": regex   };
          searchCriteria["formModel.segnalazione.utenteRichiedenteAssistenza"] = regex;
        };    
      }
       
      console.log('----------------searchCriteria----------------------');
      if (!_.isEmpty(filterObjArray)){
          searchCriteria['$or'] =  filterObjArray;
      }
      console.log(searchCriteria);

      collection.find( searchCriteria ).skip(pagesize*(n-1)).limit(pagesize).toArray(function(err, docs) {
        console.log("Found the following records ... ");
        //console.dir(err);
        console.log(err);
        if(err){
            res.status(500).json(err);
        }else{
            res.status(201).json(docs);
        }
      });      
});

/*
router.get('/download/:identifier', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  flow.write(req.params.identifier, res);
});


router.get('/test', function(req, res) {
  console.log('Get /download/identifier : '+ req.params.identifier);
  res.status(200).send({ok:1});
});

router.get('/map',function(req, res) {
  console.log('/map');
  
  var gUrl = "http://maps.googleapis.com/maps/api/geocode/json?address="+ req.query.address +  "&sensor=false";

  console.log(req.query);

  request.get({
          url: gUrl,
          proxy:'http://M05831:_Giugno2016@proxy1.comune.rimini.it:8080'
        },function (error, response, body) {
            //console.log(body);
            //console.log(response);
            if(error){
              return res.status(500).json(error);    
            } else {
              return res.status(200).send(body);    
            }
        });
  
});


router.post('/add-task', function(req, res) {
  models.Tasks
        .build({
            title: req.body.taskName,
            completed: false})
        .save()
        .then(function() {
          models.Tasks.findAll({}).then(function(taskList) {
                return res.status(200).json(taskList);
            });
        });
});

router.post('/create', function(req, res) {
  console.log(req.body.DICHIARANTI);
  console.log(req.body.NUCLEOFAMILIARE);
  console.log(req.body.UPLOADFILE);
  models.Person
        .build({
            email: req.body.DICHIARANTI.dichiarantePadre,
            title: req.body.DICHIARANTI.dichiaranteMadre,
            name: 'name',
            Blobs : req.body.UPLOADFILE,
            Tasks : [
              { title : 't1', completed : false},
              { title : 't2', completed : true}
              ],
            
            Nucleos: req.body.NUCLEOFAMILIARE,
            },
          {
             include: [ models.Tasks, models.Nucleos, models.Blobs ]
          })
        .save()
        .then(function() {
            models.Person.findAll({
                              include: [{
                                  model: models.Tasks
        //where: { state: Sequelize.col('project.state') }
                                        },
                                      {
                                  model: models.Nucleos
        //where: { state: Sequelize.col('project.state') }
                                        },
                                      {
                                  model: models.Blobs
        //where: { state: Sequelize.col('project.state') }
                                        },

                                        ]
                              }).then(function(taskList) {
                return res.status(200).json(taskList);
            });
        })
        .catch(function(error) {
          console.log(error);
          return res.status(500).json(error);
        });

});

*/

  return router;
}
