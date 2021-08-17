const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'CarlsJrY2S1@gmail.com',
    pass: "C@rlPass"
  }
});

const sendEmail =async function (toEmail, subject, text, html=''){
    const mailOptions = {
        from: 'Carls Jr <CarlsJrY2Y1@gmail.com>',
        to: toEmail,
        subject: subject,
        text: text,
        html: html
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
};

module.exports = sendEmail;