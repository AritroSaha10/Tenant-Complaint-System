const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let current_user = null;

// Logs in user and shows error messages if required
function login(){
    let userEmail = document.getElementById("inputEmail").value;
    let userPass = document.getElementById("inputPassword").value;

    let persistenceSetting;

    // User wants persistence
    if ($("#rememberMeOption")[0].checked) {
        persistenceSetting = firebase.auth.Auth.Persistence.LOCAL;
        console.log("persistent");
    } else {
        persistenceSetting = firebase.auth.Auth.Persistence.NONE;
    }

    // Show user that we are working behind the scenes
    document.getElementById("inputLoginButton").innerHTML = "<i class=\"fa fa-circle-o-notch fa-spin\" id=\"inputLoginLoading\"></i>";

    // Set the login persistence according to user input and login
    auth.setPersistence(persistenceSetting).then(() => {
        auth.signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
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
    
            // TODO: Replace with bootstrap alerts
            window.alert(errorMessage);
        });
    })
    .catch((error) => {
        console.log(error.message);
        // Premature ending, remove loop
        document.getElementById("inputLoginButton").innerHTML = "Sign in";
    })
}

// Logs user out
function logout(){
    auth.signOut();
}

// Show bootstrap alert
function bootstrap_alert(message, alert_type, strong_text) {
    // Dismiss the first alert if there are more than 3 alert
    if ($("#alert_holder").children().toArray().length > 2) {
        // Gets the first element in the alert_holder div, finds its button, and clicks it to make sure it fades
        $($("#alert_holder").children()[0]).find("button")[0].click();
    }

    // Add new alert
    $('#alert_holder').append('<div class="alert ' + alert_type + ' alert-dismissible fade show" role="alert"><strong>' + strong_text + '</strong> ' + message + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
}

var sanitizeHTML = function (str) {
	let temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};

// Generates a complaint card using a firebase document of a complaint
function generateComplaintCard(complaint_data) {
    // Prepare divisions that don't require data
    let column_div = document.createElement("div");
    let card_div = document.createElement("div");
    let card_body_div = document.createElement("div");
    let card_footer_div = document.createElement("div");

    // Set attributes
    //column_div.setAttribute("class", "col-auto mb-3");
    // TODO: Create data id that identifies both the post, likely by using the timestamp and the user number
    // column_div.setAttribute("data-id", id);

    card_div.setAttribute("class", "card text-center");

    card_body_div.setAttribute("class", "card-body");
    card_footer_div.setAttribute("class", "card-footer text-muted");

    // Get all data regarding complaint and store into their own variables
    let full_name = complaint_data.full_name;
    let email_address = complaint_data.email_address;
    let complaint = complaint_data.complaint;
    let unit_address_and_number = complaint_data.unit_address_and_number;
    // Multiplied by 1000 because Date() requires milliseconds
    let timestamp = moment(complaint_data.timestamp);
    let image_refs = complaint_data.image_reference;

    // Create all elements relating to data
    let card_img = null;
    let card_title = document.createElement("h5");
    let card_subtitle_address = document.createElement("h6");
    let card_text_complaint = document.createElement("p");
    // TODO: Add "View More" button
    let card_view_more;
    let card_respond = document.createElement("a");

    // Set attributes
    if (image_refs.length != 0) {
        card_img = document.createElement("img");
        card_img.setAttribute("class", "card-img-top");
        storage.ref(image_refs[0]).getDownloadURL().then(function(url) {
            card_img.setAttribute("src", url);
        }).catch(function(error) {
            // Show error image and send error to console
            card_img.setAttribute("src", "https://developers.google.com/maps/documentation/streetview/images/error-image-generic.png");
            console.log(error);
        });
    }

    card_title.setAttribute("class", "card-title");
    card_title.textContent="Complaint from " + full_name;

    card_subtitle_address.setAttribute("class", "card-subtitle mb-2 text-muted");
    card_subtitle_address.textContent = unit_address_and_number;

    card_text_complaint.setAttribute("class", "card-text");
    card_text_complaint.innerHTML="<strong>Complaint: </strong>" + sanitizeHTML(complaint)

    card_respond.setAttribute("href", "mailto: " + email_address);
    card_respond.textContent = "Respond";

    card_footer_div.setAttribute("class", "card-footer text-muted");
    card_footer_div.textContent = "Filed " + timestamp.fromNow();

    // Nest each element and add to main document
    column_div.appendChild(card_div);

    if (card_img != null) card_div.appendChild(card_img);
    card_div.appendChild(card_body_div);
    card_div.appendChild(card_footer_div);

    card_body_div.appendChild(card_title);
    card_body_div.appendChild(card_subtitle_address);
    card_body_div.appendChild(card_text_complaint);
    card_body_div.appendChild(card_respond);

    document.getElementById("complaintCards").appendChild(column_div);
}

// Load all complaints and show them
function loadAllComplaints(search_term) {
    if (current_user == null) {
        return -1;
    }

    // Remove all complaints before adding new ones
    document.getElementById("complaintCards").textContent = "";

    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // Go through each complaint and render them on screen
            doc.data().complaints.forEach(function(complaint) {
                // Filter if search term is not null
                if (search_term != "") {
                    if (complaint.complaint.includes(search_term)) {
                        generateComplaintCard(complaint);
                    }
                } else {
                    generateComplaintCard(complaint);
                }
            });
        });
    }).catch(function(err) {
        console.log(err);
    });

    return 0;
}

