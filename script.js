let currentUser = "Guest";
let profiles = [];
let currentProfile = null;
let difficulty = "easy";
let categories = ["addition"];
let mode = "practice";
let score = 0;
let timer = 60;
let timerInterval = null;
let currentQuestion = {};
let gameInProgress = false;
let previousQuestionText = "";
let questionsHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();
    let storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
        setCurrentUser(storedUser);
    } else {
        setCurrentUser("Guest");
    }
    updateLogoutButtonVisibility();
    updatePayButtonVisibility();
    updateProfilesButtonVisibility();
    displayMessage();
    if (document.body.contains(document.getElementById('loginName'))) {
        initProfilesPage();
    } else if (document.body.contains(document.getElementById('leaderboardTable'))) {
        loadLeaderboard('score');
        const sortSelect = document.getElementById('sortBy');
        sortSelect.addEventListener('change', () => {
            loadLeaderboard(sortSelect.value);
        });
    } else if (document.body.contains(document.getElementById('difficulty'))) {
        initGamePage();
    }
});

function isGuestUser() {
    return currentUser === "Guest";
}

function updateLogoutButtonVisibility() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        if (!isGuestUser()) {
            logoutBtn.classList.remove('hidden');
        } else {
            logoutBtn.classList.add('hidden');
        }
    }
}

function updatePayButtonVisibility() {
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        if (!isGuestUser()) {
            payBtn.classList.remove('hidden');
            console.log(`Premium button shown for user: ${currentUser}`);
        } else {
            payBtn.classList.add('hidden');
            console.log(`Premium button hidden for Guest user`);
        }
    }
}

function updateProfilesButtonVisibility() {
    const profilesBtn = document.getElementById('profilesBtn');
    if (profilesBtn) {
        if (isGuestUser()) {
            profilesBtn.classList.remove('hidden');
            console.log(`Profiles button shown for Guest user`);
        } else {
            profilesBtn.classList.add('hidden');
            console.log(`Profiles button hidden for user: ${currentUser}`);
        }
    }
}

function setMessage(message) {
    localStorage.setItem('gameMessage', message);
}

function displayMessage() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        const message = localStorage.getItem('gameMessage');
        if (message) {
            messageContainer.textContent = message;
            messageContainer.classList.remove('hidden');
            localStorage.removeItem('gameMessage');
            setTimeout(() => {
                messageContainer.classList.add('hidden');
            }, 5000);
        }
    }
}

function initGamePage() {
    const cuEl = document.getElementById('currentUser');
    if (cuEl) cuEl.textContent = currentUser;
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('submitAnswerBtn').addEventListener('click', submitAnswer);
    document.getElementById('skipBtn').addEventListener('click', skipQuestion);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('endGameBtn').addEventListener('click', endGame);
    document.getElementById('answerInput').addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            submitAnswer();
        }
    });
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    if (isGuestUser()) {
        difficulty = "easy";
        categories = ["addition"];
        mode = "practice";
        const difficultySelect = document.getElementById('difficulty');
        const categoryCheckboxes = document.querySelectorAll('.category');
        const gameModeSelect = document.getElementById('gameMode');
        difficultySelect.value = "easy";
        difficultySelect.disabled = true;
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === "addition";
            checkbox.disabled = true;
        });
        gameModeSelect.value = "practice";
        gameModeSelect.disabled = true;
        const settingsDiv = document.querySelector('.settings');
        const guestMessage = document.createElement('div');
        guestMessage.className = 'guest-message';
        guestMessage.innerHTML = '<p>Guest users can only play in easy difficulty with addition in practice mode. Create a profile to unlock all features!</p>';
        settingsDiv.appendChild(guestMessage);
    }
}

