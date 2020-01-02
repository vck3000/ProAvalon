const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.PROAVALON_EMAIL_ADDRESS_DOMAIN;
const server_domain = process.env.SERVER_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
const uuidv4 = require('uuid/v4')

module.exports.sendEmailVerification = (user, email) => {

    if (user.emailVerified === true) {
        // Don't send an email if the user is already verified...
        return;
    }
    if (email) {
        email = email.toLowerCase();
        user.emailAddress = email;
        user.markModified("emailAddress");
    }

    const token = uuidv4();

    const message = `
    <!DOCTYPE html>
<html lang="en">
    <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Mailgun Account Verification Required</title>
        <style type="text/css">
            /* -------------------------------------
                CONFIGURE YOUR VARIABLES
            ------------------------------------- */
            /* -------------------------------------
                GLOBAL RESETS
            ------------------------------------- */
            table,
            td,
            div,
            a {
              box-sizing: border-box;
            }
            
            img {
              -ms-interpolation-mode: bicubic;
              max-width: 100%;
            }
            
            body {
              font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
              font-size: 14px;
              height: 100% !important;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
              width: 100% !important;
            }
            
            /* Let's make sure all tables have defaults */
            table {
              -premailer-width: 100%;
              border-collapse: separate !important;
              border-spacing: 0;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
              width: 100%;
            }
            table td {
              vertical-align: top;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            
            /* -------------------------------------
                BODY & CONTAINER
            ------------------------------------- */
            body {
              background-color: #f6f6f6;
            }
            
            .body {
              background-color: #f6f6f6;
              border-spacing: 0;
              width: 100%;
            }
            .body table {
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }
            
            /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
            .container {
              display: block;
              margin: 0 auto !important;
              /* makes it centered */
              max-width: 580px;
              padding: 10px;
              text-align: center;
              width: auto !important;
              width: 580px;
            }
            
            /* This should also be a block element, so that it will fill 100% of the .container */
            .content {
              display: block;
              margin: 0 auto;
              max-width: 580px;
              padding: 10px;
              text-align: left;
            }
            
            /* -------------------------------------
                HEADER, FOOTER, MAIN
            ------------------------------------- */
            .main {
              background: #fff;
              border: 1px solid #e9e9e9;
              border-radius: 3px;
              border-spacing: 0;
              width: 100%;
            }
            
            .wrapper {
              padding: 30px;
            }
            
            .content-block {
              padding: 0 0 30px;
            }
            
            .header {
              margin-bottom: 30px;
              margin-top: 20px;
              width: 100%;
            }
            
            .footer {
              clear: both;
              width: 100%;
            }
            .footer * {
              color: #999;
              font-size: 12px;
            }
            .footer td {
              padding: 20px 0;
            }
            
            /* -------------------------------------
                TYPOGRAPHY
            ------------------------------------- */
            h1,
            h2,
            h3 {
              color: #000;
              font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
              font-weight: 400;
              line-height: 1.4;
              margin: 0;
              margin-bottom: 30px;
            }
            
            h1 {
              font-size: 38px;
              text-transform: capitalize;
              font-weight: 300;
            }
            
            h2 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            
            p + h2 {
              margin-top: 30px;
            }
            
            h3 {
              font-size: 18px;
            }
            
            h4 {
              font-size: 14px;
              font-weight: 500;
            }
            
            p,
            ul,
            ol,
            td {
              font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
              font-size: 14px;
              font-weight: normal;
              margin: 0;
            }
            
            p,
            ul,
            ol {
              margin-bottom: 15px;
              padding: 0;
            }
            p li,
            ul li,
            ol li {
              list-style-position: inside;
              margin-left: 15px;
              margin-bottom: 15px;
            }
            
            a {
              color: #348eda;
              font-weight: bold;
              text-decoration: underline;
            }
            
            /* -------------------------------------
                BUTTONS
            ------------------------------------- */
            .btn {
              margin-bottom: 15px;
              width: auto;
              -premailer-width: auto;
            }
            .btn td {
              background-color: #fff;
              border-radius: 5px;
              text-align: center;
            }
            .btn a {
              background-color: #fff;
              border: solid 1px #348eda;
              border-radius: 5px;
              color: #348eda;
              cursor: pointer;
              display: inline-block;
              font-size: 14px;
              font-weight: bold;
              margin: 0;
              padding: 12px 25px;
              text-decoration: none;
              text-transform: capitalize;
            }
            
            .btn-primary td {
              background-color: #348eda;
            }
            .btn-primary a {
              background-color: #348eda;
              border-color: #348eda;
              color: #fff;
            }
            
            /* -------------------------------------
                OTHER STYLES THAT MIGHT BE USEFUL
            ------------------------------------- */
            .last {
              margin-bottom: 0;
            }
            
            .first {
              margin-top: 0;
            }
            
            .align-center {
              text-align: center;
            }
            
            .align-right {
              text-align: right;
            }
            
            .align-left {
              text-align: left;
            }
            
            .clear {
              clear: both;
            }
            
            .mt0 {
              margin-top: 0;
            }
            
            .mb0 {
              margin-bottom: 0;
            }
            
            .preheader {
              color: transparent;
              display: none;
              height: 0;
              max-height: 0;
              max-width: 0;
              opacity: 0;
              overflow: hidden;
              mso-hide: all;
              visibility: hidden;
              width: 0;
            }
            
            /* -------------------------------------
                ALERTS
            ------------------------------------- */
            .alert {
              border-radius: 3px 3px 0 0;
              color: #fff;
              font-size: 16px;
              font-weight: 600;
              padding: 20px;
              text-align: center;
            }
            .alert a {
              color: #fff !important;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none !important;
            }
            .alert.alert-warning {
              background-color: #FF9F00;
            }
            .alert.alert-bad {
              background-color: #D0021B;
            }
            .alert.alert-good {
              background-color: #68B90F;
            }
            .alert.alert-heroku {
              background-color: #4A4689;
            }
            .alert .apple-link a {
              color: #fff !important;
              text-decoration: none !important;
            }
            
            /* -------------------------------------
                TABLES
            ------------------------------------- */
            .data-table {
              margin-bottom: 15px;
              border: 1px solid #eeeeee;
              border-bottom-width: 2px;
              border-radius: 3px;
              border-spacing: 0;
              text-align: center;
              width: 100%;
            }
            .data-table .data-table-header {
              background-color: #eeeeee;
              color: #999;
              font-weight: bold;
              padding: 5px 0;
              text-align: center;
            }
            .data-table .data-table-header a {
              color: #999 !important;
              text-decoration: none !important;
            }
            .data-table .data-table-metric-wrapper {
              border-right: 1px solid #eeeeee;
              border-left: 1px solid #eeeeee;
            }
            .data-table .data-table-metric {
              font-size: 22px;
              font-weight: bold;
              padding: 5px 0;
              text-align: center;
            }
            .data-table .data-table-metric.good {
              color: #68B90F;
            }
            .data-table .data-table-metric.bad {
              color: #D0021B;
            }
            .data-table .data-table-metric.warning {
              color: #FF9F00;
            }
            .data-table .data-table-metric-label {
              color: #aaa;
              text-align: center;
            }
            
            @media only screen and (max-width: 620px) {
              table[class=body] .data-table tr,
              table[class=body] .data-table td {
                display: block !important;
                width: 100% !important;
              }
              table[class=body] .data-table > tbody > tr > td {
                border-bottom: 2px solid #eeeeee;
              }
              table[class=body] .data-table > tbody > tr > td:last-child {
                border-bottom: 0;
              }
            }
            
            /* -------------------------------------
                RESPONSIVE AND MOBILE FRIENDLY STYLES
            ------------------------------------- */
            @media only screen and (max-width: 620px) {
              table[class=body] h1,
              table[class=body] h2,
              table[class=body] h3,
              table[class=body] h4 {
                font-weight: 600 !important;
              }
              table[class=body] h1 {
                font-size: 22px !important;
              }
              table[class=body] h2 {
                font-size: 18px !important;
              }
              table[class=body] h3 {
                font-size: 16px !important;
              }
              table[class=body] .wrapper {
                padding: 10px !important;
              }
              table[class=body] .content {
                padding: 0 !important;
              }
              table[class=body] .container {
                padding: 0 !important;
                width: 100% !important;
              }
              table[class=body] .main {
                border-radius: 0 !important;
              }
              table[class=body] .alert {
                border-radius: 0 !important;
              }
              table[class=body] .btn {
                width: 100% !important;
              }
            }
            
            /*# sourceMappingURL=main.css.map */
        </style>
    </head>
    <body>
        <table class="body">
            <tr>
                <td></td>
                <td class="container">
                    <div class="content">
<table class="main">
  <tr>
    <td class="wrapper">
      <table>
        <tr>
          <td>
            <p>Hey!</p></br>
            <p>Great to see you here! Please confirm your email address by clicking on the link below.
            Your email address will not be shared with anyone else.</p></br>
            <p><a href="http://${server_domain}/emailVerification/verifyEmailRequest?token=${token}">http://${server_domain}/emailVerification/verifyEmailRequest?token=${token}</a></p>
            <p>If you did not sign up for a ProAvalon account please disregard this email.</p>
            <p>
              Enjoy!
              <br/>
              ProAvalon
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                    </div>
                </td>
                <td></td>
            </tr>
        </table>
    </body>
</html>
    `;


    const data = {
        from: 'ProAvalon <' + process.env.PROAVALON_EMAIL_ADDRESS + '>',
        to: user.emailAddress,
        subject: 'Welcome! Please verify your email address',
        html: message
    };

    user.emailToken = token;
    user.markModified("emailToken");
    user.save();
    
    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });
}

const disposableEmails = require('../util/disposableEmails.js');

module.exports.isThrowawayEmail = (email) => {
    if (disposableEmails.indexOf(email.split('@')[1]) !== -1) {
        return true;
    }
    else {
        return false;
    }
}