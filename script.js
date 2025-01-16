// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, onValue, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

// Function to check if the email exists in the database
const checkEmailExists = async (email) => {
    try {
        console.log("Checking email:", email);
        const userQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(email));
        const snapshot = await get(userQuery);
        console.log("Snapshot data:", snapshot.val());
        return snapshot.exists();
    } catch (error) {
        console.error("Error in checkEmailExists:", error.message);
        return false;
    }
};


// DOM Elements
const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const homePage = document.getElementById('homePage');

// Navigation Handlers
const showPage = (page) => {
    loginPage.classList.add('hidden');
    signupPage.classList.add('hidden');
    homePage.classList.add('hidden');

    if (page === 'login') loginPage.classList.remove('hidden');
    if (page === 'signup') signupPage.classList.remove('hidden');
    if (page === 'home') homePage.classList.remove('hidden');
};

// Event Listeners for Navigation
document.getElementById('goToSignup').addEventListener('click', (e) => {
    e.preventDefault(); 
    showPage('signup');
});
document.getElementById('goToLogin').addEventListener('click', (e) => {
    e.preventDefault(); 
    showPage('login');
});

// Fetch and display profile data
const updateProfileContent = async () => {
    const user = auth.currentUser;

    if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();

            document.getElementById('userName').textContent = (userData?.name?.trim().split(' ')[0] || 'Name not set');

            document.getElementById('userFullName').textContent = userData?.name || 'Name not set';
            document.getElementById('userEmail').textContent = userData?.email || 'Email not set';
            document.getElementById('familyCode').textContent = userData?.familyCode || 'Not set';
            document.getElementById('familyCode2').textContent = userData?.familyCode || 'Not set';
            document.getElementById('familyRole').textContent = userData?.familyRole || 'Not set';
            document.getElementById('age').textContent = userData?.age || 'Not set';
            document.getElementById('ageValue').textContent = userData?.age || 18;
            document.getElementById('contactNumber').textContent = userData?.contactNumber || 'Not set';
        });
    }
};

// Call the function on auth state change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            
            if (userData) {
                // User exists in database, hide newUser section
                homePage.classList.remove('hidden');
                updateProfileContent(); // Populate the profile content with user data
                showPage('home');
                setActiveTab('homeTab');
                loginPage.classList.add('hidden');
                signupPage.classList.add('hidden');
            } else {
                // User does not exist in database, show newUser section
                window.location.href = 'newUser.html';
            }
        });
    } else {
        showPage('login');
    }
});

// Set the active tab and show its content
const setActiveTab = (activeTabId) => {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.add('hidden'));

    // Reset styles for all navigation tabs
    document.querySelectorAll('.nav-tab').forEach((tab) => {
        tab.style.color = '#7c7c7c'; // Replace with your inactive color (gray)
    });

    // Apply active styles
    const activeTab = document.getElementById(activeTabId);
    activeTab.style.color = '#7269e3'; // Apply the custom active color

    // Show the selected tab content
    document.getElementById(tabs[activeTabId]).classList.remove('hidden');
};

// Login functionality
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    /* const emailExists = await checkEmailExists(email);
    if (!emailExists) {
        alert('Email does not exist. Please sign up.');
        return; // Exit the function if email does not exist
    } */

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert(error.message);
    }
});

// Signup functionality
document.getElementById('signupButton').addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        alert('Email already exists. Please log in.');
        return; // Exit the function if email exists
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save new user info in the database
        await set(ref(database, 'users/' + user.uid), {
            email: user.email,
            name: user.displayName,
            // Include additional fields as needed
        });
        window.location.href = 'newUser.html'; // Redirect to newUser.html
    } catch (error) {
        alert(error.message);
    }
});

// Google Login
const googleSignIn = async () => {
    try {
        // Configure Google provider to always prompt for account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user email exists in the database
        const emailExists = await checkEmailExists(user.email);
        if (!emailExists) {
            // Save user info in the database
            await set(ref(database, 'users/' + user.uid), {
                email: user.email,
                name: user.displayName,
                // Include additional fields as needed
            });
            window.location.href = 'newUser.html'; // Redirect to newUser.html
        } else {
            // User exists in the database
            console.log('User already exists in the database.');
        }
    } catch (error) {
        alert(error.message);
    }
};

