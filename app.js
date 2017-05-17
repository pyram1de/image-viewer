var express = require('express');
var app = express();
var fs = require('fs');
var JSZip = require('jszip');
var xsltproc = require('xsltproc');
var port = process.env.PORT || 5431;
var db = {};
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/images';
var bodyParser = require('body-parser');
var moment = require('moment');
var logfile = __dirname + "\\log.log";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(url, function (err, theDB) {
    db = theDB;
    console.log('connected to db');
});
app.get('/other/UPM2V4.xsl', function (req, res) {
    //res.send(403,' you what');
    res.header('Content-Type', 'text/xsl');
    console.log(__dirname + '/public/other/UPM2V4.xsl');
    res.send(fs.readFileSync(__dirname + '/public/other/UPM2V4.xsl'));
});
app.use(function (req, res, next) {
    var nodeSSPI = require('node-sspi');
    var nodeSSPIObj = new nodeSSPI({
        retrieveGroups: true
    });
    nodeSSPIObj.authenticate(req, res, function (err) {
        res.finished || next();
    });
});

app.use(function (req, res, next) {
    next();
});
app.use(express.static('public'));


app.set('views', './src/views');

app.set('view engine', 'ejs');
app.get('/', function (req, res) {
    res.render('index', {
        place: 'world'
    });
});

app.get('/_api/people/getByNino/:nino', function (req, res) {
    var collection = db.collection('people');
    var nino = req.params.nino;
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'getByNino\t' + nino + '\r\n');
    collection.find({ "nino": RegExp(nino, "i") , "paylocation": { $ne :"9999 - Universities Superannuation Scheme Limited"} }).limit(10).toArray(function (err, something) {
        res.send(something);
    });
});

app.get('/_api/people/getBySurname/:surname/page/:page', function (req, res) {
    var collection = db.collection('people');
    var surname = req.params.surname;
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'getBySurnamePaged\t' + surname + '\r\n');
    if (!(surname.substr(surname.length - 1) === '*')) {
        surname = surname + '$';
    } else {
        surname = surname.substr(0, surname.length - 1);
    }
    if (!(surname.substr(0, 1) === '*')) {
        surname = '^' + surname;
    } else {
        surname = surname.substr(1, surname.length - 1);
    }
    console.log(surname);
    collection.find({ 
                        "surname": RegExp(surname, "i"),
                        $and : [{"paylocation": { $ne :"9999 - Universities Superannuation Scheme Limited" }}, {"paylocation" : { $ne : "9998 - USS Investment Management Limited" }}]
                    }).skip((Number(req.params.page, 10) - 1) * 10).limit(10).toArray(function (err, something) {
        res.send(something);
    });
});

app.get('/_api/people/getByNino/:nino/page/:page', function (req, res) {
    var collection = db.collection('people');
    var nino = req.params.nino;
    collection.find({ 
                        "nino": RegExp(nino, "i"),
                        $and : [{"paylocation": { $ne :"9999 - Universities Superannuation Scheme Limited" }}, {"paylocation" : { $ne : "9998 - USS Investment Management Limited" }}]
                    }).skip((Number(req.params.page, 10) - 1) * 10).limit(10).toArray(function (err, something) {
        res.send(something);
    });
});

//{$and :[{"paylocation": { $ne :"9999 - Universities Superannuation Scheme Limited" }}, {"paylocation" : { $ne : "9998 - USS Invesment Management Limited" }}] }

app.get('/_api/people/getBySurname/:surname', function (req, res) {
    var collection = db.collection('people');
    var surname = req.params.surname;
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'getBySurname\t' + surname + '\r\n');
    if (!(surname.substr(surname.length - 1) === '*')) {
        surname = surname + '$';
    } else {
        surname = surname.substr(0, surname.length - 1);
    }
    if (!(surname.substr(0, 1) === '*')) {
        surname = '^' + surname;
    } else {
        surname = surname.substr(1, surname.length - 1);
    }
    console.log(surname);
    collection.find({ 
                        "surname": RegExp(surname, "i"),
                        $and : [{"paylocation": { $ne :"9999 - Universities Superannuation Scheme Limited" }}, {"paylocation" : { $ne : "9998 - USS Investment Management Limited" }}]
                    }).limit(10).toArray(function (err, something) {
        res.send(something);
    });
});