function initProfilesPage() {
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('registerBtn').addEventListener('click', register);
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function loadProfiles() {
    let stored = localStorage.getItem("numerixProfiles");
    if (stored) {
        profiles = JSON.parse(stored);
    } else {
        profiles = [];
    }
    if (!profiles.find(p => p.name === "Guest")) {
        profiles.push({ name: "Guest", password: null, scores: [] });
        saveProfiles();
    }
    if (!profiles.find(p => p.name === "Admin")) {
        profiles.push({ name: "Admin", password: "2204", scores: [] });
        saveProfiles();
    }
}

function saveProfiles() {
    localStorage.setItem("numerixProfiles", JSON.stringify(profiles));
}

function setCurrentUser(name) {
    currentUser = name;
    currentProfile = profiles.find(p => p.name === currentUser) || null;
    localStorage.setItem("currentUser", currentUser);
    updateLogoutButtonVisibility();
    updatePayButtonVisibility();
    updateProfilesButtonVisibility();
    const cuEl = document.getElementById('currentUser');
    if (cuEl) cuEl.textContent = currentUser;
    if (name === "Admin") {
        profiles = [{ name: "Guest", password: null, scores: [] }, { name: "Admin", password: "2204", scores: [] }];
        saveProfiles();
        resetLeaderboard(true);
        setCurrentUser("Guest");
        setMessage("All profiles and leaderboard data have been reset by Admin.");
        window.location.href = "index.html";
    }
}

function login() {
    const name = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value;
    const feedback = document.getElementById('loginFeedback');
    
    if (!name || !password) {
        feedback.textContent = "Please enter both name and password.";
        feedback.classList.remove('hidden');
        return;
    }
    
    const profile = profiles.find(p => p.name === name);
    if (!profile) {
        feedback.textContent = "User does not exist. Please register.";
        feedback.classList.remove('hidden');
        return;
    }
    
    if (profile.password !== password) {
        feedback.textContent = "Incorrect password.";
        feedback.classList.remove('hidden');
        return;
    }
    
    feedback.classList.add('hidden');
    setCurrentUser(name);
    setMessage("Logged in successfully as " + name);
    window.location.href = "index.html";
}

function register() {
    const name = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value;
    const feedback = document.getElementById('loginFeedback');
    
    if (!name || !password) {
        feedback.textContent = "Please enter both name and password.";
        feedback.classList.remove('hidden');
        return;
    }
    
    if (profiles.find(p => p.name === name)) {
        feedback.textContent = "User already exists. Please log in.";
        feedback.classList.remove('hidden');
        return;
    }
    
    profiles.push({ name, password, scores: [] });
    saveProfiles();
    feedback.classList.add('hidden');
    setMessage("Registered successfully! You can now log in.");
    document.getElementById('loginName').value = "";
    document.getElementById('loginPassword').value = "";
}

function logout() {
    setCurrentUser("Guest");
    setMessage("Logged out successfully!");
    window.location.href = "index.html";
}

function startGame() {
    difficulty = document.getElementById('difficulty').value;
    let categoryCheckboxes = document.querySelectorAll('.category');
    categories = [];
    categoryCheckboxes.forEach(c => {
        if (c.checked) categories.push(c.value);
    });
    if (categories.length === 0) {
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.textContent = "Please select at least one category.";
        messageContainer.classList.remove('hidden');
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
        return;
    }
    mode = document.getElementById('gameMode').value;
    score = 0;
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
    document.querySelector('.instructions').classList.add('hidden');
    document.querySelector('.settings').classList.add('hidden');
    document.querySelector('.game-section').classList.remove('hidden');
    document.querySelector('.result-section').classList.add('hidden');
    questionsHistory = [];
    if (mode === 'timeattack') {
        timer = 60;
        document.getElementById('timer').classList.remove('hidden');
        startTimer();
    } else {
        document.getElementById('timer').classList.add('hidden');
    }
    gameInProgress = true;
    previousQuestionText = "";
    generateQuestion();
}

function generateQuestion() {
    let maxRange;
    if (difficulty === 'easy') maxRange = 10;
    else if (difficulty === 'medium') maxRange = 50;
    else if (difficulty === 'hard') maxRange = 100;
    else maxRange = 100;

    let category = categories[Math.floor(Math.random() * categories.length)];
    let questionText = "";
    let answer = 0;
    let hint = "";
    let attempts = 0;

    do {
        attempts++;
        let num1 = Math.floor(Math.random() * maxRange) + 1;
        let num2 = Math.floor(Math.random() * maxRange) + 1;
        let num3 = Math.floor(Math.random() * maxRange) + 1;

        if (category === 'advanced') {
            const advancedTypes = ['sqrt', 'pi', 'sin', 'cos', 'tan', 'exp', 'log', 'factorial', 'algebra'];
            const advType = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
            switch (advType) {
                case 'sqrt':
                    let a = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 10)) + 1;
                    let perfectSquare = a * a;
                    questionText = `√${perfectSquare} = ?`;
                    answer = a;
                    hint = `Find the integer whose square is ${perfectSquare}.`;
                    break;
                case 'pi':
                    questionText = `Round π * ${num1} to the nearest integer: ?`;
                    answer = Math.round(Math.PI * num1);
                    hint = `π ≈ 3.14159. Multiply by ${num1} and round.`;
                    break;
                case 'sin':
                    const sinAngles = [30, 45, 60];
                    let angle = sinAngles[Math.floor(Math.random() * sinAngles.length)];
                    let sinValue;
                    if (angle === 30) sinValue = 0.5;
                    if (angle === 45) sinValue = 0.707;
                    if (angle === 60) sinValue = 0.866;
                    questionText = `What is sin(${angle}°)*100 rounded to the nearest integer?`;
                    answer = Math.round(sinValue * 100);
                    hint = `sin(30°)=0.5, sin(45°)≈0.707, sin(60°)≈0.866`;
                    break;
                case 'cos':
                    const cosAngles = [30, 45, 60];
                    angle = cosAngles[Math.floor(Math.random() * cosAngles.length)];
                    let cosValue;
                    if (angle === 30) cosValue = 0.866;
                    if (angle === 45) cosValue = 0.707;
                    if (angle === 60) cosValue = 0.5;
                    questionText = `What is cos(${angle}°)*100 rounded to the nearest integer?`;
                    answer = Math.round(cosValue * 100);
                    hint = `cos(30°)≈0.866, cos(45°)≈0.707, cos(60°)=0.5`;
                    break;
                case 'tan':
                    const tanAngles = [30, 45, 60];
                    angle = tanAngles[Math.floor(Math.random() * tanAngles.length)];
                    let tanValue;
                    if (angle === 30) tanValue = 0.577;
                    if (angle === 45) tanValue = 1;
                    if (angle === 60) tanValue = 1.732;
                    questionText = `What is tan(${angle}°)*100 rounded to the nearest integer?`;
                    answer = Math.round(tanValue * 100);
                    hint = `tan(30°)≈0.577, tan(45°)=1, tan(60°)≈1.732`;
                    break;
                case 'exp':
                    let base = difficulty === 'easy' ? 2 : Math.floor(Math.random() * 3) + 2;
                    let exponent = Math.floor(Math.random() * (difficulty === 'hard' ? 4 : 3)) + 1;
                    questionText = `${base}^${exponent} = ?`;
                    answer = Math.pow(base, exponent);
                    hint = `Multiply ${base} by itself ${exponent} times.`;
                    break;
                case 'log':
                    let logBase = difficulty === 'easy' ? 10 : [2, 10][Math.floor(Math.random() * 2)];
                    let logArg = Math.pow(logBase, Math.floor(Math.random() * 4) + 1);
                    questionText = `log_${logBase}(${logArg}) = ?`;
                    answer = Math.log(logArg) / Math.log(logBase);
                    hint = `What power of ${logBase} gives ${logArg}?`;
                    break;
                case 'factorial':
                    let n = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8)) + 1;
                    questionText = `${n}! = ?`;
                    answer = factorial(n);
                    hint = `Multiply all integers from 1 to ${n}.`;
                    break;
                case 'algebra':
                    let x = Math.floor(Math.random() * 10) + 1;
                    let c = Math.floor(Math.random() * maxRange) + 1;
                    questionText = `If 2x + ${c} = ${2 * x + c}, what is x?`;
                    answer = x;
                    hint = `Solve for x by isolating it.`;
                    break;
            }
        } else {
            const questionTypes = ['basic', 'multi', 'order'];
            const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            switch (category) {
                case 'addition':
                    if (qType === 'basic') {
                        questionText = `${num1} + ${num2} = ?`;
                        answer = num1 + num2;
                        hint = `Add ${num2} to ${num1}.`;
                    } else if (qType === 'multi') {
                        questionText = `${num1} + ${num2} + ${num3} = ?`;
                        answer = num1 + num2 + num3;
                        hint = `Add ${num1}, ${num2}, and ${num3} together.`;
                    } else {
                        questionText = `(${num1} + ${num2}) × ${num3} = ?`;
                        answer = (num1 + num2) * num3;
                        hint = `First add ${num1} and ${num2}, then multiply by ${num3}.`;
                    }
                    break;
                case 'subtraction':
                    if (difficulty !== 'easy' && Math.random() > 0.5) {
                        num1 = -num1;
                        hint = `Subtract ${num2} from negative ${-num1}.`;
                    }
                    if (num2 > num1) [num1, num2] = [num2, num1];
                    if (qType === 'basic') {
                        questionText = `${num1} - ${num2} = ?`;
                        answer = num1 - num2;
                        hint = hint || `Subtract ${num2} from ${num1}.`;
                    } else if (qType === 'multi') {
                        questionText = `${num1} - ${num2} - ${num3} = ?`;
                        answer = num1 - num2 - num3;
                        hint = `Subtract ${num2} and ${num3} from ${num1}.`;
                    } else {
                        questionText = `(${num1} - ${num2}) × ${num3} = ?`;
                        answer = (num1 - num2) * num3;
                        hint = `First subtract ${num2} from ${num1}, then multiply by ${num3}.`;
                    }
                    break;
                case 'multiplication':
                    if (qType === 'basic') {
                        questionText = `${num1} × ${num2} = ?`;
                        answer = num1 * num2;
                        hint = `Multiply ${num1} by ${num2}.`;
                    } else if (qType === 'multi') {
                        questionText = `${num1} × ${num2} × ${num3} = ?`;
                        answer = num1 * num2 * num3;
                        hint = `Multiply ${num1}, ${num2}, and ${num3} together.`;
                    } else {
                        questionText = `${num1} × (${num2} + ${num3}) = ?`;
                        answer = num1 * (num2 + num3);
                        hint = `First add ${num2} and ${num3}, then multiply by ${num1}.`;
                    }
                    break;
                case 'division':
                    num2 = Math.floor(Math.random() * (maxRange - 1)) + 1;
                    let product = num1 * num2;
                    if (difficulty !== 'easy' && Math.random() > 0.5) {
                        product = -product;
                        hint = `Divide negative ${product} by ${num1}.`;
                    }
                    if (qType === 'basic') {
                        questionText = `${product} ÷ ${num1} = ?`;
                        answer = num2;
                        hint = hint || `How many times does ${num1} go into ${product}?`;
                    } else if (qType === 'multi') {
                        let divisor = num1 * num3;
                        questionText = `${product * num3} ÷ ${divisor} = ?`;
                        answer = num2;
                        hint = `Divide ${product * num3} by ${divisor}.`;
                    } else {
                        questionText = `(${product} ÷ ${num1}) + ${num3} = ?`;
                        answer = num2 + num3;
                        hint = `First divide ${product} by ${num1}, then add ${num3}.`;
                    }
                    break;
            }
        }
    } while (questionText === previousQuestionText && attempts < 10);

    previousQuestionText = questionText;
    currentQuestion = { questionText, answer, hint, category };
    document.getElementById('questionText').textContent = questionText;
    document.getElementById('answerInput').value = "";
    document.getElementById('hintText').classList.add('hidden');
    document.getElementById('feedback').textContent = "";
}

