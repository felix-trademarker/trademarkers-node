const nodemailer = require("nodemailer");

const fs = require("fs");
const ejs = require("ejs");

let rpoOutbox = require('../repositories/outbox');
let rpoEvent = require('../repositories/events');

let actionService = require('../services/actionService');

let moment = require('moment');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD
  }
});

exports.contact = async function(data) {

  return await transporter.sendMail({
  sender: data.name,
  replyTo: data.email,
  from: data.email, 
  // to: "felix@bigfoot.com",
  to: process.env.MAIL_TO,
  subject: "New Contact from client | " + data.name, 
  html: `<p>Hi Admin,</p>
          <p>New Contact Us Inquiry:</p>
          <p>Name: ${data.name}<br>
          From: ${data.email}<br>
          Phone: ${data.phone}<br>
          Inquiry Type: ${data.inquiry}<br>
          Message: ${data.message}</p>
      `, 
  });
  
}

exports.sendQuote = async function(quoteData) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/quoteAdminNotification.ejs", { data: quoteData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          to: "carissa@trademarkers.com",
          bcc: ["febongo@gmail.com", "felix@bigfoot.com"],
          subject: "New Quote: " + quoteData.quoteType, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          if (err) {
            res.flash('error', 'Sorry, something went wrong, try again later!');
          } else {
            res.flash('success', 'Thank You! Your message has been successfully sent. We’ll get back to you very soon.');
          }

          res.redirect("/quote/"+data.quoteType);

        });
      // })
       
    }
    
  });


}

exports.newServiceOrder = async function(data) {

  let toMail = "info@trademarkers.com";
  let bcc = ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"];
  let subject = "New Service Action | " + data.code;

  return await transporter.sendMail({
  sender: 'Trademarkers LLC',
  replyTo: process.env.MAIL_FROM,
  from: process.env.MAIL_FROM, 
  to: toMail,
  bcc: bcc,
  subject: subject, 
  html: `<p>Hi Admin,</p>
          <p>New Service action created!</p>
          <p>Name: ${data.name}<br>
          Description : ${data.description}<br>
          Amount : $${data.amount}<br>
          Code: ${data.code}<br>
          Link: https://www.trademarkers.com/checkout/${data.code}</p>
      `, 
  });
  
}



exports.researcherNotify = async function(message, toMail, subject) {

  return await transporter.sendMail({
    sender: 'Trademarkers LLC',
    replyTo: process.env.MAIL_FROM,
    from: process.env.MAIL_FROM, 
    to: toMail,
    subject: subject, 
    html: message, 
  });

}

exports.eventEmail = async function(mailData) {

  // return;
  console.log("sending...");
  ejs.renderFile(__dirname+"/../email-templates/opposition-euipo.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: mailData.email.email,
          // to: "mg@bigfoot.com",
          to: "felix@trademarkers.com",
          subject: mailData.event.case.name+": Enforce Your Trademark Rights Now Before It's Too Late!", 
          html: data
        };

        let mailResponse = await transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            // eventMailData.outbox = err;
            rpoOutbox.put(err)
            res = err;
            // return err;
          } else {
  
            rpoOutbox.put(info)
            res = info;

          }

          res.mailContent = mainOptions.html

          return res;
        });
        

        // UPDATE EVENT RECORD 
        let event = await rpoEvent.getId(mailData.event._id);


        let eventMailData = {
          mailContent: [mainOptions]
        }

        if ( !Array.isArray(event[0].mailContent) && event[0].mailContent ) {
          let mailContentOld = {
            sender : event[0].mailContent.sender,
            replyTo: event[0].mailContent.replyTo,
            from : event[0].mailContent.from,
            to : event[0].mailContent.to,
            subject : event[0].mailContent.subject,
            html : event[0].mailContent.html,
          }
          // eventMailData.mailContent = [];
          eventMailData.mailContent.push(mailContentOld);
        } 

        if (event[0].mailContent && Array.isArray(event[0].mailContent)) {
          event[0].mailContent.forEach(content => {
              if ( content ) {
                  console.log(content);
                  eventMailData.mailContent.push(content);
              }
          });
        } 

        rpoEvent.addMailed(mailData.event._id,eventMailData);
    }
    
  });


}


exports.sendSOU = async function(mailData) {

  // return;
  console.log("sending...");
  ejs.renderFile(__dirname+"/../email-templates/uspto-sou.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: mailData.user.email,
          // bcc: "michael@trademarkers.com",
           to: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark - " + mailData.trademark.name, 
          html: data
          // attachments: [{'filename': mailData.fileName, 'content': file}]
        };

        // transporter.sendMail(mainOptions, function (err, info) {
          
        //   let res;
          
        //   if (err) {
        //     console.log(err);
        //     res = err;
        //   } else {
        //     console.log(info);
        //     res = info;

        //   }

        // });
      // })
       
    }
    
  });


}

