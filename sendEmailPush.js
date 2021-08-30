'use strict';
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ses = new AWS.SES();
var pinpoint = new AWS.Pinpoint();
exports.handler = async(event) => {
    console.log('--- EVENT ---- ', JSON.stringify(event));
    try {
        var obj = {};
        obj[event.userId] = {};
        const notificationReq = await sendNotification(obj, process.env.subject, event);
        console.log('notificationReq', notificationReq);
        const  emailReq= await sendEmail(event.email, event);
        console.log('emailReq', emailReq);
        const response = {
            statusCode: 200,
            body: JSON.stringify('Success'),
        };
        return response;

    }
    catch (err) {
        console.log('--- TRIGGER ---- Catch Error === ', JSON.stringify(err.message));

        const response = {
            statusCode: 500,
            body: JSON.stringify(err)
        };
        return response;
    }

};

async function sendEmail(to, event) {

    try {
        var emailBody = "<html><head><title>AI Transcription App</title></head>" +
                        "<body style= \"background-color:#E4E8ED; padding: 20px;\"><center>" +
                        "<p>&nbsp;</p>" +
                        "<p><img src=\"http://brandingboardapp.com/ai_transcription_app.png\" alt=\"AI Transcription App\" width=\"128\" height=\"128\" /></p>" +
                        "<p>&nbsp;</p>" +
                        "<span style=\"font-size:125%; color: #e44562; padding-top:1px;\"><strong>Thank You for Your Purchase " + event.name + "</strong></span></p>" +
                        "<p>&nbsp;</p>" +
                        "<p><span style=\"font-size:125%;\"><strong>YOUR PURCHASED CREDITS + $5 BONUS IS CREDITED TO YOUR ACCOUNT :)</strong></p>" +
                        "<p>Your Bonus credits will expire on 23rd August 2021, make sure to use them ASAP!.<br/>" +
                        "<p>&nbsp;</p>" +
                        "<p>Have questions about the App? We'd love to help! Just hit reply :)</p>" +
                        "<p>&nbsp;</p>" +
                        "<p>&nbsp;</p>" +
                        "<p>Our Best,<br/>" +
                        "<strong>AI Transcription App team</strong></p>" +
                        "</center></body></html>";
        var eParams = {
            Destination: {
                ToAddresses: [to],
                CcAddresses: [process.env.from]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: emailBody

                    }
                },
                Subject: {
                    Data: "AI Transcription App, Thank You for Your Purchase + $5 Bonus " + event.name
                }
            },

            // Replace source_email with your SES validated email address
            Source: process.env.from,
            ReplyToAddresses: [process.env.from]
        };
        const data = await ses.sendEmail(eParams).promise();
        console.log("Success SES" + JSON.stringify(data));
        return data;
    }
    catch (err) {
        console.log("Error SES" + JSON.stringify(err));

        return err;
    }
}


async function sendNotification(obj, title, body, event) {
    try {
        var paramsPP = {
            ApplicationId: process.env.applicationId,
            /* required */
            SendUsersMessageRequest: { /* required */
                MessageConfiguration: {

                    /*APNSMessage: {
                        Action: 'OPEN_APP',
                        Badge: 1,
                        Body: body,
                        Sound: 'default',
                        SilentPush: false,
                        Title: "Test"
                    },*/

                    GCMMessage: {
                        Action: 'OPEN_APP',
                        Body: body,
                        Title: title,
                        ImageUrl: "",
                        Data: {
                            "action": "TRANSCRIPTION",
                            "message": JSON.stringify({
                                "userId": event.userId
                            })
                        },
                        Sound: 'default'
                    }
                },
                Users: obj

            }
        };
        console.log('PARAMSPP = ', paramsPP);
        const data = pinpoint.sendUsersMessages(paramsPP).promise();
        console.log("Success PP" + JSON.stringify(data));
        //return data;
    }
    catch (err) {
        console.log("Error PP" + JSON.stringify(err));
        //return err;
    }
}
