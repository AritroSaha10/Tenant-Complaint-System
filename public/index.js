let functions = firebase.functions();
var db = firebase.firestore();

let _user;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.

        document.getElementById("user_div").style.display = "block";
        document.getElementById("login_div").style.display = "none";

        let user = firebase.auth().currentUser;

        if(user != null){
            let email_address = user.email;
            document.getElementById("user_para").innerHTML = "Welcome to the Tenant Complaint System! You're current signed in as " + email_address;

            _user = user;
        }

    } else {
        // No user is signed in.

        document.getElementById("user_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";

        email_address = "";

    }
});

function login(){

    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert("Error : " + errorMessage);

        // ...
    });

}

var input = document.getElementById("password_field");

input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("login").click();
    }
});

function logout(){
    firebase.auth().signOut();
}

function file_complaint(){
    // TODO: Upload the data to a database and to a trello board
    if (_user == null) {
        show_failure_alert("You're not logged in!");
    }

    let name = document.getElementById("name").value;
    let unit = document.getElementById("unit").value;
    let problem = document.getElementById("issueText").value;
    let locationOfProblem = document.getElementById("locationOfProblem").value;
    let extraComments = document.getElementById("extraComments").value;
    
    let complaint = {
        full_name: name,
        email_address: _user.email,
        complaint: problem,
        extra_comments: extraComments,
        location_of_problem: locationOfProblem,
        unit_address_and_number: unit,
        timestamp: Date.now()
    };

    const userRef = db.collection('users').doc(_user.uid)

    userRef.get()
    .then((docSnapshot) => {
        if (docSnapshot.exists) {
            userRef.onSnapshot((doc) => {
                userRef.update({
                    complaints: firebase.firestore.FieldValue.arrayUnion(complaint)
                }).then(function() {
                    console.log("Updated Document with ID: ", userRef.id);
                    show_success_alert("Your complaint has been submitted!");
                }).catch(function(error) {
                    console.error("Error adding document: ", error);
                    show_failure_alert("An error occured. Please try again later.");
                });
        });
        } else {
            userRef.set({
                complaints: [complaint],
                full_name: name,
                email_address: _user.email
            }).then(function() {
                console.log("Document written with ID: ", userRef.id);
                // notify landlord of complaint
                const func = functions.httpsCallable('notifyLandlord');
                func({
                    full_name: name,
                    email_address: _user.email,
                    timestamp: new Date().toLocaleString(),
                    complaint: complaint,
                    extra_comments: extraComments,
                    location_of_problem: locationOfProblem,
                    unit_address_and_number: unit
                }).then(function(res) {
                    show_success_alert("Your complaint has been submitted!");
                    console.log(res);
                    return;
                })
                .catch(function(error) {
                    console.error("Error sending email: ", error);
                    show_failure_alert("An error occured. Please try again later.");
                    return;
                });
            }).catch(function(error) {
                console.error("Error adding document: ", error);
                show_failure_alert("An error occured. Please try again later.");
            });
        }
    });
}

function show_success_alert(message) {
    document.getElementById("alertText").innerText = message;
    document.getElementById("alertMessage").style.display = "block";
    document.getElementById("alertMessage").classList = ["alert success"];
}

function show_failure_alert(message) {
    document.getElementById("alertText").innerText = message;
    document.getElementById("alertMessage").style.display = "block";
    document.getElementById("alertMessage").classList = ["alert"];
}