document.getElementById('googleLogin').addEventListener('click', googleSignIn);
document.getElementById('googleSignup').addEventListener('click', googleSignIn);

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', async () => {
    await signOut(auth);
});

// Tab Switching
const tabs = {
    homeTab: 'homeContent',
    dempleTab: 'dempleContent',
    familyTab: 'familyContent',
    profileTab: 'profileContent',
};

// Handle Talk with Demple Click
document.getElementById('talk').addEventListener('click', () => {
    window.location.href = 'talk.html'; // Redirect to talk.html
});

// Handle Chat with Demple Click
document.getElementById('chat').addEventListener('click', () => {
    window.location.href = 'chat.html'; // Redirect to chat.html
});

// Handle Family Tab Click
document.getElementById('familyTab').addEventListener('click', () => {
    window.location.href = 'family.html'; // Redirect to family.html
});

// Handle Demple Tab Click
document.getElementById('dempleTab').addEventListener('click', () => {
    window.location.href = 'chat.html'; // Redirect to demple.html
});

// Handle Profile Tab Click
document.getElementById('profileTab').addEventListener('click', () => {
    setActiveTab('profileTab'); // Use setActiveTab to display the profile content
    document.getElementById('profileActive').classList.remove('hidden');
    document.getElementById('profileNotActive').classList.add('hidden');
    document.getElementById('homeActive').classList.add('hidden');
    document.getElementById('homeNotActive').classList.remove('hidden');
});

// Handle Home Tab Click
document.getElementById('homeTab').addEventListener('click', () => {
    setActiveTab('homeTab'); // Use setActiveTab to display the profile content
    document.getElementById('profileActive').classList.add('hidden');
    document.getElementById('profileNotActive').classList.remove('hidden');
    document.getElementById('homeActive').classList.remove('hidden');
    document.getElementById('homeNotActive').classList.add('hidden');
});

document.getElementById('seeAll').addEventListener('click', () => {
    const moreSection = document.getElementById('more');
    if (moreSection.classList.contains('hidden')) {
        moreSection.classList.remove('hidden'); // Show the more topics
        document.getElementById('seeAll').textContent = 'See less'; // Change button text
    } else {
        moreSection.classList.add('hidden'); // Hide the more topics
        document.getElementById('seeAll').textContent = 'See all'; // Change button text back
    }
});

