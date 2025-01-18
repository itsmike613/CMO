const firebaseConfig = {
    apiKey: "AIzaSyD-NJnaDTGQjXaLtg2rWi_zDTqO5TwmTYg",
    authDomain: "cmo613.firebaseapp.com",
    projectId: "cmo613",
    storageBucket: "cmo613.firebasestorage.app",
    messagingSenderId: "488087043077",
    appId: "1:488087043077:web:ca755d13fba7299577f06c"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function display(viewId) {
    document.querySelectorAll(".content-div").forEach((view) => view.classList.add("d-none"));
    document.getElementById(viewId).classList.remove("d-none");
}

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        document.getElementById('user-name').textContent = user.displayName;
        document.getElementById('profile-pic').src = user.photoURL;
        display('home');
    }).catch((error) => {
        console.error("Error during login: ", error);
    });
}

function logout() {
    auth.signOut().then(() => {
        display('login');
        document.getElementById('user-name').textContent = '';
        document.getElementById('profile-pic').src = '';
    }).catch((error) => {
        console.error("Error during logout: ", error);
    });
}

let timer = 0;
let timerInterval = null;
let currentLevel = 1;
let attemptsLeft = 4;
let guessRange = [1, 10];
let coins = 0;
let hintUsed = false;

function initializeGame() {
    document.getElementById("guess").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("hint").disabled = true;
    document.getElementById("playpause").textContent = "Play";
    document.getElementById("timer").textContent = "0s";
    timer = 0;
    hintUsed = false;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `${timer}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateLevel() {
    guessRange = [1, 10 + (currentLevel - 1) * 10];
    attemptsLeft = 4 + (currentLevel - 1);
    document.getElementById("range").textContent = `${guessRange[0]} to ${guessRange[1]}`;
    document.getElementById("attempts").textContent = attemptsLeft;
}

document.getElementById("playpause").addEventListener("click", () => {
    const isPaused = document.getElementById("playpause").textContent === "Play";
    if (isPaused) {
        startTimer();
        document.getElementById("guess").disabled = false;
        document.getElementById("submit").disabled = false;
        document.getElementById("hint").disabled = coins >= 10 && !hintUsed ? false : true;
        document.getElementById("playpause").textContent = "Pause";
    } else {
        stopTimer();
        document.getElementById("guess").disabled = true;
        document.getElementById("submit").disabled = true;
        document.getElementById("hint").disabled = true;
        document.getElementById("playpause").textContent = "Play";
    }
});

document.getElementById("submit").addEventListener("click", () => {
    const guess = parseInt(document.getElementById("guess").value, 10);
    if (guess >= guessRange[0] && guess <= guessRange[1]) {
        attemptsLeft--;
        document.getElementById("attempts").textContent = attemptsLeft;

        const correctAnswer = Math.floor(Math.random() * (guessRange[1] - guessRange[0] + 1)) + guessRange[0];
        if (guess === correctAnswer) {
            alert("Correct! Level Complete.");
            logGameData(auth.currentUser.uid, currentLevel, true);
            currentLevel++;
            coins += 10;
            updateLevel();
        } else if (attemptsLeft === 0) {
            alert("Game Over! Try Again.");
            logGameData(auth.currentUser.uid, currentLevel, false);
            initializeGame();
        } else {
            alert("Wrong Guess! Try Again.");
        }
    } else {
        alert(`Please enter a number between ${guessRange[0]} and ${guessRange[1]}`);
    }
});

document.getElementById("hint").addEventListener("click", () => {
    if (coins >= 10 && !hintUsed) {
        coins -= 10;
        hintUsed = true;
        document.getElementById("hint").disabled = true;
        const hint = Math.floor(Math.random() * (guessRange[1] - guessRange[0] + 1)) + guessRange[0];
        alert(`Hint: The number is around ${hint}`);
    }
});

document.getElementById("backToHome").addEventListener("click", () => {
    initializeGame();
    display("home");
});

function logGameData(userId, level, status) {
    const userRef = db.collection("Users").doc(userId);
    userRef.collection("gamelogs").add({
        level: level,
        time: timer,
        range: `${guessRange[0]} to ${guessRange[1]}`,
        attempts: `${4 + (level - 1) - attemptsLeft}/${4 + (level - 1)}`,
        hintUsed: hintUsed,
        status: status ? "won" : "lost",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (status) {
        checkAchievements(userId, level, status);
    }
}

function checkAchievements(userId, level, status) {
    const userRef = db.collection("Users").doc(userId);

    if (status && attemptsLeft === 4 + (level - 1)) {
        userRef.collection("achievements").doc("LuckyFirstTry").set({ completed: true });
    }

    if (status && timer <= 10) {
        userRef.collection("achievements").doc("QuickGuesser").set({ completed: true });
    }
}

auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection("Users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                coins = doc.data().coins || 0;
                updateLevel();
            } else {
                db.collection("Users").doc(user.uid).set({ coins: 0 });
            }
        });
    } else {
        display("login");
    }
});