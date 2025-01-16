// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, onValue, get, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
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
const database = getDatabase(app);

// DOM Elements
const familyCodeInput = document.getElementById('familyCodeInput');
const setFamilyCodeButton = document.getElementById('setFamilyCodeButton');
const messagesList = document.getElementById('messagesList');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const noFamilyCode = document.getElementById('noFamilyCode');
const titleElement = document.querySelector('h1');
const userProfile = document.getElementById('userProfile');

document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});

document.getElementById('more').addEventListener('click', (event) => {
    const moreSection = document.getElementById('moreSection');
    moreSection.classList.toggle('hidden');
    event.stopPropagation();
});

document.addEventListener('click', (event) => {
    const moreSection = document.getElementById('moreSection');
    const moreButton = document.getElementById('more');
    if (!moreButton.contains(event.target) && !moreSection.classList.contains('hidden')) {
        moreSection.classList.add('hidden');
    }
});

const hideNoFamilyCode = () => {
    noFamilyCode.classList.add('hidden');
};

const showNoFamilyCode = () => {
    noFamilyCode.classList.remove('hidden');
};

const checkFamilyCode = async (user) => {
    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists() && snapshot.val().familyCode) {
        const familyCode = snapshot.val().familyCode;
        hideNoFamilyCode();
        titleElement.textContent = `${familyCode}`;
        loadMessages(familyCode);
    } else {
        showNoFamilyCode();
        messagesList.innerHTML = '';
        titleElement.textContent = 'Family';
    }
};

setFamilyCodeButton.addEventListener('click', async () => {
    const familyCode = familyCodeInput.value.trim();
    const user = auth.currentUser;

    if (user && familyCode) {
        await set(ref(database, 'users/' + user.uid), {
            familyCode: familyCode
        });
        hideNoFamilyCode();
        titleElement.textContent = `${familyCode}`;
        loadMessages(familyCode);
    } else {
        console.error('User is not logged in or family code is empty.');
    }
});

