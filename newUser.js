// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFYZEFJd3ycnYNsFx8csT_2H5U0_lGuTs",
    authDomain: "demple-d91c5.firebaseapp.com",
    databaseURL: "https://demple-d91c5-default-rtdb.firebaseio.com/",
    projectId: "demple-d91c5",
    storageBucket: "demple-d91c5.appspot.com",
    messagingSenderId: "795086066501",
    appId: "1:795086066501:web:eb9a77e1145c3b9e36e42c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

document.getElementById('saveButton').addEventListener('click', async () => {
    const name = document.getElementById('nName');
    const familyCode = document.getElementById('nFamilyCode');
    const familyRole = document.getElementById('nFamilyRole');
    const age = document.getElementById('nAge');
    const contactNumber = document.getElementById('nContactNumber');

    // Check if any input is empty
    if (!name.value) {
        name.style.borderColor = '#e74c3c'; // Set border color to #7269e3
        name.focus(); // Focus on the empty input
        return; // Stop execution if the input is empty
    } else {
        name.style.borderColor = '#242935'; // Reset border color
    }

    if (!familyCode.value) {
        familyCode.style.borderColor = '#e74c3c';
        familyCode.focus();
        return;
    } else {
        familyCode.style.borderColor = '#242935';
    }

    if (!familyRole.value) {
        familyRole.style.borderColor = '#e74c3c';
        familyRole.focus();
        return;
    } else {
        familyRole.style.borderColor = '#242935';
    }

    if (!age.value) {
        age.style.borderColor = '#e74c3c';
        age.focus();
        return;
    } else {
        age.style.borderColor = '#242935';
    }

    if (!contactNumber.value) {
        contactNumber.style.borderColor = '#e74c3c';
        contactNumber.focus();
        return;
    } else {
        contactNumber.style.borderColor = '#242935';
    }

    const user = auth.currentUser;

    if (user) {
        try {
            // Save user data to the database
            await set(ref(database, `users/${user.uid}`), {
                name: name.value,
                email: user.email,
                familyCode: familyCode.value,
                familyRole: familyRole.value,
                age: age.value,
                contactNumber: contactNumber.value
            });

            // Optionally, you can now show the home page or reset the form
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    }

});