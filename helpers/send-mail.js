const nodemailer = require("nodemailer");
const config = require("../config");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.mail,
        pass: config.email.password
    }
});

module.exports = transporter;