export function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBH6LVGPFkfx7NVUtGCLvvCC9MXcdZo7zk",
        authDomain: "mylibcom-co.firebaseapp.com",
        projectId: "mylibcom-co",
        storageBucket: "mylibcom-co.firebasestorage.app",
        messagingSenderId: "922343336014",
        appId: "1:922343336014:web:5d71dfadf665c9a6c73b1f",
        measurementId: "G-DCG0KW3N11"
    };

    firebase.initializeApp(firebaseConfig);
    window.auth = firebase.auth();
    window.db = firebase.firestore();
}