// Auth flow
auth.onAuthStateChanged(function(user) {
    if (user) {
        // User has signed in
        let user = auth.currentUser;

        if(user != null){
            current_user = user;
            let email_address = user.email;

            // Checks whether user's UID is part of admin-list, if they're not an admin / something goes wrong then logs them out and tells them 
            db.collection('admin-list').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    // User is an admin since they are part of the admin list
                    document.getElementById("user-welcome").innerHTML = "Welcome to the admin page, " + email_address;

                    // Hide the login page and show user page
                    // While fading user page in, load complaints
                    $("#login-page").fadeOut(400, () => {
                        document.getElementById("inputLoginButton").innerHTML = "Sign in";
                        loadAllComplaints("");
                        $("#user-page").fadeIn(400);
                    });

                 } else {
                    // User is not an admin because they are not a part of the admin list
                    logout();
                    bootstrap_alert("Sorry, but you are not an admin. Please go to <a href='https://tenant-complaint-system.web.app/'>this link</a> if you are not an admin.", "alert-danger", "Error!");
                    // Premature ending, remove loop
                    document.getElementById("inputLoginButton").innerHTML = "Sign in";
                }
            }).catch((error) => {
                // Return to login page and report error
                console.log("Error getting admin status: " + error.message);
                // Premature ending, remove loop
                document.getElementById("inputLoginButton").innerHTML = "Sign in";
                logout();
            });
        }

    } else {
        // No user is signed in.
        $("#user-page").fadeOut(400, () => {
            $("#login-page").fadeIn(400);
        });
        

        email_address = "";
        current_user = null;
    }
});

// Show / Hide Password Functionality
!function ($) {
    //eyeOpenClass: 'fa-eye',
    //eyeCloseClass: 'fa-eye-slash',
        'use strict';
    
        $(function () {
            $('[data-toggle="password"]').each(function () {
                var input = $(this);
                var eye_btn = $(this).parent().find('.input-group-text');
                eye_btn.css('cursor', 'pointer').addClass('input-password-hide');
                eye_btn.on('click', function () {
                    if (eye_btn.hasClass('input-password-hide')) {
                        eye_btn.removeClass('input-password-hide').addClass('input-password-show');
                        eye_btn.find('.fa').removeClass('fa-eye').addClass('fa-eye-slash')
                        input.attr('type', 'text');
                    } else {
                        eye_btn.removeClass('input-password-show').addClass('input-password-hide');
                        eye_btn.find('.fa').removeClass('fa-eye-slash').addClass('fa-eye')
                        input.attr('type', 'password');
                    }
                });
            });
        });
    
    }(window.jQuery);


// Allows for enter key on password field to automatically sign in user 
let input = document.getElementById("inputPassword");

input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("inputLoginButton").click();
    }
});


// Set firestore persistence to allow for caching
db.enablePersistence().catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
        console.log("Could not enable persistence because multiple tabs are open");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
        console.log("Could not enable persistence because browser doesnt support");
    }
});