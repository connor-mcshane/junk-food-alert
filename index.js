const sendgrid = require('sendgrid');

/* @param {object} req Cloud Function request context.
*  @param {object} res Cloud Function response context.
*/
exports.waitForMonzoHook = (req, res) => {
    if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
    }

    // send the response to the Monzo straight away to avoid any timeouts
    res.sendStatus(200); 

    // define these before deployment
    let apiKey = process.env.SENDGRID_API_KEY;
    let emailTo = process.env.EMAIL_TO;
    let emailFrom = process.env.EMAIL_FROM;
    let emailSubject = process.env.EMAIL_SUBJECT;

    var purchaseDescription = JSON.stringify(req.body.data.description);

    if (descriptionIsNaughty(purchaseDescription)) {
        sendGridEmail(apiKey, purchaseDescription, emailTo, emailFrom, emailSubject);
    }
};

function sendGridEmail(key, data, to, from, subject) {
    // Get a SendGrid client
    const client = getClient(key);

    // Build the SendGrid request to send email
    const request = client.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: generatePayload(data, to, from, subject),
    });

    // Make the request to SendGrid's API
    client.API(request);
    console.log(`Email sent to: ` + to + '\nfrom: ' + from + '\nwith subject: ' + subject);
}

/**
 * self explanatory
/* @param {object} description of Monzo request
*/
function descriptionIsNaughty(description) {
    var naughtyWords = ["kfc", "mcdonald", "chicken", "kebab"];
    for (var i = 0; i < naughtyWords.length; i++) {
        if (description.toLowerCase().indexOf(naughtyWords[i]) > -1) {
            return true;
        }
    }
    console.log(description);
    return false;
}

/**
 * Returns a configured SendGrid client.
 *
 * @param {string} key Your SendGrid API key.
 * @returns {object} SendGrid client.
 */
function getClient(key) {
    if (!key) {
        const error = new Error(
            'SendGrid API key not provided. Make sure you have a "sg_key" property in your request querystring'
        );
        error.code = 401;
        throw error;
    }

    // Using SendGrid's Node.js Library https://github.com/sendgrid/sendgrid-nodejs
    return sendgrid(key);
}

/**
 * Constructs the SendGrid email request from the HTTP request body.
 *
 * @param {object} data 
 * @param {object} emailTo 
 * @param {object} emailFrom 
 * @param {object} emailSubject 
 */
function generatePayload(data, emailTo, emailFrom, emailSubject) {
    generatePayload(data, to, from, subject)
    return {
        personalizations: [
            {
                to: [
                    {
                        email: emailTo,
                    },
                ],
                subject: emailSubject,
            },
        ],
        from: {
            email: emailFrom,
        },
        content: [
            {
                type: 'text/plain',
                value: data,
            },
        ],
    };
}
