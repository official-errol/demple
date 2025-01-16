// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
const database = getDatabase(app);

// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const messagesList = document.getElementById('messagesList');

// User ID (you may want to get this dynamically based on authentication)
const userId = 'user'; // Replace this with the actual user ID from your authentication

// Speech recognition setup
let recognition;

let targetTouch; // Variable to store the active touch point
let isRecognizing = false; // Track whether speech recognition is active

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript; // Set the recognized text to the input
        sendUserMessage(transcript.trim());
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.onstart = () => {
        messageInput.placeholder = "🎤 Listening ..."; // Change placeholder when speech recognition starts
    };

    recognition.onend = () => {
        isRecognizing = false; // Update the recognition state
        messageInput.placeholder = "Type your message ..."; // Reset placeholder
        console.log('Speech recognition ended'); // Log when recognition ends
    };
} else {
    console.warn('Speech recognition not supported in this browser.');
}

// Send message to Firebase
const sendMessage = (message, sender = 'user') => {
    const newMessageRef = push(ref(database, `users/${userId}/demple`)); // Update the path
    set(newMessageRef, {
        text: message,
        timestamp: Date.now(),
        sender: sender
    });
};

// Display message
const displayMessage = (message, isAI = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAI ? 'ai' : 'user'}`; // Add user or AI class

    const textDiv = document.createElement('div');
    textDiv.className = "text-gray-200 p-2 rounded-xl mb-2 " + (isAI ? "bg-gray-700" : "bg-indigo-500");
    textDiv.textContent = message;

    messageDiv.appendChild(textDiv);
    messagesList.appendChild(messageDiv);
    messagesList.scrollTop = messagesList.scrollHeight;
};

// AI Response using Groq API
const getAIResponse = async (userMessage) => {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: userMessage }]
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorDetails}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content.trim();

        // Save AI response to Firebase
        sendMessage(aiMessage, 'ai'); 
        displayMessage(aiMessage, true);
    } catch (error) {
        console.error("Error fetching AI response:", error);
    }
};

// Event: Send message on click
sendMessageButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent double invocation of touch and click
    sendUserMessage();
});

// Event: Handle message sending with Enter key
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default behavior (new line)
        sendUserMessage();
    }
});

// Function to send user message
const sendUserMessage = (message = null) => {
    const userMessage = message || messageInput.value.trim();
    if (!userMessage) return;

    // Save and display message
    sendMessage(userMessage, 'user');
    displayMessage(userMessage);

    // Reset input
    messageInput.value = "";

    sendMessageButton.innerHTML = "🎤";

    // Fetch AI response
    getAIResponse(userMessage);
};

// Event: Input field change
messageInput.addEventListener('input', () => {
    sendMessageButton.innerHTML = messageInput.value.trim() === "" ? "🎤" : "➤";
});

// Event: Send message on touch or click
sendMessageButton.addEventListener('touchend', (event) => {
    event.preventDefault(); // Prevent default behavior
    sendUserMessage(); // Call the function to send the message
});

sendMessageButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent double invocation of touch and click
    sendUserMessage(); // Call the function to send the message
});

// Start speech recognition on touchstart
sendMessageButton.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent default scrolling or other behaviors
    if (!messageInput.value.trim() && !isRecognizing) {
        targetTouch = event.targetTouches[0]; // Store the current touch point
        recognition.start(); // Start speech recognition
        isRecognizing = true; // Update the recognition state
        messageInput.placeholder = "🎤 Listening ..."; // Update placeholder
    }
});

// Stop speech recognition on touchend
sendMessageButton.addEventListener('touchend', (event) => {
    event.preventDefault(); // Prevent default behavior
    if (recognition && isRecognizing) {
        recognition.stop(); // Stop recognition
        messageInput.placeholder = "Type your message ..."; // Reset placeholder
        console.log('Speech recognition stopped'); // Log when user unholds
    }
});

// Stop recognition on touchcancel
sendMessageButton.addEventListener('touchcancel', (event) => {
    event.preventDefault(); // Prevent default behavior
    if (recognition) {
        recognition.stop(); // Ensure recognition stops on touch cancel
        messageInput.placeholder = "Type your message ..."; // Reset placeholder
        console.log('Speech recognition canceled'); // Log cancellation
    }
});

// For mouse events (ensure desktop compatibility)
sendMessageButton.addEventListener('mousedown', (event) => {
    event.preventDefault();
    if (!messageInput.value.trim() && !isRecognizing) {
        recognition.start(); // Start recognition
    }
});

sendMessageButton.addEventListener('mouseup', (event) => {
    event.preventDefault();
    if (recognition && isRecognizing) {
        recognition.stop(); // Stop recognition
        messageInput.placeholder = "Type your message ..."; // Reset placeholder
        console.log('Speech recognition stopped on mouseup'); // Log when user unholds with mouse
    }
});

// Display greeting message
const displayGreeting = () => {
    const greetingMessage = "Hello! How can I assist you today?";
    displayMessage(greetingMessage, true);
};

// Call displayGreeting when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    displayGreeting();
});

// Back button event
document.getElementById('backButton').addEventListener('click', () => {
    window.history.back();
});
