const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const fs  = require('fs');
const moment = require('moment');

const rpoGeneratedPdf = require('../repositories/generatedPdf');
const rpoSenders = require('../repositories/senders');

exports.generate = async function(data) {


    let now = Date.now();
    let pdfName = now +'-'+ data.trademark_number + '.pdf';

    let sender = await rpoSenders.getSenderById(data.sender);

    const PDFDocument = require('pdfkit');

    // Create a document
    const doc = new PDFDocument;
    var stream = doc.pipe(blobStream());

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream('public/pdf/'+ pdfName));

    doc.image ('public/uploads/'+sender[0].logo, 330, 20, { "width": 250 });

    doc.moveTo (30, 68);
    doc.lineTo (500,68);
    doc.stroke ();

    doc.font('public/fonts/Franklin Gothic Medium Regular.ttf')
    .fontSize(13)
    .text(`${sender[0].name} | ${sender[0].address} | ${sender[0].code} ${sender[0].state}`, 31, 48);

    doc.fontSize (8.5);
    doc.text (`${sender[0].name} | ${sender[0].address} | ${sender[0].code} ${sender[0].state} | ${sender[0].country}`, 69, 146);
    doc.moveTo (64, 156);
    doc.lineTo (330, 156);
    doc.stroke ();
    doc.moveTo (30,155);
    doc.fontSize (12);
    doc.text ('European Union Intellectual Property Office', 75, 175);
    doc.text ('Av. de Europa, 4');
    doc.text ('E-03008 Alicante');
    doc.text ('Espana');
    doc.text (`${sender[0].state}, ${moment(Date.now()).format('MMM D, YYYY')}`, 375, 275);
    doc.text (`European Union Trademark Application No. ${data.trademark_number} "${data.trademark_name}"`, 78, 335);
    doc.text (`Opposition ${data.opposition_number} by ${data.opponent}`);
    doc.moveDown ();

    if (data.opposition1) {
        doc.text (data.opposition1);
    }
    if (data.opposition2) {
        doc.text (data.opposition2);
    }
    if (data.opposition3) {
        doc.text (data.opposition3);
    }
    if (data.opposition4) {
        doc.text (data.opposition4);
    }

    doc.moveDown ();
    doc.text ('Dear Sirs, ');
    doc.moveDown ();
    doc.text ('In the proceedings referenced above we respectfully request an extension of present deadlines by at least an additional 2 months. ');
    doc.moveDown ();
    doc.text ('Due to the present public health crisis known as the “Covid Pandemic”, our operations are currently forced to work with skeleton staff, and we will require additional time to coordinate the necessary research to evaluate, and respond to, the subject opposition. ');
    doc.moveDown ();
    doc.text ('As current developments point to a worsening of the crisis rather than improvement, and a return to normalcy is uncertain, we would appreciate if the office could grant an extension for another 4 months.');
    doc.moveDown ();
    doc.moveDown ();
    doc.text ('Respectfully, ');
    doc.moveDown ();
    doc.image ('public/uploads/'+sender[0].signature, { "fit": [160, 999], "align": "left" });

    

    doc.end ();

    


    // STORE RECORD FOR FUTURE RETRIEVAL
    rpoGeneratedPdf.putGeneratedPdf({
        office: 'EUIPO',
        type: 'opposition',
        url: pdfName,
        created: now,
        name: data.trademark_name
    });
    
    return pdfName;
}

exports.createPng = async function(pdfName,pngName) {
    return new Promise(function(resolve, reject) {

        var path    = require('path');
        var pdf2img = require('pdf2img');

        var input   = __dirname + "/../public/pdf/" + pdfName;
 
        pdf2img.setOptions({
          type: 'png',                                // png or jpg, default jpg
          size: 1024,                                 // default 1024
          density: 600,                               // default 600
          outputdir: __dirname + path.sep + '../public/pdf/png', // output folder, default null (if null given, then it will create folder name same as file name)
          outputname: pngName,                         // output file name, dafault null (if null given, then it will create image name same as input name)
          page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
          quality: 100                                // jpg compression quality, default: 100
        });

        pdf2img.convert(input, function(err, info) {
            if (err) reject(err);
            else resolve(info);
          });

    });
}