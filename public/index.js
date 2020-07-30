//let functions = firebase.functions();
const db = firebase.firestore();
const storage = firebase.storage();

let storageRef = storage.ref();
let _user;

// Logs in user and shows error messages if required
function login(){

    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
        let errorCode = error.code;
        let errorMessage = "";

        // Give user an error message based on error code
        if (errorCode == "auth/user-not-found") {
            errorMessage = "Sorry, but there is no account associated with the email address inputted. Please check the email field for any mistakes and try again.";
        } else if (errorCode == "auth/invalid-email") {
            errorMessage = "Sorry, but your email is incorrectly formatted. Please check the email field for any mistakes and try again.";
        } else if (errorCode == "auth/wrong-password") {
            errorMessage = "Sorry, but your password is incorrect. Please check your password and try again.";
        } else {
            errorMessage = "Sorry, but something went wrong on our side. Please try again later.";
            console.log(errorCode);
        }

        // Replace with show_failure_alert()?
        window.alert(errorMessage);
    });
}

// Logs user out
function logout(){
    firebase.auth().signOut();
}

// Returns an array of storage references after uploading images to the storage DB
function upload_image() {
    const uploadedFiles = document.getElementById("complaint_image").files;

    if (uploadedFiles.length == 0) {
        return [];
    }

    let imageReferences = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
        let file = uploadedFiles[i];

        // 7 digit random number + current unix time + another 7 digit random number
        let refID = String(Math.round(Math.random()*1000000)) + String(new Date().getTime() + Math.round(Math.random()*100)) + String(Math.round(Math.random()*1000));

        let imageRef = storageRef.child("complaint-images/" + refID + "." + file.name.split('.').pop());

        // TODO: Add handlers that check whether the files successfully uploaded or not
        imageRef.put(file).then((snapshot) => {
            console.log('Uploaded ' + file.name);
            imageReferences[i] = imageRef.fullPath;
        });
    };

    return imageReferences;
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
    let imageRef = upload_image();

    let complaint = {
        full_name: name,
        email_address: _user.email,
        complaint: problem,
        extra_comments: extraComments,
        location_of_problem: locationOfProblem,
        unit_address_and_number: unit,
        timestamp: Date.now(),
        image_reference: imageRef
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
            // removed because it integrates Cloud Functions, a paid feature
            /*
            userRef.set({
                complaints: [complaint],
                full_name: name,
                email_address: _user.email
            }).then(function() {
                console.log("Document written with ID: ", userRef.id);
                // it's paid :(
                //const func = functions.httpsCallable('notifyLandlord');
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
            }); */

            userRef.set({
                complaints: [complaint],
                full_name: name,
                email_address: _user.email
            }).then(function() {
                show_success_alert("Your complaint has been submitted!");
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

function show_password() {
    if (document.getElementById("showPasswordToggle").checked) {
        document.getElementById("password_field").type = "text";
    } else {
        document.getElementById("password_field").type = "password";
    }
}

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

// Allows for enter key on password field to automatically sign in user 
let input = document.getElementById("password_field");

input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("login").click();
    }
});