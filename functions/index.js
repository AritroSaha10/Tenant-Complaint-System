const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
admin.initializeApp();

let email_address = "EMAIL_ADDRESS";
let email_password = "EMAIL_PASSWORD";

let landlord_email = "LANDLORD_EMAIL";


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email_address,
        pass: email_password
    }
});

/*
exports.notifyLandlord = functions.firestore
    .document('users/{userId}')
    .onWrite((change, context) => {
      // If we set `/users/marie` to {name: "Marie"} then
      // context.params.userId == "marie"
      // ... and ...
      // change.after.data() == {name: "Marie"}

    });
    */


exports.notifyLandlord = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        // get info from request
        // TODO: Fix how function cannot obtain parameters from request
        const full_name = req.query.full_name;
        const addr = req.query.email_address;
        const timestamp = req.query.timestamp;
        const complaint = req.query.complaint;
        const extra_comments = req.query.extra_comments;
        const location_of_problem = req.query.location_of_problem;
        const unit_address_and_number = req.query.unit_address_and_number;

        const mailOptions = {
            from: 'Tenant Complaint System <' + email_address + '>',
            to: landlord_email,
            subject: 'New Complaint', // email subject
            html:
            `
            <h2>A new complaint has been filed!</h2>
            <br>
            <p>Name: ` + full_name + `</p>
            <br><br>
            <p>Email Address: ` + addr + `</p>
            <br><br>
            <p>Time Submitted: ` + timestamp + `</p>
            <br><br>
            <p>Unit Number and Address: ` + unit_address_and_number + `</p>
            <br><br>
            <p>Issue: ` + complaint + `</p>
            <br><br>
            <p>Room of Issue: ` + location_of_problem + `</p>
            <br><br>
            <p>Other Comments: ` + extra_comments + `</p>
            <br><br>
            Thank you.`
            
        };
  
        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return {msg:"Sent"};
        });
    });    
});
