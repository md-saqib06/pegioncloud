const nodemailer = require('nodemailer');

async function sendMail(data) {
    let transporter = nodemailer.createTransport({ 
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
        
     });

     let info = await transporter.sendMail({
        from : `PegionCloud <${data.from}>`,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html
     });
}

module.exports = sendMail;