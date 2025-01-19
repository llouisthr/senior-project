// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZ2_SMG8bCoau2Ee0wjphjpifNhLkOJuw",
    authDomain: "senior-project-c9595.firebaseapp.com",
    projectId: "senior-project-c9595",
    storageBucket: "senior-project-c9595.firebasestorage.app",
    messagingSenderId: "663189750142",
    appId: "1:663189750142:web:9ca692a07d0b79d382332f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();




// Handle login submission
const submit = document.getElementById('submit');
submit.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    // Inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successful login
            alert("Sign in successful!");
            console.log("User:", userCredential.user);
            window.location.href = "importdata.html"
        })
        .catch((error) => {
            // Log error details for debugging
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error Code:", errorCode);
            console.error("Error Message:", errorMessage);
            alert(`Error: ${errorMessage}`);
        });
});
