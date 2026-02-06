(() => {
    // ============= DOM Elements =============
    const inputArea = document.querySelector('#input-field');
    const paragraphBox = document.querySelector("#paragraph-box");
    const startBttn = document.querySelector('#start-bttn');
    const wpm_container = document.querySelector('#wpm_con');
    const time_container = document.querySelector('#time_con');
    const accuracy_container = document.querySelector('#acc_con');
    const cpm_container = document.querySelector('#cpm_con');
    const errors_container = document.querySelector('#errors_con');
    const themeToggle = document.querySelector('#theme-toggle');
    const difficultySelect = document.querySelector('#difficulty');
    const durationSelect = document.querySelector('#duration');
    const languageSelect = document.querySelector('#language');
    const modeSelect = document.querySelector('#mode');
    const keyboardLayoutSelect = document.querySelector('#keyboard-layout');
    const soundToggle = document.querySelector('#sound-toggle');
    const timerDisplay = document.querySelector('#timer-display');
    const velocityDisplay = document.querySelector('#velocity-display');
    const coachTips = document.querySelector('#coach-tips');
    const keyboardHeatmapContainer = document.querySelector('#keyboard-heatmap-container');
    const keyboardHeatmap = document.querySelector('#keyboard-heatmap');
    const leaderboardList = document.querySelector('#leaderboard-list');
    const historyList = document.querySelector('#history-list');
    const clearHistoryBtn = document.querySelector('#clear-history');
    const exportBtn = document.querySelector('#export-results');
    const customTextBtn = document.querySelector('#use-custom-text');
    const customTextArea = document.querySelector('#custom-text');
    const countdownContainer = document.querySelector('#countdown-container');
    const countdownNumber = document.querySelector('#countdown-number');
    const badgesGrid = document.querySelector('#badges-grid');

    // ============= State Variables =============
    let timer = null;
    let secondsPassed = 0;
    let testDuration = null;
    let isTestActive = false;
    let keyPressCount = {};
    let keyPressTimes = {};
    let velocityHistory = [];
    let heatmapUpdateTimeout = null;
    let statsUpdateTimeout = null;
    let audioContext = null;
    let lastSoundTime = 0;
    let currentCustomText = null;
    let noErrorMode = false;
    let blindMode = false;
    let testInProgress = false;

    const HEATMAP_UPDATE_INTERVAL = 500;
    const STATS_UPDATE_INTERVAL = 200;
    const SOUND_THROTTLE = 50;

    // ============= Achievements Configuration =============
    const achievements = [
        { id: 'speed-100', name: 'Speed Demon', description: '100+ WPM', icon: '⚡', condition: (r) => r.wpm >= 100 },
        { id: 'accuracy-99', name: 'Perfect', description: '99%+ Accuracy', icon: '🎯', condition: (r) => r.accuracy >= 99 },
        { id: 'marathon', name: 'Marathon', description: 'Complete 2min test', icon: '🏃', condition: (r) => r.time >= 120 },
        { id: 'consistency', name: 'Consistent', description: '95%+ Accuracy (3 times)', icon: '📊', condition: null },
        { id: 'speedster', name: 'Speedster', description: '120+ WPM', icon: '🚀', condition: (r) => r.wpm >= 120 },
        { id: 'first-test', name: 'Getting Started', description: 'Complete first test', icon: '🌱', condition: null },
    ];

    // ============= Audio Context =============
    function initAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Audio Context not available');
                audioContext = null;
            }
        }
        return audioContext;
    }

    // ============= Text Collections =============
    const textCollections = {
        easy: {
            english: [
                "The quick brown fox jumps over the lazy dog.",
                "Hello world from the typing test.",
                "Practice makes perfect in typing.",
                "Keep calm and type on.",
                "Speed and accuracy matter.",
            ],
            motivational: [
                "You are doing great keep typing.",
                "Every keystroke brings you closer.",
                "Success comes with practice.",
                "Believe in yourself and type.",
                "The best time to type is now.",
            ],
            technical: [
                "Code is poetry written for machines.",
                "Variables store data in memory.",
                "Functions are reusable code blocks.",
                "Loops iterate over collections.",
                "Algorithms solve problems efficiently.",
            ]
        },
        medium: {
            english: [
                "The quick brown fox jumps over the lazy dog while the sun sets over the digital horizon.",
                "Consistency is the key to mastering any skill. Practice every day and watch your progress grow.",
                "Design is not just what it looks like and feels like. Design is how it works for the user.",
                "Focus on being productive instead of busy. Time is the most valuable asset we have in this life.",
                "Success is not final, failure is not fatal: it is the courage to continue that counts in the end.",
            ],
            motivational: [
                "Your time is limited, so do not waste it living someone else's life or following their dreams.",
                "The only way to do great work is to love what you do. Keep looking and do not settle for less.",
                "In the middle of every difficulty lies opportunity. Embrace challenges and grow stronger with each one.",
                "The future belongs to those who believe in the beauty of their dreams. Keep dreaming and keep typing.",
                "Don't watch the clock; do what it does. Keep going and make every second count towards your goals.",
            ],
            technical: [
                "Asynchronous programming allows concurrent task execution without blocking the main thread.",
                "Object oriented design principles promote code reusability and maintainability.",
                "Database normalization reduces data redundancy and improves query performance.",
                "RESTful APIs provide stateless communication between client and server applications.",
                "Version control systems track changes and enable collaborative development workflows.",
            ]
        },
        hard: {
            english: [
                "The efficacious implementation of sophisticated algorithms necessitates comprehensive understanding of computational complexity paradigms and optimization methodologies.",
                "Phenomenological approaches to existential philosophy challenge conventional epistemological frameworks and necessitate reconsideration of fundamental ontological presuppositions.",
                "Implementing microservices architecture requires meticulous orchestration of containerized components, sophisticated load balancing, and comprehensive monitoring infrastructures.",
                "Cryptographic protocols employ mathematical transformations to ensure confidentiality, authenticity, and non-repudiation across unsecured communication channels.",
                "Machine learning models leverage statistical inference and pattern recognition to extract meaningful insights from voluminous multidimensional datasets.",
            ],
            motivational: [
                "Transcend limitations by embracing the extraordinary potential within your consciousness and cultivating relentless determination.",
                "Metamorphosis of character occurs through perseverance, introspection, and unwavering commitment to continuous self-improvement.",
                "Enlightenment emerges from understanding interconnectedness and recognizing infinite possibilities within seemingly insurmountable challenges.",
                "Virtuosity manifests through deliberate practice, authentic passion, and an uncompromising commitment to mastery.",
                "The zenith of achievement reveals itself to those who persistently pursue excellence and transcend conventional boundaries.",
            ],
            technical: [
                "Implementing homomorphic encryption enables computation on encrypted data without decryption, revolutionizing secure cloud computing paradigms.",
                "Quantum computing exploits superposition and entanglement to achieve exponential speedups for specific computational problems.",
                "Distributed consensus mechanisms in blockchain networks solve Byzantine fault tolerance through sophisticated cryptographic commitments.",
                "Natural language processing combines neural architectures with linguistic theory to enable machines to comprehend human communication.",
                "Zero knowledge proofs demonstrate cryptographic statements without revealing underlying information or requiring trusted intermediaries.",
            ]
        }
    };

    // ============= Animations =============
    function triggerFireworks() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    function animateCounter(element, startValue, endValue, duration = 600) {
        const startTime = Date.now();

        function updateCounter() {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuad(progress));
            element.innerText = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        updateCounter();
    }

    function easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }

    function animateCharacter(span) {
        span.style.animation = 'charScale 0.3s ease-out';
        span.addEventListener('animationend', () => {
            span.style.animation = '';
        }, { once: true });
    }

    // ============= Sound Effects =============
    function playSound(type) {
        if (!soundToggle.checked) return;

        const now = Date.now();
        if (now - lastSoundTime < SOUND_THROTTLE) return;
        lastSoundTime = now;

        const ctx = initAudioContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            const currentTime = ctx.currentTime;
            const duration = type === 'correct' ? 0.04 : 0.06;

            if (type === 'correct') {
                oscillator.frequency.value = 900;
                gain.gain.setValueAtTime(0.03, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
            } else if (type === 'wrong') {
                oscillator.frequency.value = 200;
                gain.gain.setValueAtTime(0.02, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
            }

            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);
        } catch (e) {
            // Silent fail
        }
    }

    // ============= Countdown Animation =============
    function startCountdown() {
        return new Promise((resolve) => {
            countdownContainer.classList.remove('hidden-section');
            let count = 3;
            countdownNumber.innerText = count;

            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownNumber.innerText = count;
                } else if (count === 0) {
                    countdownNumber.innerText = "GO!";
                } else {
                    clearInterval(interval);
                    countdownContainer.classList.add('hidden-section');
                    resolve();
                }
            }, 1000);
        });
    }

    // ============= Keyboard Heatmap =============
    function updateKeyboardHeatmap() {
        const keyboard = 'qwertyuiopasdfghjklzxcvbnm'.split('');
        let heatmapHTML = '<div class="heatmap-grid">';

        const maxCount = Math.max(...Object.values(keyPressCount), 1);

        keyboard.forEach(key => {
            const count = keyPressCount[key] || 0;
            const intensity = (count / maxCount) * 100;
            heatmapHTML += `<div class="heatmap-key" style="background-color: rgba(122, 162, 247, ${intensity / 100})">${key}</div>`;
        });

        heatmapHTML += '</div>';
        keyboardHeatmap.innerHTML = heatmapHTML;
    }

    function debouncedHeatmapUpdate() {
        clearTimeout(heatmapUpdateTimeout);
        heatmapUpdateTimeout = setTimeout(() => {
            updateKeyboardHeatmap();
        }, HEATMAP_UPDATE_INTERVAL);
    }



    // ============= Personal Records =============
    function updatePR() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        if (history.length === 0) {
            document.getElementById('pr-wpm').innerText = '0 WPM';
            return;
        }

        const maxWPM = Math.max(...history.map(r => r.wpm));
        document.getElementById('pr-wpm').innerText = maxWPM + ' WPM';
    }

    // ============= Typing Streaks =============
    function updateStreak() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        const today = new Date();
        let streak = 0;

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();

            if (!history.some(r => new Date(r.date).toDateString() === dateStr)) {
                if (i === 0) continue;
                break;
            }
            streak++;
        }

        document.getElementById('streak-count').innerText = streak + ' Days';
    }

    // ============= Achievement Badges =============
    function updateAchievements() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        const unlockedAchievements = [];

        achievements.forEach(achievement => {
            const isUnlocked = localStorage.getItem(`achievement-${achievement.id}`) === 'true';

            if (achievement.condition) {
                const isConditionMet = history.some(achievement.condition);
                if (isConditionMet && !isUnlocked) {
                    localStorage.setItem(`achievement-${achievement.id}`, 'true');
                    unlockedAchievements.push(achievement);
                }
            }
        });

        let html = '';
        achievements.forEach(achievement => {
            const isUnlocked = localStorage.getItem(`achievement-${achievement.id}`) === 'true' || history.length >= 1;
            html += `<div class="badge ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon">${achievement.icon}</div>
            <div class="badge-name">${achievement.name}</div>
            <div class="badge-desc">${achievement.description}</div>
        </div>`;
        });

        badgesGrid.innerHTML = html;
    }

    // ============= Coach Tips =============
    function getCoachTips(accuracy, wpm) {
        const tips = [];

        if (accuracy < 90) tips.push('Focus on accuracy over speed');
        if (wpm < 50) tips.push('Keep practicing to improve speed');
        if (wpm > 100 && accuracy < 95) tips.push('You\'re fast! Try to improve accuracy');
        if (accuracy > 98) tips.push('Excellent accuracy! Keep it up!');

        if (tips.length === 0) tips.push('You\'re doing great!');

        coachTips.innerHTML = `<div class="coach-message">💡 ${tips[0]}</div>`;
        coachTips.classList.remove('hidden-section');
    }

    // ============= Difficulty Progression =============
    function recommendNextDifficulty(accuracy, wpm) {
        const current = difficultySelect.value;

        if (accuracy > 95 && wpm > 80 && current === 'easy') {
            return 'medium';
        } else if (accuracy > 95 && wpm > 100 && current === 'medium') {
            return 'hard';
        }
        return current;
    }

    // ============= Export Results =============


    // ... (existing text collections) ...


    // ============= Main Test Logic =============
    async function init() {
        try {
            console.log("Init started");
            resetVal();
            paragraphBox.innerHTML = '';
            keyPressCount = {};
            keyPressTimes = {};
            velocityHistory = [];

            blindMode = modeSelect.value === 'blind';
            noErrorMode = modeSelect.value === 'no-error';

            const difficulty = difficultySelect.value;
            const language = languageSelect.value;
            testDuration = durationSelect.value === 'unlimited' ? null : parseInt(durationSelect.value);

            let textToUse = currentCustomText;
            if (modeSelect.value === 'custom') {
                if (!currentCustomText) {
                    alert('Please enter custom text first');
                    return;
                }
            } else {
                // Standard Text Mode
                console.log("Fetching text for:", difficulty, language);
                const sentences = textCollections[difficulty][language];
                if (!sentences) throw new Error(`No text found for ${difficulty}/${language}`);
                textToUse = sentences[Math.floor(Math.random() * sentences.length)];
                // paragraphBox.style.textAlign = 'center'; // Removed as per user request to keep UI consistent
            }

            console.log("Text selected:", textToUse);

            // Standard Rendering
            textToUse.split('').forEach(char => {
                const span = document.createElement('span');
                span.innerText = char;
                if (blindMode) span.style.visibility = 'hidden';
                paragraphBox.appendChild(span);
            });

            if (paragraphBox.firstChild) {
                paragraphBox.firstChild.classList.add('cursor-highlight');
            }

            // Start countdown
            console.log("Starting countdown");
            await startCountdown();

            inputArea.focus();
            isTestActive = true;
            testInProgress = true;

            if (testDuration) {
                timerDisplay.style.display = 'block';
                timerDisplay.innerText = testDuration;
            } else {
                timerDisplay.style.display = 'none';
            }
        } catch (error) {
            console.error("Init Error:", error);
            alert("Error starting test: " + error.message);
        }
    }

    function resetVal() {
        clearInterval(timer);
        timer = null;
        secondsPassed = 0;
        inputArea.value = '';
        time_container.innerText = '0';
        wpm_container.innerText = '0';
        accuracy_container.innerText = '0%';
        cpm_container.innerText = '0';
        errors_container.innerText = '0';
        velocityDisplay.innerText = '0 WPM';
        paragraphBox.scrollLeft = 0;
        startBttn.innerText = 'Restart';
        keyboardHeatmapContainer.classList.add('heatmap-hidden');
        coachTips.classList.add('hidden-section');
    }

    function startTimer() {
        if (!timer) {
            timer = setInterval(() => {
                secondsPassed++;
                time_container.innerText = secondsPassed;

                if (testDuration) {
                    const remaining = Math.max(0, testDuration - secondsPassed);
                    timerDisplay.innerText = remaining;

                    if (remaining <= 0) {
                        finishTest();
                    }
                }
            }, 1000);
        }
    }

    function check() {
        if (!isTestActive) return;

        const spanArray = paragraphBox.querySelectorAll('span');
        const inputChars = inputArea.value.split('');

        if (inputChars.length > 0) {
            startTimer();
            keyboardHeatmapContainer.classList.remove('heatmap-hidden');
        }

        let correctCount = 0;
        let wrongCount = 0;
        let lastWasCorrect = true;

        for (let index = 0; index < spanArray.length; index++) {
            const span = spanArray[index];
            const typedChar = inputChars[index];

            span.className = '';

            if (typedChar === undefined) {
                // Not typed yet
            } else if (typedChar === span.innerText) {
                span.classList.add('correct');
                if (blindMode) span.style.visibility = 'visible';
                if (index === inputChars.length - 1) {
                    animateCharacter(span);
                }
                correctCount++;
                const key = typedChar.toLowerCase();
                keyPressCount[key] = (keyPressCount[key] || 0) + 1;
                if (!keyPressTimes[key]) keyPressTimes[key] = [];
                keyPressTimes[key].push(100);
                lastWasCorrect = true;
            } else {
                span.classList.add('wrong');
                if (index === inputChars.length - 1) {
                    animateCharacter(span);
                }
                wrongCount++;
                lastWasCorrect = false;

                if (noErrorMode) {
                    isTestActive = false;
                    finishTest();
                    return;
                }
            }
        }

        if (inputChars.length > 0) {
            playSound(lastWasCorrect ? 'correct' : 'wrong');
        }

        debouncedHeatmapUpdate();

        clearTimeout(statsUpdateTimeout);
        statsUpdateTimeout = setTimeout(() => {
            if (secondsPassed > 0) {
                const timeInMinutes = secondsPassed / 60;
                const liveCPM = Math.round(inputChars.length / timeInMinutes);
                const liveWPM = Math.round((correctCount / 5) / timeInMinutes);
                cpm_container.innerText = liveCPM;
                wpm_container.innerText = liveWPM;
                velocityDisplay.innerText = liveWPM + ' WPM';
                velocityHistory.push({ time: secondsPassed, wpm: liveWPM });

                const liveAccuracy = inputChars.length > 0 ? Math.round((correctCount / inputChars.length) * 100) : 0;
                accuracy_container.innerText = liveAccuracy + '%';

                errors_container.innerText = wrongCount;

                getCoachTips(liveAccuracy, liveWPM);
            }
        }, STATS_UPDATE_INTERVAL);

        const nextIndex = inputChars.length;
        if (nextIndex < spanArray.length) {
            spanArray[nextIndex].classList.add('cursor-highlight');
            if (nextIndex % 5 === 0) {
                const currentSpan = spanArray[nextIndex];
                paragraphBox.scrollLeft = currentSpan.offsetLeft - (paragraphBox.offsetWidth / 2);
            }
        }

        if (inputChars.length === spanArray.length) {
            finishTest();
        }
    }

    function finishTest() {
        clearInterval(timer);
        isTestActive = false;
        testInProgress = false;

        const spanArray = paragraphBox.querySelectorAll('span');
        const correctChars = paragraphBox.querySelectorAll('.correct').length;
        const wrongChars = paragraphBox.querySelectorAll('.wrong').length;
        const totalChars = spanArray.length;

        const accuracy = Math.round((correctChars / totalChars) * 100);
        const timeInMinutes = Math.max(secondsPassed, 1) / 60;
        const wpm = Math.round((correctChars / 5) / timeInMinutes);
        const cpm = Math.round(correctChars / timeInMinutes);

        triggerFireworks();

        const currentWPM = parseInt(wpm_container.innerText) || 0;
        const currentCPM = parseInt(cpm_container.innerText) || 0;

        animateCounter(wpm_container, currentWPM, wpm, 800);
        animateCounter(cpm_container, currentCPM, cpm, 800);

        accuracy_container.innerText = accuracy + '%';
        errors_container.innerText = wrongChars;

        startBttn.innerText = 'Try Again';
        startBttn.focus();

        const testResult = {
            date: new Date().toLocaleString(),
            wpm: wpm,
            cpm: cpm,
            accuracy: accuracy,
            time: secondsPassed,
            difficulty: difficultySelect.value,
            language: languageSelect.value,
            errors: wrongChars
        };

        saveTestResult(testResult);
        updateLeaderboard();
        updateHistory();
        updatePR();
        updateStreak();
        updateAchievements();
    }

    function saveTestResult(result) {
        let history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        history.push(result);
        localStorage.setItem('typingHistory', JSON.stringify(history));
    }

    function updateLeaderboard() {
        // Mock data generation (since we removed the backend/global part, we simulate local leaderboard filtering)
        // For now, let's just use the history as a source for "local leaderboard" mixed with some static high scores for visual demo
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        const difficulty = document.querySelector('.filter-btn.active').dataset.filter;

        let filtered = history.sort((a, b) => b.wpm - a.wpm).slice(0, 10);

        if (difficulty !== 'all') {
            if (difficulty === 'hard') filtered = filtered.filter(r => r.difficulty === 'Hard');
        }

        let html = '';
        if (filtered.length === 0) {
            html = '<div class="empty-state"><p>No data for this filter</p></div>';
        } else {
            html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>WPM</th><th>Accuracy</th><th>Mode</th><th>Date</th></tr></thead><tbody>';
            filtered.forEach((result, index) => {
                const dateObj = new Date(result.date);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                html += `<tr>
                    <td>#${index + 1}</td>
                    <td>${result.wpm}</td>
                    <td>${result.accuracy}%</td>
                    <td>${result.difficulty}</td>
                    <td>${dateStr}</td>
                </tr>`;
            });
            html += '</tbody></table>';
        }

        leaderboardList.innerHTML = html;
    }

    function updateHistory() {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];

        let html = '';
        if (history.length === 0) {
            html = `
            <div class="empty-state">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📜</div>
                <p>No test history found.</p>
                <span class="label">Complete a test to see your progress here!</span>
            </div>`;
        } else {
            html = '<table class="history-table"><thead><tr><th>Date & Time</th><th>WPM</th><th>Accuracy</th><th>Time</th><th>Mode</th></tr></thead><tbody>';
            const reversed = [...history].reverse();
            reversed.forEach(result => {
                const dateObj = new Date(result.date);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                // WPM Badge Color
                let wpmClass = 'badge-normal';
                if (result.wpm >= 100) wpmClass = 'badge-elite';
                else if (result.wpm >= 70) wpmClass = 'badge-pro';
                else if (result.wpm >= 40) wpmClass = 'badge-intermediate';

                // Accuracy Color
                const accClass = result.accuracy >= 98 ? 'text-success' : (result.accuracy < 90 ? 'text-warning' : '');

                html += `<tr>
                <td>
                    <div class="history-date">${dateStr}</div>
                    <div class="history-time">${timeStr}</div>
                </td>
                <td><span class="wpm-badge ${wpmClass}">${result.wpm}</span></td>
                <td class="${accClass}" style="font-weight:700;">${result.accuracy}%</td>
                <td>${result.time}s</td>
                <td><span class="mode-tag">${result.difficulty}</span></td>
            </tr>`;
            });
            html += '</tbody></table>';
        }

        historyList.innerHTML = html;
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerText = newTheme === 'dark' ? '🌙' : '☀️';
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerText = savedTheme === 'dark' ? '🌙' : '☀️';
    }

    function navigate(section) {
        document.querySelectorAll('section').forEach(s => s.classList.add('hidden-section'));

        if (section === 'test') {
            document.getElementById('test-section').classList.remove('hidden-section');
        } else if (section === 'achievements') {
            document.getElementById('achievements-section').classList.remove('hidden-section');
            updateAchievements();
            updatePR();
            updateStreak();
        } else if (section === 'leaderboard') {
            document.getElementById('leaderboard-section').classList.remove('hidden-section');
            updateLeaderboard();
        } else if (section === 'stats') {
            document.getElementById('stats-section').classList.remove('hidden-section');
            updateHistory();
        } else if (section === 'profile') {
            document.getElementById('profile-section').classList.remove('hidden-section');
            UserProfile.updateUI();
        } else if (section === 'global-rankings') {
            document.getElementById('global-rankings-section').classList.remove('hidden-section');
            GlobalRankings.render();
        }
    }

    // ============= Event Listeners =============
    startBttn.addEventListener('click', init);
    inputArea.addEventListener('input', check);
    themeToggle.addEventListener('click', toggleTheme);
    // ============= Modal & Toast Logic =============
    const modal = document.getElementById('confirmation-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const toast = document.getElementById('toast-notification');

    function showToast(message, isSuccess = true) {
        const toastMsg = document.getElementById('toast-message');
        const toastIcon = document.querySelector('.toast-icon');

        toastMsg.innerText = message;
        toastIcon.innerText = isSuccess ? '✅' : '❌';
        toast.style.borderLeftColor = isSuccess ? 'var(--correct-color)' : 'var(--wrong-color)';

        toast.classList.remove('hidden-section');
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden-section'), 400);
        }, 3000);
    }

    clearHistoryBtn.addEventListener('click', () => {
        modal.classList.remove('hidden-section');
    });

    modalCancel.addEventListener('click', () => {
        modal.classList.add('hidden-section');
    });

    modalConfirm.addEventListener('click', () => {
        localStorage.setItem('typingHistory', JSON.stringify([]));
        updateHistory();
        updateLeaderboard();
        modal.classList.add('hidden-section');
        showToast('History cleared successfully!');
    });

    exportBtn.addEventListener('click', () => {
        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];

        if (history.length === 0) {
            showToast('No results to export!', false);
            return;
        }

        let csv = 'Date,WPM,CPM,Accuracy,Errors,Time (s),Difficulty\n';
        history.forEach(result => {
            csv += `"${result.date}",${result.wpm},${result.cpm},${result.accuracy},${result.errors},${result.time},${result.difficulty}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'typing-results.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        showToast('Results exported as CSV!');
    });

    customTextBtn.addEventListener('click', () => {
        if (!customTextArea.value.trim()) {
            alert('Please enter some text!');
            return;
        }
        currentCustomText = customTextArea.value;
        alert('Custom text saved! Select "Custom Text" mode to use it.');
    });

    modeSelect.addEventListener('change', () => {
        const customContainer = document.getElementById('custom-text-container');
        if (modeSelect.value === 'custom') {
            customContainer.classList.remove('hidden-section');
        } else {
            customContainer.classList.add('hidden-section');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('href');

            if (targetId === '#test-section') navigate('test');
            else if (targetId === '#achievements-section') navigate('achievements');
            else if (targetId === '#leaderboard-section') navigate('leaderboard');
            else if (targetId === '#stats-section') navigate('stats');
        });
    });



    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateLeaderboard();
        });
    });

    inputArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!isTestActive) init();
        }
    });

    // ============= Initialize =============
    initializeTheme();
    paragraphBox.innerHTML = "Click 'Start' to test your speed!";
    updatePR();
    updateStreak();
    updateAchievements();
})();