// Helper function for factorial
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function submitAnswer() {
    if (!gameInProgress) return;
    let userAnswer = document.getElementById('answerInput').value;
    if (userAnswer === "") {
        document.getElementById('feedback').textContent = "Please enter a number.";
        document.getElementById('feedback').className = 'feedback feedback-wrong';
        return;
    }
    userAnswer = parseFloat(userAnswer);
    let isCorrect = Math.abs(userAnswer - currentQuestion.answer) < 0.01; // Allow small floating-point errors
    questionsHistory.push({
        questionText: currentQuestion.questionText,
        userAnswer: isNaN(userAnswer) ? "Invalid Input" : userAnswer,
        correctAnswer: currentQuestion.answer,
        correct: isCorrect
    });
    if (isCorrect) {
        if (mode === 'practice' || mode === 'timeattack') {
            score += 10;
            document.getElementById('feedback').textContent = "Correct! +10 points!";
            document.getElementById('feedback').className = 'feedback feedback-correct';
        } else {
            document.getElementById('feedback').textContent = "Correct!";
            document.getElementById('feedback').className = 'feedback feedback-correct';
        }
    } else {
        if (mode === 'practice' || mode === 'timeattack') {
            score -= 5;
            document.getElementById('feedback').textContent = "Wrong! -5 points!";
            document.getElementById('feedback').className = 'feedback feedback-wrong';
        } else {
            document.getElementById('feedback').textContent = "Wrong!";
            document.getElementById('feedback').className = 'feedback feedback-wrong';
        }
    }
    updateScore();
    generateQuestion();
}