exports.sendNOA = async function(mailData) {

  let transporterMG = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'michael@trademarkers.com', 
      pass: 'bigfoot12345'
      // user: 'felix@trademarkers.com', 
      // pass: 'ixtkyqshzloqnoru'
      // user: process.env.MAIL_USERNAME, 
      // pass: process.env.MAIL_PASSWORD
    }
  });

  let mailSender = 'Michael <michael@trademarkers.com>';

  // check dates to pass proper template
  let template = '';
  // let moment().
  mailData.dateFiledFormatted = moment(mailData.dateIssue).format('MMM D, YYYY');
  mailData.dateDeadFormatted = moment(mailData.deadlineDate).format('MMM D, YYYY');

  // console.log("weeks issue =>>>>>>>>>> ", mailData.dateIssue, moment().diff(mailData.dateIssue, 'weeks') );
  // console.log("weeks dead =>>>>>>>>>> ", mailData.deadlineDate, moment().diff(mailData.deadlineDate, 'weeks') );

  let dateIssue = moment(moment()).diff(mailData.dateIssue, 'weeks')
  let deadIssue = moment(mailData.deadlineDate).diff(moment(), 'weeks')

  if ( dateIssue <= 3 ) {
    template = 'noa-3weeks-plain.ejs'
  } else if ( dateIssue >= 4 && dateIssue < 12 ) {
    template = 'noa-4weeks-plain.ejs'
  } else if ( deadIssue <= 8 && deadIssue > 0 ) {
  // } else {
    template = 'noa-8weeks-plain.ejs';

    mailData.numberOfWeeks = deadIssue;

  }

  mailData.showUsptoLink = dateIssue <= 6 ? true : false;


  if ( !template && deadIssue < 0 ) {
    template = 'noa-8weeks-plain.ejs';
  }
  console.log("template", template);


  if (template) {
    console.log('has template');
  ejs.renderFile(__dirname+"/../email-templates/" + template, { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      console.log('attempt to snd');

      let to = mailData.user.email
      
        let mainOptions = {
          sender: mailSender,
          replyTo: mailSender,
          from: mailSender, 
          to: to,
          // bcc: "michael@trademarkers.com",
           bcc: "felix@trademarkers.com",
           //bcc: "mg@bigfoot.com, carissa@chinesepod.com, felix@trademarkers.com",
          subject: "IMPORTANT NOTICE: Statement of use for your trademark application " + mailData.trademark.name + " - " + mailData.serialNumber, 
          html: data
        };

        
        
        transporterMG.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
       
    }
    
  });
  }


}
 
// order notification

exports.sendOrderNotification = async function(order) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/orderAdminNotification.ejs", { order: order }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "info@trademarkers.com",
          // bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com","felix@bigfoot.com"],
          to: "felix@trademarkers.com",
          bcc: ["febongo@gmail.com", "felix@bigfoot.com"],
          subject: "New order | " + order.charge.description, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}


exports.sendSouSummary = async function(mailData) {
  console.log(mailData);
  // return;
  ejs.renderFile(__dirname+"/../email-templates/souSummaryNotification.ejs", { mailData: mailData }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          // to: "felix@trademarkers.com",
          to: "michael@trademarkers.com",
          bcc: ["felix@trademarkers.com", "carissa@trademarkers.com"],
          subject: "Email Notification Monitoring", 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}


exports.sendAdminNotificationCustomerEmailUpdate = async function(user) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/adminNotificationCustomerEmailUpdate.ejs", { user: user }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: "michael@trademarkers.com",
          bcc: ["felix@trademarkers.com", "carissa@trademarkers.com"],
          subject: "Customer Detail Updated " + user.id, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}


exports.sendCertificateNotification = async function(trademark) {

  // return;
  ejs.renderFile(__dirname+"/../email-templates/orderAdminNotification.ejs", { order: order }, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
      // fs.readFile(mailData.fileUrl, function (err, file) {
        let mainOptions = {
          sender: process.env.MAIL_FROM,
          replyTo: process.env.MAIL_FROM,
          from: process.env.MAIL_FROM, 
          to: "info@trademarkers.com",
          bcc: ["carissa@trademarkers.com", "billing-trademarkers@moas.com"],
          // to: "felix@trademarkers.com",
          // bcc: ["febongo@gmail.com", "felix@bigfoot.com"],
          subject: "New order | " + order.charge.description, 
          html: data
        };

        transporter.sendMail(mainOptions, function (err, info) {
          
          let res;
          
          if (err) {
            console.log(err);
            res = err;
          } else {
            console.log(info);
            res = info;

          }

        });
      // })
       
    }
    
  });


}