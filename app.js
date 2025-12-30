    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

    const firebaseConfig = {
        apiKey: "AIzaSyDoXSwni65CuY1_32ZE8B1nwfQO_3VNpTw",
        authDomain: "contract-center-llc-10.firebaseapp.com",
        projectId: "contract-center-llc-10",
        storageBucket: "contract-center-llc-10.firebasestorage.app",
        messagingSenderId: "323221512767",
        appId: "1:323221512767:web:6421260f875997dbf64e8a",
        measurementId: "G-S2RJ0C6BWH"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    const form = document.getElementById('feedbackForm');
    const autofillBtn = document.getElementById('autofillBtn');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    let currentUser = null;
    let isFormSubmitted = false;

    // 1. Check Auth State on Load
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            autofillBtn.classList.remove('disabled');
            autofillBtn.innerText = "Autofill Account Information";
        } else {
            autofillBtn.classList.add('disabled');
            autofillBtn.innerText = "Sign in to use Autofill";
        }
    });

    // 2. Autofill Logic
    autofillBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            nameInput.value = currentUser.displayName || "HouseLearning Student";
            emailInput.value = currentUser.email;
            
            // Disable fields after autofilling
            nameInput.disabled = true;
            emailInput.disabled = true;
            
            autofillBtn.innerText = "✓ Information Verified";
            autofillBtn.classList.add('disabled');
        }
    });

    // 3. Prevent accidental exit (The Banner)
    window.addEventListener('beforeunload', (e) => {
        const isDirty = nameInput.value || emailInput.value || document.getElementById('comments').value;
        if (isDirty && !isFormSubmitted) {
            e.preventDefault();
            e.returnValue = 'Changes may not be finished. Are you sure you want to leave?';
        }
    });

    // 4. Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const status = document.getElementById('status');
        
        btn.disabled = true;
        btn.innerText = "Processing...";

        const payload = {
            name: nameInput.value,
            email: emailInput.value,
            rating: document.getElementById('rating').value,
            comments: document.getElementById('comments').value,
            verifiedAccount: nameInput.disabled, // true if autofilled
            timestamp: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "surveys", "manual", "submissions"), payload);
            isFormSubmitted = true; // Prevents the exit warning
            status.innerText = "Feedback sent successfully!";
            status.className = "success";
            status.style.display = "block";
            form.innerHTML = "<div style='text-align:center; padding: 20px;'><h3>Thank you!</h3><p>Your feedback has been recorded for HouseLearning.</p></div>";
        } catch (err) {
            console.error(err);
            btn.disabled = false;
            btn.innerText = "Submit Feedback";
            alert("Error saving data. Please try again.");
        }
    });