function skipQuestion() {
    if (!gameInProgress) return;
    questionsHistory.push({
        questionText: currentQuestion.questionText,
        userAnswer: "Skipped",
        correctAnswer: currentQuestion.answer,
        correct: false
    });
    if (mode === 'practice' || mode === 'timeattack') {
        score -= 5;
        updateScore();
    }
    generateQuestion();
}

function showHint() {
    if (!gameInProgress) return;
    if (mode === 'practice' || mode === 'timeattack') {
        score -= 2;
        updateScore();
    }
    document.getElementById('hintText').textContent = "Hint: " + currentQuestion.hint;
    document.getElementById('hintText').classList.remove('hidden');
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
}

function endGame() {
    if (!gameInProgress) return;
    gameInProgress = false;
    stopTimer();
    showResults();
}

function showResults() {
    document.querySelector('.game-section').classList.add('hidden');
    document.querySelector('.result-section').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    saveScoreToProfile();
    displayAnswersSummary();
}

function displayAnswersSummary() {
    const container = document.querySelector('.result-section .answers-summary');
    container.innerHTML = "";
    if (questionsHistory.length === 0) {
        container.textContent = "No questions answered.";
        return;
    }
    let table = document.createElement('table');
    table.style.margin = "0 auto";
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    thead.innerHTML = `
        <tr>
            <th>Question</th>
            <th>Your Answer</th>
            <th>Correct Answer</th>
            <th>Result</th>
        </tr>
    `;
    questionsHistory.forEach(q => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${q.questionText}</td>
                        <td>${q.userAnswer}</td>
                        <td>${q.correctAnswer}</td>
                        <td>${q.correct ? 'Correct' : 'Wrong'}</td>`;
        tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

function playAgain() {
    document.querySelector('.instructions').classList.remove('hidden');
    document.querySelector('.settings').classList.remove('hidden');
    document.querySelector('.game-section').classList.add('hidden');
    document.querySelector('.result-section').classList.add('hidden');
}

function startTimer() {
    document.getElementById('timer').textContent = "Time: " + timer;
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').textContent = "Time: " + timer;
        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function saveScoreToProfile() {
    if (currentProfile && currentProfile.name !== "Admin") {
        currentProfile.scores.push({ 
            mode,
            difficulty,
            categories,
            score,
            date: new Date().toISOString()
        });
        saveProfiles();
    }
}

function loadLeaderboard(sortBy = 'score') {
    let stored = localStorage.getItem("numerixProfiles");
    let loadedProfiles = stored ? JSON.parse(stored) : [];
    let allScores = [];
    loadedProfiles.forEach(p => {
        p.scores.forEach(s => {
            allScores.push({
                user: p.name,
                mode: s.mode,
                difficulty: s.difficulty,
                categories: s.categories.join(", "),
                score: s.score,
                date: s.date
            });
        });
    });
    if (sortBy === 'score') {
        allScores.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
        allScores.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const tbody = document.querySelector('#leaderboardTable tbody');
    if (tbody) {
        tbody.innerHTML = "";
        allScores.forEach(entry => {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td>${entry.user}</td>
                            <td>${entry.mode}</td>
                            <td>${entry.difficulty}</td>
                            <td>${entry.categories}</td>
                            <td>${entry.score}</td>
                            <td>${new Date(entry.date).toLocaleString()}</td>`;
            tbody.appendChild(tr);
        });
    }
}

