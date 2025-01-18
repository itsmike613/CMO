const firebaseConfig = {
    apiKey: "AIzaSyD-NJnaDTGQjXaLtg2rWi_zDTqO5TwmTYg",
    authDomain: "cmo613.firebaseapp.com",
    projectId: "cmo613",
    storageBucket: "cmo613.firebasestorage.app",
    messagingSenderId: "488087043077",
    appId: "1:488087043077:web:ca755d13fba7299577f06c"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

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

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('user-name').textContent = user.displayName;
        document.getElementById('profile-pic').src = user.photoURL;
        display('home');
    } else {
        display('login');
    }
});