const loadMessages = (familyCode) => {
    const messagesRef = ref(database, 'messages/' + familyCode);
    onValue(messagesRef, (snapshot) => {
        messagesList.innerHTML = '';

        if (snapshot.exists()) {
            const messages = [];

            snapshot.forEach((childSnapshot) => {
                const messageData = childSnapshot.val();
                messages.push(messageData);
            });

            messages.forEach((messageData) => {
                const messageElement = document.createElement('div');
                const currentUser = auth.currentUser;
                const isCurrentUser = messageData.uid === currentUser.uid;

                if (isCurrentUser) {
                    messageElement.className = 'flex justify-end mb-2';
                } else {
                    messageElement.className = 'flex flex-col items-start mb-2';
                }

                if (messageData.type === 'location') {
                    const coords = messageData.text.split(','); // Assuming messageData.text contains "latitude,longitude"
                    const latitude = coords[0];
                    const longitude = coords[1];
                    const mapPreview = document.createElement('div');
                    mapPreview.classList.add("map-preview");
                    mapPreview.style.userSelect = 'none';
                    mapPreview.innerHTML = `
                        <iframe src="${messageData.text}" allowfullscreen style="border:0;" loading="lazy" width="300" height="200"></iframe>
                    `;
                    messageElement.appendChild(mapPreview);

                    // Add click event to navigate to map.html with lat, lon and text parameters
                    mapPreview.addEventListener('click', function () {
                        // Redirect to map.html with lat, lon, and text parameters
                        window.location.href = `map.html?lat=${latitude}&lon=${longitude}&text=${encodeURIComponent(messageData.text)}`;
                    });
                } else if (messageData.type === 'audio') {
                    // Create a container for the audio message
                    const audioContainer = document.createElement('div');
                    audioContainer.className = `flex items-center p-2 rounded-xl max-w-xs ${
                        isCurrentUser ? audioContainer.style.backgroundColor = '#7269e3' : 'bg-gray-700 justify-start'
                    }`;
                
                    // Create the audio element
                    const audioElement = document.createElement('audio');
                    audioElement.src = messageData.text;
                    audioElement.volume = 1; // Set volume to max
                    audioElement.className = 'hidden'; // Hide default audio controls
                
                    // Play button using emoji
                    const playButton = document.createElement('button');
                    playButton.className = 'p-0 m-0 bg-transparent border-0 cursor-pointer text-2xl'; // Style for play button
                    playButton.textContent = '🔊'; // Play emoji
                    playButton.style.userSelect = 'none';
                
                    // Pause button using emoji
                    const pauseButton = document.createElement('button');
                    pauseButton.className = 'p-0 m-0 bg-transparent border-0 cursor-pointer text-2xl hidden'; // Initially hidden
                    pauseButton.textContent = '🔇'; // Pause emoji
                    pauseButton.style.userSelect = 'none';
                
                    // Toggle between play and pause
                    playButton.addEventListener('click', () => {
                        audioElement.play();
                        playButton.classList.add('hidden');
                        pauseButton.classList.remove('hidden');
                    });
                
                    pauseButton.addEventListener('click', () => {
                        audioElement.pause();
                        pauseButton.classList.add('hidden');
                        playButton.classList.remove('hidden');
                    });
                
                    // Reset buttons when audio ends
                    audioElement.addEventListener('ended', () => {
                        pauseButton.classList.add('hidden');
                        playButton.classList.remove('hidden');
                    });
                
                    // Append buttons to the audio container
                    audioContainer.appendChild(playButton);
                    audioContainer.appendChild(pauseButton);
                
                    // Append the audio container to the message element
                    messageElement.appendChild(audioContainer);
                }
                 else {
                    if (isCurrentUser) {
                        messageElement.innerHTML = `
                            <div style="background-color: #7269e3;" class="text-gray-200 p-2 pl-4 pr-4 rounded-xl max-w-xs">${messageData.text}</div>
                        `;
                    } else {
                        messageElement.innerHTML = `
                            <div class="text-gray-300 font-semibold mb-1">${messageData.name || 'Unknown User'}</div>
                            <div class="bg-gray-700 text-gray-200 p-2 pl-4 pr-4 rounded-xl max-w-xs">${messageData.text}</div>
                        `;
                    }
                }

                messagesList.appendChild(messageElement);
                
                setTimeout(() => {
                    messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth'});
                }, 1000); 
            });
        } else {
            const noMessagesElement = document.createElement('div');
            noMessagesElement.textContent = 'No messages yet.';
            messagesList.appendChild(noMessagesElement);
        }
    });
};

sendMessageButton.addEventListener('click', async () => {
    const messageText = messageInput.value.trim();
    const user = auth.currentUser;
    const familyCodeSnapshot = await get(ref(database, 'users/' + user.uid));

    if (user && messageText && familyCodeSnapshot.exists()) {
        const familyCode = familyCodeSnapshot.val().familyCode;
        const messagesRef = ref(database, 'messages/' + familyCode);
        const newMessageRef = push(messagesRef);

        try {
            const userSnapshot = await get(ref(database, 'users/' + user.uid));
            const userName = userSnapshot.val().name;

            await set(newMessageRef, {
                text: messageText,
                name: userName,
                uid: user.uid
            });
            messageInput.value = '';
            messageInput.focus();
        } catch (error) {
            console.error('Error saving message:', error);
        }
                
        setTimeout(() => {
            messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth'});
        }, 1000); 
    }
});

messageInput.addEventListener('input', () => {
    if (messageInput.value.trim() === "") {
        sendMessageButton.innerHTML = "🎤";
    } else {
        sendMessageButton.innerHTML = "➤";
    }
});

// Variables for voice recording
let mediaRecorder;
let audioChunks = [];
let recordingTimeout;

sendMessageButton.addEventListener('mousedown', async () => {
    if (messageInput.value.trim() === "") {
        messageInput.placeholder = "Listening...";

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.start();

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                recordingTimeout = setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }, 10000);
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        }
    }
});