function resetLeaderboard(silent = false) {
    let stored = localStorage.getItem("numerixProfiles");
    let loadedProfiles = stored ? JSON.parse(stored) : [];
    loadedProfiles.forEach(p => p.scores = []);
    localStorage.setItem("numerixProfiles", JSON.stringify(loadedProfiles));
    if (!silent) {
        loadLeaderboard();
        setMessage("Leaderboard reset!");
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const payBtn = document.getElementById("payBtn");
    if (payBtn) {
        payBtn.addEventListener("click", function (e) {
            e.preventDefault();
            showPremiumPopup();
        });
    }
});

function showPremiumPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'premium-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'premium-popup';
    popup.innerHTML = `
        <h3>Go Premium for ₹100!</h3>
        <ul>
            <li>Enjoy an ad-free experience</li>
            <li>Unlock exclusive game modes and challenges</li>
            <li>Support our developers to keep Numerix growing</li>
            <li>Get a special badge on the leaderboard</li>
        </ul>
        <div>
            <button class="btn hoverable" id="proceedToPay">Proceed to Payment</button>
            <button class="btn hoverable" id="cancelPremium">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    document.getElementById('proceedToPay').addEventListener('click', () => {
        overlay.remove();
        popup.remove();
        
        const options = {
            key: "rzp_test_Uz0p2IvZmJ0LCe",
            amount: 10000,
            currency: "INR",
            name: "Numerix Game",
            description: "Premium Membership",
            handler: function (response) {
                setMessage("Payment successful! ID: " + response.razorpay_payment_id);
                window.location.href = "index.html";
            },
            theme: {
                color: "#5c6bc0",
            },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    });
    
    document.getElementById('cancelPremium').addEventListener('click', () => {
        overlay.remove();
        popup.remove();
    });
}