// Function to create a family code
document.getElementById('createButton').addEventListener('click', async () => {
    const familyCode = document.getElementById('createInput').value.trim();
    const user = auth.currentUser;

    if (!user || !familyCode) {
        console.log('Please log in and enter a valid family code.');
        return;
    }

    try {
        // Reference to the family code in the messages
        const familyCodeRef = ref(database, `messages/${familyCode}`);

        // Check if the family code already exists
        const snapshot = await get(familyCodeRef);
        if (snapshot.exists()) {
            console.log('Family code already exists.');
            return;
        }

        // Create a new family code without additional fields
        await set(familyCodeRef, {});

        // Update user's family code in the user's database record
        await set(ref(database, `users/${user.uid}/familyCode`), familyCode);
        document.getElementById('familyCode2').textContent = familyCode;
        closeDialog('familyCodeCreate');
        console.log('Family code created successfully.');
    } catch (error) {
        console.error('Error creating family code:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});

// Function to join a family code
document.getElementById('joinButton').addEventListener('click', async () => {
    const familyCode = document.getElementById('joinInput').value.trim();
    const user = auth.currentUser;

    if (!user || !familyCode) {
        console.log('Please log in and enter a valid family code.');
        return;
    }

    try {
        // Reference the family code in the messages
        const familyCodeRef = ref(database, `messages/${familyCode}`);
        const snapshot = await get(familyCodeRef);

        if (!snapshot.exists()) {
            console.log('Family code does not exist.');
            console.error('Snapshot data:', snapshot.val()); // Log snapshot data for debugging
            return;
        }

        // Update user's family code in the user's database record
        await set(ref(database, `users/${user.uid}/familyCode`), familyCode);
        document.getElementById('familyCode2').textContent = familyCode;
        closeDialog('familyCodeJoin');
        console.log('Joined family code successfully.');
    } catch (error) {
        console.error('Error joining family code:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});

// Function to leave a family code
document.getElementById('leaveButton').addEventListener('click', async () => {
    const user = auth.currentUser;

    if (!user) {
        console.log('Please log in to leave a family code.');
        return;
    }

    try {
        // Remove the family code from the user's record
        await set(ref(database, `users/${user.uid}/familyCode`), null);
        document.getElementById('familyCode2').textContent = 'Not set';
        closeDialog('familyCodeLeave');
        console.log('You have left the family code successfully.');
    } catch (error) {
        console.error('Error leaving family code:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});

const dropdownButton = document.getElementById('dropdownButton');
const dropdownMenu = document.getElementById('dropdownMenu');
let selectedRole = '';

// Show/Hide dropdown menu
dropdownButton.addEventListener('click', () => {
            
    dropdownButton.style.borderColor = '#7269e3';
    
    setTimeout(() => {
        dropdownMenu.classList.toggle('hidden');
    }, 200);
});

// Set selected role and hide dropdown
dropdownMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        selectedRole = event.target.textContent; // Store the selected role
        dropdownButton.textContent = selectedRole; // Update button text
        dropdownMenu.classList.add('hidden'); // Hide the dropdown
        dropdownButton.style.borderColor = '#242935'; // Revert to the original color
    }
});

// Close dropdown when clicking outside
window.addEventListener('click', (event) => {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
        dropdownButton.style.borderColor = '#242935'; // Revert to the original color
    }
});

// Save the selected role to Firebase
document.getElementById('roleButton').addEventListener('click', async () => {
    const user = auth.currentUser; // Get the currently logged-in user

    if (!user || !selectedRole) {
        console.log('Please log in and select a valid role.');
        return;
    }

    try {
        // Save the selected role under the user's record
        await set(ref(database, `users/${user.uid}/familyRole`), selectedRole);
        console.log('Family role updated successfully:', selectedRole);
        closeDialog('familyRoleDialog'); // Close the dialog after saving
    } catch (error) {
        console.error('Error updating family role:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});

let age = 18;

    const ageValueElement = document.getElementById('ageValue');
    const increaseButton = document.getElementById('increaseButton');
    const decreaseButton = document.getElementById('decreaseButton');

    // Update age display function
    const updateAgeDisplay = () => {
        ageValueElement.textContent = `${age}`;
    };

    // Increase age
    increaseButton.addEventListener('click', () => {
        increaseButton.style.borderColor = '#7269e3';
        if (age < 100) {
            age++;
            updateAgeDisplay();
        }
        
        setTimeout(() => {
            increaseButton.style.borderColor = '#242935'; // Revert to the original color
        }, 200);
    });

    // Decrease age
    decreaseButton.addEventListener('click', () => {
        decreaseButton.style.borderColor = '#7269e3';
        if (age > 0) {
            age--;
            updateAgeDisplay();
        }
        
        setTimeout(() => {
            decreaseButton.style.borderColor = '#242935'; // Revert to the original color
        }, 200);
    });

// Save age to Firebase
document.getElementById('ageButton').addEventListener('click', async () => {
    const user = auth.currentUser; // Get the currently logged-in user

    if (!user || age < 0 || age > 100) {
        console.log('Please input a valid age.');
        return;
    }    

    try {
        // Save the age under the user's record
        await set(ref(database, `users/${user.uid}/age`), age);
        console.log('Age updated successfully:', age);
        closeDialog('ageDialog'); // Close the dialog after saving
    } catch (error) {
        console.error('Error updating age:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});

// Save Contact Number to Firebase
document.getElementById('contactButton').addEventListener('click', async () => {
    const user = auth.currentUser; // Get the currently logged-in user
    const contactInput = document.getElementById('contactInput').value.trim(); // Get the input value
    const contactNumber = '+639' + contactInput; // Combine country code with the input

    // Check if user is logged in and contact number is valid
    if (!user || !contactInput.match(/^\d{9}$/)) {
        console.log('Please input a valid contact number.');
        return;
    }

    try {
        // Save the contact number under the user's record
        await set(ref(database, `users/${user.uid}/contactNumber`), contactNumber);
        console.log('Contact number updated successfully:', contactNumber);
        closeDialog('contactNumberDialog'); // Close the dialog after saving
    } catch (error) {
        console.error('Error updating contact number:', error.message); // Log the error for debugging
    }
    setActiveTab('profileTab');
});