app.get('/other/:imageId', function (req, res) {
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'downloadCalcImage\t' + req.params.imageId + '.xml' + '\r\n');
    if (fs.existsSync(__dirname + '/public/other/' + req.params.imageId + '.xml')) {
        console.log('file already cached... using');
        res.header('Content-Type', 'application/xml');
        res.sendfile(__dirname + '/public/other/' + req.params.imageId + '.xml');
    } else if (fs.existsSync(__dirname + '/public/other/' + req.params.imageId + '.zip')) {
        fs.readFile(__dirname + '/public/other/' + req.params.imageId + '.zip', function (err, data) {
            if (err) throw err;
            JSZip.loadAsync(data).then(function (zip) {
                return zip.file(req.params.imageId + '.xml').async('string');
            }).then(function (text) {
                console.log('unzipping and sending');
                fs.writeFile(__dirname + '/public/other/' + req.params.imageId + '.xml', text, function (err, done) {
                    console.log('written file');
                    console.log(err);
                    console.log(done);
                })
                res.header('Content-Type', 'application/xml');
                res.send(text);
            }
                );
        });
    } else {
        res.status(404).send('Not Found');
    }
});

String.prototype.replaceChar = function (char, replacement) {
    var target = this;
    console.log('***********');
    console.log(target);
    var arr = target.split(char);
    var joi = arr.join(replacement);
    console.log(joi);
    console.log('***********');
    return joi;
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var mimeType = {
    PDF: 'application/pdf',
    xml: 'application/xml',
    doc: 'application/msword',
    rtf: 'application/rtf',
    tif: 'image/tiff',
    tiff: 'image/tiff'
}

var docTypeAsc = {
    ELSE: 'eform.xsl',
    RTRE: "IRmarkReceipt.xslt",
    RTCLFPRE: "IRmarkReceipt.xslt",
    RTCLFIFP: "IRmarkReceipt.xslt",
    IRRE: "IRmarkReceipt.xslt",
    RTEARE: "IRmarkReceipt.xslt",
    P46PEN: "PENNOT.xslt",
    P4SUFO: "p45.xslt",
    P45PRT3: "p45p3.xslt",
    TEPEDE: "MyPersonDetailsExample.xslt",
    UNXM: "MyPersonDetailsExample.xslt",
    BUADNOSU: "BulkAddressSuccess.xslt",
    BUJOMAUP: "BulkJoinerFail.xslt",
    BUJOSUDA: "BulkJoinerSuccess2.xslt",
    BUOPSUDA: "BulkOptOutSuccess.xslt",
    BPD_XMLSUMM: "BulkPersonalDets.xslt",
    FIELDSUPDATED1: "EPenUpdated.xslt",
    EPENVALIDFAIL: "EPenValidFail.xslt",
    EJOINER: "JoinerData.xslt",
    PMAFTERTRAN: "KeyObjectViewsData.xslt",
    PMMOVETO: "KeyObjectViewsData.xslt",
    PMMOVEFROM: "KeyObjectViewsData.xslt",
    BNU_XMLSUMM: "NINOUpdate.xslt",
    PBPADJUSTRET: "PBPAnnualAdjustments.xslt",
    PBPADJUST: "PBPAnnualAdjustments.xslt",
    PBPADJUSTREF: "PBPAnnualAdjustments.xslt",
    PBPADJUSTDEF: "PBPAnnualAdjustments.xslt",
    PBPADJUSTDEA: "PBPAnnualAdjustments.xslt",
    BAVC_XMLSUMM: "PRUAVCUpdate.xslt",
    PTSFCHGMANUAL: "PTSFDetailsChange.xslt",
    PTSFCHGSUMMARY: "PTSFDetailsChange.xslt",
    CBP_XMLSUMM: "PTSF_CRB_data.xslt",
    BP_XMLSUMM: "PTSFdata.xslt",
    PERDETSCHGSUMMARY: "PersonalDetailsChange.xslt",
    PERDETSCHGMANUAL: "PersonalDetailsChange.xslt",
    PRIORYEAR: "PriorYearAdjustments.xslt",
    ca_auto_conts: "ca_auto_conts.xslt",
    ca_eform_conts: "ca_eform_conts.xslt",
    CA_AUTO_SAL: "ca_sal_secfile.xslt",
    LEAVEREFORMDETSFSDEF: "eLeaver.xslt",
    LEAVEREFORMDETSFSLEAVER: "eLeaver.xslt",
    LEAVEREFORMDETSFSREFUND: "eLeaver.xslt",
    LEAVEREFORMDETSFSREFUNDQ: "eLeaver.xslt",
    LEAVEREFORMDETSCRBSDEF: "eLeaver.xslt",
    LEAVEREFORMDETSCRBSLEAVER: "eLeaver.xslt",
    LEAVEREFORMDETSCRBSREFUND: "eLeaver.xslt",
    LEAVEREFORMDETSCRBSREFUNDQ: "eLeaver.xslt",
    BJ_XMLSUMM: "joinerdata.xslt",
}

app.get('/tiffs/:image/type/:ext/filename/:filename', function (req, res) {
    var image = req.params.image;
    var ext = req.params.ext;
    var filename = req.params.filename;
    res.header('Content-Type', mimeType[ext]);
    if (ext !== 'xml') {
        res.header('Content-Disposition', 'attachment; filename="' + filename + '"');
    }
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'downloadTiffImage\t' + image + '.' + ext + '\r\n');
    res.send(fs.readFileSync(__dirname + '/public/tiffs/' + image + '.' + ext));
});

