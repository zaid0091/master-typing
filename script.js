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
    const levelDisplay = document.querySelector('#level-display');
    const xpBarInner = document.querySelector('#xp-bar-inner');
    const zenToggle = document.querySelector('#zen-toggle');
    const profileBtn = document.querySelector('#profile-btn');

    // ============= Supabase Configuration =============
    // IMPORTANT: Replace these with your project's URL and Anon Key from Settings > API
    const SUPABASE_URL = "https://kqcmwqowbsgojoitsqlg.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxY213cW93YnNnb2pvaXRzcWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODQ4ODUsImV4cCI6MjA4NjE2MDg4NX0.kGeNvegsDy-dQwLWoZ8J7QvpzKRjS5cqkTuOhtQya88";

    let supabase = null;
    if (typeof window.supabase !== 'undefined' && SUPABASE_URL.indexOf("YOUR_SUPABASE_URL") === -1) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

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
    let ghostPace = 0;
    let ghostIndex = 0;
    let currentPR = null;

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
    }

    // ============= Global Leaderboard Logic =============
    const GlobalLeaderboard = {
        saveScore: async function (wpm, accuracy, difficulty) {
            if (!supabase) return;
            const username = localStorage.getItem('globalUsername');
            if (!username) return;

            const avatar = UserProfile.getAvatar();

            const { data, error } = await supabase
                .from('global_leaderboard')
                .insert([
                    { username, wpm, accuracy, difficulty, avatar }
                ]);

            if (error) console.error('Error saving global score:', error);
            else showToast('Global score published! 🌎');
        },

        fetchTopScores: async function () {
            if (!supabase) return [];
            const { data, error } = await supabase
                .from('global_leaderboard')
                .select('*')
                .order('wpm', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching global scores:', error);
                return [];
            }
            return data;
        }
    };

    // ============= Titles & Prestige Configuration =============
    const TITLES = [
        { id: 'novice', name: 'Novice', tier: 'common', requirement: 'Level 2', condition: (stats, level) => level >= 2 },
        { id: 'enthusiast', name: 'Enthusiast', tier: 'common', requirement: '10 tests completed', condition: (stats) => stats.totalTests >= 10 },
        { id: 'precision', name: 'Precision', tier: 'rare', requirement: '98% Avg. Accuracy', condition: (stats) => stats.avgAcc >= 98 },
        { id: 'speed-demon', name: 'Speed Demon', tier: 'rare', requirement: '100+ Best WPM', condition: (stats) => stats.pbEasy >= 100 || stats.pbMedium >= 100 || stats.pbHard >= 100 },
        { id: 'zen-master', name: 'Zen Master', tier: 'epic', requirement: '50 tests completed', condition: (stats) => stats.totalTests >= 50 },
        { id: 'epic-typer', name: 'Epic Typer', tier: 'epic', requirement: 'Level 10', condition: (stats, level) => level >= 10 },
        { id: 'ghost-king', name: 'Ghost King', tier: 'legendary', requirement: '120+ Best WPM', condition: (stats) => stats.pbEasy >= 120 || stats.pbMedium >= 120 || stats.pbHard >= 120 },
        { id: 'typing-legend', name: 'Typing Legend', tier: 'legendary', requirement: 'Level 20', condition: (stats, level) => level >= 20 },
    ];

    // ============= User Profile Logic =============
    const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐨', '🐸', '🐙', '🦖', '🦄', '👻', '🤖', '👽', '👾', '🎮', '💡', '🔥', '✨'];

    const UserProfile = {
        saveAvatar: function (icon) {
            localStorage.setItem('userAvatar', icon);
            this.updateUI();
            showToast('Avatar updated!');
        },

        getAvatar: function () {
            return localStorage.getItem('userAvatar') || '👤';
        },

        getEquippedTitle: function () {
            const titleId = localStorage.getItem('equippedTitle');
            return TITLES.find(t => t.id === titleId) || null;
        },

        unlockTitles: function () {
            const stats = this.calculateStats();
            if (!stats) return;

            const currentLevel = parseInt(levelDisplay.innerText) || 1;
            let newlyUnlocked = false;

            TITLES.forEach(title => {
                const isUnlocked = localStorage.getItem(`title-${title.id}`) === 'true';
                if (!isUnlocked && title.condition(stats, currentLevel)) {
                    localStorage.setItem(`title-${title.id}`, 'true');
                    newlyUnlocked = true;
                    showToast(`New Title Unlocked: ${title.name}!`);
                }
            });

            if (newlyUnlocked) this.updateUI();
        },

        calculateStats: function () {
            const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
            if (history.length === 0) return null;

            const totalTests = history.length;
            const totalSeconds = history.reduce((sum, r) => sum + r.time, 0);
            const avgWPM = Math.round(history.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
            const avgAcc = Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / totalTests);

            // Personal Bests
            const getPB = (diff) => {
                const diffResults = history.filter(r => r.difficulty.toLowerCase() === diff.toLowerCase());
                if (diffResults.length === 0) return 0;
                return Math.max(...diffResults.map(r => r.wpm));
            };

            return {
                totalTests,
                totalTime: this.formatTime(totalSeconds),
                avgWPM,
                avgAcc,
                pbEasy: getPB('easy'),
                pbMedium: getPB('medium'),
                pbHard: getPB('hard')
            };
        },

        formatTime: function (seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m}m ${seconds % 60}s`;
        },

        updateUI: function () {
            const stats = this.calculateStats();

            // Level & XP (Sync with top bar)
            const currentXP = parseInt(localStorage.getItem('totalXP')) || 0;
            const level = Math.floor(currentXP / 1000) + 1;
            const xpInCurrentLevel = currentXP % 1000;
            const xpPercentage = (xpInCurrentLevel / 1000) * 100;

            document.getElementById('profile-level-tag').innerText = `Level ${level}`;
            document.getElementById('profile-xp-tag').innerText = `${xpInCurrentLevel} / 1000 XP`;
            document.getElementById('profile-xp-bar-inner').style.width = xpPercentage + '%';

            // Avatar updates
            const userAvatar = this.getAvatar();
            document.querySelectorAll('.profile-avatar').forEach(el => el.innerText = userAvatar);
            if (profileBtn) profileBtn.innerText = userAvatar;

            if (!stats) return;

            document.getElementById('profile-total-tests').innerText = stats.totalTests;
            document.getElementById('profile-total-time').innerText = stats.totalTime;
            document.getElementById('profile-avg-wpm').innerText = stats.avgWPM;
            document.getElementById('profile-avg-acc').innerText = stats.avgAcc + '%';

            document.getElementById('pb-easy').innerText = stats.pbEasy + ' WPM';
            document.getElementById('pb-medium').innerText = stats.pbMedium + ' WPM';
            document.getElementById('pb-hard').innerText = stats.pbHard + ' WPM';

            // Update Title Displays
            const equipped = this.getEquippedTitle();
            const navTitle = document.getElementById('nav-title-display');
            const profileTitle = document.getElementById('profile-title-display');

            if (equipped) {
                navTitle.innerText = equipped.name;
                navTitle.className = `title-tag tier-${equipped.tier}`;
                navTitle.classList.remove('hidden-section');

                profileTitle.innerText = equipped.name;
                profileTitle.className = `profile-title-tag tier-${equipped.tier}`;
                profileTitle.classList.remove('hidden-section');
            } else {
                navTitle.classList.add('hidden-section');
                profileTitle.classList.add('hidden-section');
            }

            // Prestige Effects
            document.querySelectorAll('.profile-avatar').forEach(avatar => {
                if (level >= 10) avatar.classList.add('prestige-glow');
                else avatar.classList.remove('prestige-glow');
            });

            // Update Selection Grid
            const grid = document.getElementById('titles-selection-grid');
            if (grid) {
                grid.innerHTML = '';
                TITLES.forEach(title => {
                    const isUnlocked = localStorage.getItem(`title-${title.id}`) === 'true';
                    const isEquipped = equipped && equipped.id === title.id;

                    const div = document.createElement('div');
                    div.className = `title-item ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''} tier-${title.tier}`;
                    div.innerHTML = `
                        <span class="title-name">${title.name}</span>
                        <span class="title-requirement">${isUnlocked ? 'Unlocked' : title.requirement}</span>
                    `;

                    if (isUnlocked && !isEquipped) {
                        div.addEventListener('click', () => {
                            localStorage.setItem('equippedTitle', title.id);
                            this.updateUI();
                            showToast(`Title Equipped: ${title.name}`);
                        });
                    } else if (isEquipped) {
                        div.addEventListener('click', () => {
                            localStorage.removeItem('equippedTitle');
                            this.updateUI();
                        });
                    }

                    grid.appendChild(div);
                });
            }
        }
    };

    // ============= Dynamic Content Fetching =============
    async function fetchDynamicQuote() {
        paragraphBox.innerHTML = '<div class="loading-spinner">✨ Fetching a fresh quote...</div>';
        try {
            // Using a reliable public quote API
            const response = await fetch('https://api.quotable.io/random', { signal: AbortSignal.timeout(5000) });
            if (!response.ok) throw new Error('Network response not ok');
            const data = await response.json();
            return `${data.content} — ${data.author}`;
        } catch (error) {
            console.warn("Failed to fetch from primary API, trying fallback...", error);
            try {
                // Secondary fallback API
                const response = await fetch('https://dummyjson.com/quotes/random');
                const data = await response.json();
                return `${data.quote} — ${data.author}`;
            } catch (e) {
                console.error("All quote APIs failed:", e);
                return "The best way to predict the future is to create it. Live the life you have imagined. — Fallback Quote";
            }
        }
    }

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

    function showVignette(type) {
        const vignette = document.createElement('div');
        vignette.className = `vignette vignette-${type}`;
        document.body.appendChild(vignette);
        setTimeout(() => vignette.classList.add('fade-out'), 50);
        setTimeout(() => vignette.remove(), 1000);
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

    // ============= WPM Chart =============
    function renderWPMChart() {
        const canvas = document.getElementById('wpm-chart');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('result-chart-container');

        if (velocityHistory.length < 2) {
            container.classList.add('hidden-section');
            return;
        }

        container.classList.remove('hidden-section');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        const dataPoints = velocityHistory.map(h => h.wpm);
        const maxWpm = Math.max(...dataPoints, 60);
        const minWpm = Math.min(...dataPoints, 0);
        const range = maxWpm - minWpm;

        const padding = 20;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        dataPoints.forEach((wpm, i) => {
            const x = padding + (i / (dataPoints.length - 1)) * chartWidth;
            const y = height - (padding + ((wpm - minWpm) / range) * chartHeight);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw Area
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');
        ctx.lineTo(padding + chartWidth, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw points
        ctx.fillStyle = '#818cf8';
        dataPoints.forEach((wpm, i) => {
            if (i % Math.ceil(dataPoints.length / 10) === 0 || i === dataPoints.length - 1) {
                const x = padding + (i / (dataPoints.length - 1)) * chartWidth;
                const y = height - (padding + ((wpm - minWpm) / range) * chartHeight);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
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

    // ============= Leveling & XP System =============
    const XP_PER_LEVEL = 1000;

    function calculateXP(result) {
        // XP = (WPM * Accuracy) / 10 + bonus for difficulty
        const difficultyBonus = { 'easy': 1, 'medium': 1.5, 'hard': 2 };
        const baseXP = (result.wpm * result.accuracy) / 10;
        return Math.round(baseXP * (difficultyBonus[result.difficulty.toLowerCase()] || 1));
    }

    function updateLevelingSystem(newXP = 0) {
        let currentXP = parseInt(localStorage.getItem('totalXP')) || 0;
        currentXP += newXP;
        localStorage.setItem('totalXP', currentXP);

        const level = Math.floor(currentXP / XP_PER_LEVEL) + 1;
        const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
        const xpPercentage = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

        levelDisplay.innerText = level;
        xpBarInner.style.width = xpPercentage + '%';

        if (newXP > 0) {
            console.log(`Gained ${newXP} XP! Total XP: ${currentXP}`);
            // Trigger burst on level up or major XP gain
            if (xpInCurrentLevel < newXP) {
                Visuals.triggerBurst();
            }
        }
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
            } else if (language === 'dynamic') {
                console.log("Fetching dynamic quote...");
                textToUse = await fetchDynamicQuote();
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

            if (zenToggle.checked) {
                document.body.classList.add('zen-mode-active');
            } else {
                document.body.classList.remove('zen-mode-active');
            }

            // Ghost Mode Init
            const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
            const relevantPRs = history.filter(r => r.difficulty === difficulty && r.language === language);

            if (relevantPRs.length > 0) {
                currentPR = relevantPRs.sort((a, b) => b.wpm - a.wpm)[0];
                // WPM * 5 chars per word / 60 seconds = Chars per second
                ghostPace = (currentPR.wpm * 5) / 60;
                ghostIndex = 0;
            } else {
                currentPR = null;
                ghostPace = 0;
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
        document.getElementById('result-chart-container').classList.add('hidden-section');
        startBttn.innerText = 'Restart';
        keyboardHeatmapContainer.classList.add('heatmap-hidden');
        coachTips.classList.add('hidden-section');
        Visuals.reset();
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

                // Update Ghost
                if (ghostPace > 0 && isTestActive) {
                    ghostIndex = Math.min(Math.floor(ghostPace * secondsPassed), paragraphBox.querySelectorAll('span').length - 1);
                    updateGhostUI();
                }
            }, 1000);
        }
    }

    function updateGhostUI() {
        paragraphBox.querySelectorAll('.ghost-highlight').forEach(s => s.classList.remove('ghost-highlight'));
        const spanArray = paragraphBox.querySelectorAll('span');
        if (spanArray[ghostIndex]) {
            spanArray[ghostIndex].classList.add('ghost-highlight');
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
                    showVignette('error');
                    isTestActive = false;
                    finishTest();
                    return;
                }
            }
        }

        if (inputChars.length > 0) {
            playSound(lastWasCorrect ? 'correct' : 'wrong');
            if (!lastWasCorrect) showVignette('error');
        }

        debouncedHeatmapUpdate();

        clearTimeout(statsUpdateTimeout);
        statsUpdateTimeout = setTimeout(() => {
            if (secondsPassed > 0) {
                const timeInMinutes = secondsPassed / 60;
                const liveCPM = Math.round(inputChars.length / timeInMinutes);
                const liveWPM = Math.round((correctChars / 5) / timeInMinutes);
                cpm_container.innerText = liveCPM;
                wpm_container.innerText = liveWPM;
                velocityDisplay.innerText = liveWPM + ' WPM';
                velocityHistory.push({ time: secondsPassed, wpm: liveWPM });

                // Update 3D Background
                Visuals.updateWPM(liveWPM);

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
        const xpGained = calculateXP(testResult);
        updateLevelingSystem(xpGained);

        updateLeaderboard();
        updateHistory();
        updatePR();
        updateStreak();
        updateAchievements();
        renderWPMChart();
        UserProfile.unlockTitles();
        UserProfile.updateUI();

        // Push to Global Leaderboard if configured
        if (supabase) {
            const bestWPM = history.reduce((max, r) => Math.max(max, r.wpm), 0);
            const currentWPM = testResult.wpm;

            // Logic: Only push if it's a significant score or user is in global view
            if (currentWPM >= 60 || currentWPM >= bestWPM) {
                GlobalLeaderboard.saveScore(currentWPM, testResult.accuracy, testResult.difficulty);
            }
        }

        document.body.classList.remove('zen-mode-active');
        showVignette('success');
    }

    function saveTestResult(result) {
        let history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        history.push(result);
        localStorage.setItem('typingHistory', JSON.stringify(history));
    }

    async function updateLeaderboard() {
        const filter = document.querySelector('.filter-btn.active').dataset.filter;
        const listContainer = document.getElementById('leaderboard-list');

        if (filter === 'global') {
            listContainer.innerHTML = '<div class="loading-spinner">📡 Connecting to Global Server...</div>';

            if (!supabase) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <p>Supabase connection not configured.</p>
                        <p style="font-size: 0.8rem; margin-top: 10px;">Please add your SUPABASE_URL and KEY in script.js</p>
                    </div>`;
                return;
            }

            const globalScores = await GlobalLeaderboard.fetchTopScores();
            renderLeaderboard(globalScores, true);
            return;
        }

        const history = JSON.parse(localStorage.getItem('typingHistory')) || [];
        let filtered = [...history];

        if (filter === 'weekly') {
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(r => (Date.now() - new Date(r.date).getTime()) < oneWeek);
        } else if (filter === 'monthly') {
            const oneMonth = 30 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(r => (Date.now() - new Date(r.date).getTime()) < oneMonth);
        } else if (filter === 'hard') {
            filtered = filtered.filter(r => r.difficulty.toLowerCase() === 'hard');
        }

        filtered.sort((a, b) => b.wpm - a.wpm);
        renderLeaderboard(filtered.slice(0, 10));
    }

    function renderLeaderboard(data, isGlobal = false) {
        const listContainer = document.getElementById('leaderboard-list');
        listContainer.innerHTML = '';

        if (!data || data.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No records found yet.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'leaderboard-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>WPM</th>
                    <th>Acc</th>
                    <th>Diff</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody id="leaderboard-body"></tbody>
        `;
        listContainer.appendChild(table);

        const body = document.getElementById('leaderboard-body');
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
            const date = isGlobal ? new Date(entry.created_at).toLocaleDateString() : new Date(entry.date).toLocaleDateString();

            row.innerHTML = `
                <td><span class="rank-badge ${rankClass}">${rank}</span></td>
                <td><span style="font-size: 1.2rem; margin-right: 8px;">${entry.avatar || '👤'}</span><strong>${entry.username || 'Local Player'}</strong></td>
                <td class="wpm-cell">${entry.wpm}</td>
                <td>${entry.accuracy}%</td>
                <td><span class="diff-tag ${entry.difficulty.toLowerCase()}">${entry.difficulty}</span></td>
                <td style="opacity: 0.6; font-size: 0.8rem;">${date}</td>
            `;
            body.appendChild(row);
        });
    }

    // ============= Username Modal Logic =============
    const usernameModal = document.getElementById('username-modal');
    const usernameInput = document.getElementById('global-username-input');
    const usernameCancel = document.getElementById('username-modal-cancel');
    const usernameSave = document.getElementById('username-modal-save');

    function checkGlobalUsername() {
        const username = localStorage.getItem('globalUsername');
        if (!username) {
            usernameModal.classList.remove('hidden-section');
            return false;
        }
        return true;
    }

    usernameSave.addEventListener('click', () => {
        const value = usernameInput.value.trim();
        if (value.length >= 3 && value.length <= 15) {
            localStorage.setItem('globalUsername', value);
            usernameModal.classList.add('hidden-section');
            showToast(`Welcome, ${value}! 🌎`);
            if (document.querySelector('.filter-btn.active').dataset.filter === 'global') {
                updateLeaderboard();
            }
        } else {
            showToast('Username must be 3-15 characters.');
        }
    });

    usernameCancel.addEventListener('click', () => {
        usernameModal.classList.add('hidden-section');
    });

    // Update Filter Button logic to prompt for username
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.filter === 'global') {
                if (checkGlobalUsername()) {
                    updateLeaderboard();
                }
            } else {
                updateLeaderboard();
            }
        });
    });

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
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            if (activeFilter === 'global') {
                if (checkGlobalUsername()) updateLeaderboard();
            } else {
                updateLeaderboard();
            }
        } else if (section === 'stats') {
            document.getElementById('stats-section').classList.remove('hidden-section');
            updateHistory();
        } else if (section === 'profile') {
            document.getElementById('profile-section').classList.remove('hidden-section');
            UserProfile.updateUI();
        }
    }

    // ============= Event Listeners =============
    startBttn.addEventListener('click', init);
    inputArea.addEventListener('input', check);
    themeToggle.addEventListener('click', toggleTheme);
    profileBtn.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        navigate('profile');
    });
    // ============= Avatar Modal Logic =============
    const avatarModal = document.getElementById('avatar-modal');
    const avatarGrid = document.getElementById('avatar-grid');
    const avatarCancel = document.getElementById('avatar-modal-cancel');
    const profileAvatarClickable = document.getElementById('profile-avatar-clickable');

    function openAvatarModal() {
        avatarGrid.innerHTML = '';
        const currentAvatar = UserProfile.getAvatar();

        AVATARS.forEach(icon => {
            const div = document.createElement('div');
            div.className = `avatar-item ${icon === currentAvatar ? 'selected' : ''}`;
            div.innerText = icon;
            div.addEventListener('click', () => {
                UserProfile.saveAvatar(icon);
                avatarModal.classList.add('hidden-section');
            });
            avatarGrid.appendChild(div);
        });

        avatarModal.classList.remove('hidden-section');
    }

    profileAvatarClickable.addEventListener('click', openAvatarModal);
    avatarCancel.addEventListener('click', () => avatarModal.classList.add('hidden-section'));

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
            else if (targetId === '#profile-section') navigate('profile');
            else if (targetId === '#achievements-section') navigate('achievements');
            else if (targetId === '#leaderboard-section') navigate('leaderboard');
            else if (targetId === '#stats-section') navigate('stats');
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
    updateLevelingSystem(0); // Initialize UI without adding XP
    UserProfile.unlockTitles();
    UserProfile.updateUI();
})();