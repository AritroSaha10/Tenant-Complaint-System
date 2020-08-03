const auth = firebase.auth();
const db = firebase.firestore();

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
    });
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

// Auth flow
auth.onAuthStateChanged(function(user) {
    if (user) {
        // User has signed in\
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
                    document.getElementById("user-page").style.display = "block";
                    document.getElementById("login-page").style.display = "none";
                } else {
                    // User is not an admin because they are not a part of the admin list
                    logout();
                    bootstrap_alert("Sorry, but you are not an admin. Please go to <a href='https://tenant-complaint-system.web.app/'>this link</a> if you are not an admin.", "alert-danger", "Error!");
                }
            }).catch((error) => {
                // Return to login page and report error
                console.log("Error getting admin status: " + error.message);
                logout();
            });
        }

    } else {
        // No user is signed in.

        document.getElementById("user-page").style.display = "none";
        document.getElementById("login-page").style.display = "block";

        email_address = "";
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