app.post('/_api/getTiff', function (req, res) {
    var tiff = req.body;
    var data;

    if (tiff.fileExtension === "xml") {
        var replaceToken = docTypeAsc[tiff.docType];
        data = fs.readFileSync(tiff.location + tiff.docImageId + '.' + tiff.fileExtension, 'utf8');
        if (!replaceToken) {
            console.log('cannot find docType ' + tiff.docType);
            replaceToken = docTypeAsc['ELSE'];
        }
        data = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/tiffs/' + replaceToken + '"?>' + data.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
    } else {
        console.log(tiff);
        console.log(tiff.location + tiff.docImageId + '.' + tiff.fileExtension);
        data = fs.readFileSync(tiff.location + tiff.docImageId + '.' + tiff.fileExtension);
    }
    fs.writeFileSync(__dirname + '/public/tiffs/' + tiff.docImageId + '.' + tiff.fileExtension, data, { encoding: 'utf8' });
    res.header('Content-Type', mimeType[tiff.fileExtension]);
    console.log(tiff);
    res.send('/tiffs/' + tiff.docImageId + '/type/' + tiff.fileExtension + '/filename/' + tiff.docImageId + '_' + tiff.docDate.replaceChar('/', '_') + '_' + tiff.docDesc.replaceAll(':', '').replaceAll(' ', '_').replaceChar('/', '_') + '.' + tiff.fileExtension);
});



app.post('/_api/imagedata', function (req, res) {

    console.log(req.body);
    var image = req.body;
    var imageId = image.File.substr(0, image.File.length - 4);
    fs.appendFile(logfile, (new Date()).toISOString() + '\t' + req.ip + '\t' + req.connection.user + '\t' + 'downloadCalcImagePost\t' + imageId + '.xml' + '\r\n');
    var fileLocation = image.Location + imageId + '.zip';
    console.log(fileLocation);
    if (fs.existsSync(__dirname + '/public/other/' + imageId + '.xml')) {
        console.log('file already cached... using');
        res.send('/other/' + imageId);
    } else if (fs.existsSync(fileLocation)) {
        fs.readFile(fileLocation, function (err, data) {
            if (err) throw err;
            JSZip.loadAsync(data).then(function (zip) {
                return zip.file(imageId + '.xml').async('string');
            }).then(function (text) {
                console.log('unzipping and sending');
                fs.writeFile(__dirname + '/public/other/' + imageId + '.xml', text, function (err, done) {
                    console.log('written file');
                    console.log(err);
                    console.log(done);
                })
                res.header('Content-Type', 'text/xml');
                res.send('/other/' + imageId + '.xml');
            }
                );
        });
        console.log('exists');
    } else {
        console.log('not exists');
    }
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});
var counter = 0;

var ticker = function (time, callback) {
    setTimeout(function () {
        callback();
        ticker(time, callback);
    }, time);
}

ticker(10000, function () { // cleanup
    var i;
    var files = fs.readdirSync(__dirname + '/public/other/');
    for (i = 0; i < files.length; i++) {
        var fileStat = fs.statSync(__dirname + '/public/other/' + files[i]);
        if (fileStat.isDirectory()) {
            continue;
        }
        if (files[i] === "UPM2V4.XSL") {
            continue;
        }
        if (files[i].substr(files[i] - 4) === 'xslt') {
            continue;
        }
        if (files[i].substr(files[i] - 3) === 'xsl') {
            continue;
        }
        //console.log(fileStat);
        if (new moment(fileStat.ctime).add(90, 'minutes').isBefore(new moment())) {
            //console.log(files[i]);
            console.log('removing old file ' + files[i]);
            fs.unlinkSync(__dirname + '/public/other/' + files[i]);
        }
    }
    files = fs.readdirSync(__dirname + '/public/tiffs/');
    for (i = 0; i < files.length; i++) {
        var fileStat = fs.statSync(__dirname + '/public/tiffs/' + files[i]);
        if (fileStat.isDirectory()) {
            continue;
        }
        if (files[i] === "UPM2V4.XSL") {
            continue;
        }
        if (files[i].substr(files[i].length - 4) === 'xslt') {
            continue;
        }
        if (files[i].substr(files[i].length - 3) === 'xsl') {
            continue;
        }
        //console.log(fileStat);
        if (new moment(fileStat.ctime).add(90, 'minutes').isBefore(new moment())) {
            //console.log(files[i]);
            console.log('removing old file ' + files[i]);
            fs.unlinkSync(__dirname + '/public/tiffs/' + files[i]);
        }
    }
});
