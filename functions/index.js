const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.uploadComplaint = functions.https.onRequest( (req, res) => {
    // NO NEED FOR IT LMFAO
    /*
    res.set('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Origin', 'http://localhost:5000');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'content-type,Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        // Grab all the parameters required.
        const full_name = req.body.full_name;
        const complaint = req.body.complaint;
        const extra_comments = req.body.extra_comments;
        const location_of_problem = req.body.location_of_problem;
        const unit_address_and_number = req.body.unit_address_and_number;
        const timestamp = admin.firestore.Timestamp.now();
        

        // Push the complaint into Cloud Firestore using the Firebase Admin SDK.
        const writeResult = admin.firestore().collection('complaints').add({
            complainant_full_name: full_name,
            complaint: complaint,
            extra_comments: extra_comments,
            location_of_problem: location_of_problem,
            unit_address_and_number: unit_address_and_number,
            timestamp: timestamp
        });

        // Send back a message that we've succesfully written the message
        res.json({result: `Complaint with ID: ${writeResult.id} added.`});
    }
    */
});