sendMessageButton.addEventListener('mouseup', async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        clearTimeout(recordingTimeout);

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            audioChunks = [];

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;

                const user = auth.currentUser;
                const familyCodeSnapshot = await get(ref(database, "users/" + user.uid));

                if (user && familyCodeSnapshot.exists()) {
                    const familyCode = familyCodeSnapshot.val().familyCode;
                    const messagesRef = ref(database, "messages/" + familyCode);
                    const newMessageRef = push(messagesRef);

                    const userSnapshot = await get(ref(database, "users/" + user.uid));
                    const userName = userSnapshot.val().name;

                    await set(newMessageRef, {
                        text: base64Audio,
                        name: userName,
                        uid: user.uid,
                        type: "audio",
                    });
                }
            };
        };
    }

    messageInput.placeholder = "Type a message ...";
                
    setTimeout(() => {
        messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth'});
    }, 1000); 
});

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        checkFamilyCode(user);
    } else {
        showNoFamilyCode();
        messagesList.innerHTML = '';
        titleElement.textContent = 'Family';
    }
});

const sendLocationButton = document.getElementById("sendLocationButton");

sendLocationButton.addEventListener("click", async function () {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

            const user = auth.currentUser;
            const familyCodeSnapshot = await get(ref(database, 'users/' + user.uid));

            if (user && familyCodeSnapshot.exists()) {
                const familyCode = familyCodeSnapshot.val().familyCode;
                const messagesRef = ref(database, 'messages/' + familyCode);
                const newLocationRef = push(messagesRef);

                try {
                    const userSnapshot = await get(ref(database, 'users/' + user.uid));
                    const userName = userSnapshot.val().name;

                    await set(newLocationRef, {
                        text: mapUrl,
                        name: userName,
                        uid: user.uid,
                        type: 'location'
                    });
                } catch (error) {
                    console.error('Error saving location:', error);
                }
            }
        },
        (error) => {
            console.error("Error getting location:", error);
        }
    );
                
    setTimeout(() => {
        messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth'});
    }, 1000); 
});

function openDialog(id) {
    document.getElementById(id).classList.remove('hidden');
}

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
        openDialog('noFamilyCode');
        console.log('You have left the family code successfully.');
    } catch (error) {
        console.error('Error leaving family code:', error.message); // Log the error for debugging
    }
});

document.getElementById('goToProfile').addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Allow pressing Enter to send messages
messageInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent adding a new line

        const messageText = messageInput.value.trim();
        const user = auth.currentUser;
        const familyCodeSnapshot = await get(ref(database, 'users/' + user.uid));

        if (user && messageText && familyCodeSnapshot.exists()) {
            const familyCode = familyCodeSnapshot.val().familyCode;
            const messagesRef = ref(database, 'messages/' + familyCode);
            const newMessageRef = push(messagesRef);

            try {
                const userSnapshot = await get(ref(database, 'users/' + user.uid));
                const userName = userSnapshot.val().name;

                await set(newMessageRef, {
                    text: messageText,
                    name: userName,
                    uid: user.uid
                });
                messageInput.value = '';
            } catch (error) {
                console.error('Error saving message:', error);
            }

            setTimeout(() => {
                messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    }
});


sendMessageButton.addEventListener('touchstart', async () => {
    if (messageInput.value.trim() === "") {
        messageInput.placeholder = "Listening...";

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.start();

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                recordingTimeout = setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }, 10000);
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        }
    }
});

sendMessageButton.addEventListener('touchend', async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        clearTimeout(recordingTimeout);

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            audioChunks = [];

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;

                const user = auth.currentUser;
                const familyCodeSnapshot = await get(ref(database, "users/" + user.uid));

                if (user && familyCodeSnapshot.exists()) {
                    const familyCode = familyCodeSnapshot.val().familyCode;
                    const messagesRef = ref(database, "messages/" + familyCode);
                    const newMessageRef = push(messagesRef);

                    const userSnapshot = await get(ref(database, "users/" + user.uid));
                    const userName = userSnapshot.val().name;

                    await set(newMessageRef, {
                        text: base64Audio,
                        name: userName,
                        uid: user.uid,
                        type: "audio",
                    });
                }
            };
        };
    }

    messageInput.placeholder = "Type a message ...";
                
    setTimeout(() => {
        messagesList.lastElementChild.scrollIntoView({ behavior: 'smooth'});
    }, 1000); 
});