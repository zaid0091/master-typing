import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { tests, leaderboard } from '../services/api';
import { textCollections } from '../data/texts';
import confetti from 'canvas-confetti';

function WPMChart({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.offsetWidth;
    const height = 150;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    const points = data.map(h => h.wpm);
    const maxW = Math.max(...points, 60);
    const minW = Math.min(...points, 0);
    const range = maxW - minW || 1;
    const pad = 20;
    const cw = width - pad * 2;
    const ch = height - pad * 2;
    ctx.beginPath();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    points.forEach((w, i) => {
      const x = pad + (i / (points.length - 1)) * cw;
      const y = height - (pad + ((w - minW) / range) * ch);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(129,140,248,0.3)');
    grad.addColorStop(1, 'rgba(129,140,248,0)');
    ctx.lineTo(pad + cw, height - pad);
    ctx.lineTo(pad, height - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 150 }} />;
}

export default function TestSection() {
  const { showToast, refreshUser, user } = useApp();
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState('60');
  const [language, setLanguage] = useState('english');
  const [mode, setMode] = useState('normal');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [testText, setTestText] = useState('');
  const [charStates, setCharStates] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [secondsPassed, setSecondsPassed] = useState(0);
  const [testDur, setTestDur] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [velHistory, setVelHistory] = useState([]);
  const [keyPressCount, setKeyPressCount] = useState({});
  const [battleActive, setBattleActive] = useState(false);
  const [bossHP, setBossHP] = useState(100);
  const [bossMaxHP, setBossMaxHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const paragraphRef = useRef(null);
  const audioRef = useRef(null);
  const lastSoundRef = useRef(0);
  const secsRef = useRef(0);
  const durRef = useRef(null);
  const activeRef = useRef(false);
  const textRef = useRef('');
  const finishedRef = useRef(false);

  useEffect(() => { activeRef.current = isActive; }, [isActive]);
  useEffect(() => { durRef.current = testDur; }, [testDur]);
  useEffect(() => { textRef.current = testText; }, [testText]);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    if (Date.now() - lastSoundRef.current < 50) return;
    lastSoundRef.current = Date.now();
    if (!audioRef.current) {
      try { audioRef.current = new AudioContext(); } catch { return; }
    }
    const ctx = audioRef.current;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime;
      const d = type === 'correct' ? 0.04 : 0.06;
      osc.frequency.value = type === 'correct' ? 900 : 200;
      gain.gain.setValueAtTime(type === 'correct' ? 0.03 : 0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);
      osc.start(t);
      osc.stop(t + d);
    } catch {}
  }, [soundEnabled]);

  const doFinish = useCallback(async (isLoss = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIsActive(false);
    activeRef.current = false;
    setIsFinished(true);
    document.body.classList.remove('zen-mode-active');

    if (isLoss) {
      showToast('Test failed!', false);
      return;
    }

    const end = Date.now() + 3000;
    const iv = setInterval(() => {
      if (Date.now() > end) return clearInterval(iv);
      const c = 50 * ((end - Date.now()) / 3000);
      confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, particleCount: c, origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 } });
      confetti({ startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, particleCount: c, origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 } });
    }, 250);

    const txt = textRef.current;
    const inp = inputRef.current?.value || '';
    let correct = 0, wrong = 0;
    for (let i = 0; i < txt.length; i++) {
      if (inp[i] === txt[i]) correct++;
      else if (inp[i] !== undefined) wrong++;
    }
    const acc = Math.round((correct / txt.length) * 100);
    const timeMin = Math.max(secsRef.current, 1) / 60;
    const w = Math.round((correct / 5) / timeMin);
    const c2 = Math.round(correct / timeMin);
    setWpm(w);
    setCpm(c2);
    setAccuracy(acc);
    setErrors(wrong);

      try {
        if (!user) {
          showToast(`WPM: ${w} | Accuracy: ${acc}%`);
          return;
        }
        const res = await tests.submit({
        wpm: w, cpm: c2, accuracy: acc, errors: wrong,
        time: secsRef.current, difficulty, language, mode,
      });
      if (res) {
        showToast(`+${res.xp_gained} XP, +${res.bits_earned} Bits!`);
        refreshUser();
        if (w >= 60) {
          try { await leaderboard.submitScore({ wpm: w, accuracy: acc, difficulty }); } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [difficulty, language, mode, showToast, refreshUser]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      secsRef.current += 1;
      setSecondsPassed(secsRef.current);
      if (durRef.current && secsRef.current >= durRef.current) doFinish();
    }, 1000);
  }, [doFinish]);

  const handleInput = useCallback((e) => {
    if (!activeRef.current) return;
    const val = e.target.value;
    setInputValue(val);
    const chars = textRef.current.split('');
    const ic = val.split('');

    if (ic.length > 0 && !timerRef.current) startTimer();

    let correct = 0, wrong = 0;
    const ns = chars.map((ch, i) => {
      if (ic[i] === undefined) return 'pending';
      if (ic[i] === ch) { correct++; return 'correct'; }
      wrong++;
      return 'wrong';
    });
    setCharStates(ns);
    setErrors(wrong);

    if (secsRef.current > 0) {
      const tm = secsRef.current / 60;
      setWpm(Math.round((correct / 5) / tm));
      setCpm(Math.round(ic.length / tm));
      setAccuracy(ic.length > 0 ? Math.round((correct / ic.length) * 100) : 0);
      setVelHistory(p => [...p, { time: secsRef.current, wpm: Math.round((correct / 5) / tm) }]);
    }

      if (ic.length > 0) {
        const k = ic[ic.length - 1].toLowerCase();
        setKeyPressCount(p => ({ ...p, [k]: (p[k] || 0) + 1 }));
        const lastCharState = ns[ic.length - 1];
        playSound(lastCharState === 'correct' ? 'correct' : 'wrong');

        if (mode === 'battle') {
          if (lastCharState === 'correct') {
            setBossHP(prev => Math.max(0, prev - 1));
          } else if (lastCharState === 'wrong') {
            setPlayerHP(prev => {
              const next = Math.max(0, prev - 5);
              if (next <= 0) doFinish(true);
              return next;
            });
          }
        }
      }

      if (mode === 'no-error' && wrong > 0) { doFinish(true); return; }
    if (ic.length === chars.length) doFinish();
  }, [mode, playSound, startTimer, doFinish]);

  const startTest = async () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    secsRef.current = 0;
    finishedRef.current = false;
    setSecondsPassed(0);
    setInputValue('');
    setWpm(0);
    setCpm(0);
    setAccuracy(0);
    setErrors(0);
    setIsFinished(false);
    setVelHistory([]);
    setKeyPressCount({});
    setPlayerHP(100);
    setBossHP(100);

    let d = mode === 'gauntlet' ? 10 : (duration === 'unlimited' ? null : parseInt(duration));
    setTestDur(d);
    durRef.current = d;

    let text = '';
    if (mode === 'custom') {
      if (!customText.trim()) { showToast('Enter custom text first', false); return; }
      text = customText;
    } else if (language === 'dynamic') {
      try {
        const r = await fetch('https://dummyjson.com/quotes/random');
        const j = await r.json();
        text = `${j.quote} — ${j.author}`;
      } catch {
        text = 'The best way to predict the future is to create it.';
      }
    } else {
      const s = textCollections[difficulty]?.[language];
      if (!s) { showToast('No text for this combo', false); return; }
      text = s[Math.floor(Math.random() * s.length)];
    }

    setTestText(text);
    textRef.current = text;
    setCharStates(text.split('').map(() => 'pending'));

    const isBattle = mode === 'battle';
    setBattleActive(isBattle);
    if (isBattle) { setBossMaxHP(text.length); setBossHP(text.length); }

    setIsCountdown(true);
    for (let i = 3; i >= 0; i--) {
      setCountdownNum(i === 0 ? 'GO!' : i);
      await new Promise(r => setTimeout(r, 1000));
    }
    setIsCountdown(false);

    setIsActive(true);
    activeRef.current = true;
    if (zenMode) document.body.classList.add('zen-mode-active');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const timeLeft = testDur ? Math.max(0, testDur - secondsPassed) : null;
  const maxKey = Math.max(...Object.values(keyPressCount), 1);

  return (
    <section className="active-section">
      <div className="settings-panel glass-panel">
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={duration} onChange={e => setDuration(e.target.value)}>
          <option value="15">15s</option>
          <option value="30">30s</option>
          <option value="60">60s</option>
          <option value="unlimited">Unlimited</option>
        </select>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="english">English</option>
          <option value="motivational">Motivational</option>
          <option value="technical">Technical Code</option>
          <option value="dynamic">Dynamic Quotes</option>
        </select>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="normal">Normal</option>
          <option value="no-error">No Error Mode</option>
          <option value="battle">Battle Mode (RPG)</option>
          <option value="gauntlet">Gauntlet Mode (Survival)</option>
          <option value="custom">Custom Text</option>
        </select>
        <div className="sound-toggle-container">
          <label className="switch">
            <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span>Sound</span>
        </div>
        <div className="zen-toggle-container">
          <label className="switch">
            <input type="checkbox" checked={zenMode} onChange={e => setZenMode(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span>Zen Mode</span>
        </div>
      </div>

      {mode === 'custom' && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <textarea
            placeholder="Paste custom text here..."
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            style={{ width: '100%', minHeight: 80, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: 8, padding: '0.5rem', resize: 'vertical' }}
          />
        </div>
      )}

      {isCountdown && (
        <div className="countdown-container">
          <div className="countdown-number">{countdownNum}</div>
          <div className="countdown-text">Get Ready!</div>
        </div>
      )}

      {battleActive && isActive && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div className="boss-area">
            <div className="boss-sprite">{bossHP <= 0 ? '💀' : '👹'}</div>
            <div className="boss-info">
              <div className="boss-name">The Typo King</div>
              <div className="hp-bar-outer boss-hp">
                <div className="hp-bar-inner danger" style={{ width: (bossHP / bossMaxHP * 100) + '%' }}></div>
              </div>
            </div>
          </div>
          <div className="battle-stats">
            <div className="player-hp-container">
              <div className="label">Your Health</div>
              <div className="hp-bar-outer player-hp">
                <div className="hp-bar-inner success" style={{ width: playerHP + '%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" id="stats-container">
        <div className="stat-card"><span className="label">Time</span><div>{secondsPassed}</div></div>
        <div className="stat-card"><span className="label">WPM</span><div>{wpm}</div></div>
        <div className="stat-card"><span className="label">CPM</span><div>{cpm}</div></div>
        <div className="stat-card"><span className="label">Accuracy</span><div>{accuracy}%</div></div>
        <div className="stat-card"><span className="label">Errors</span><div>{errors}</div></div>
      </div>

      <div id="main-container">
        {timeLeft !== null && isActive && (
          <div className={`timer-display ${timeLeft <= 5 ? 'gauntlet-warning' : ''}`} style={{ display: 'block' }}>{timeLeft}</div>
        )}
        {isActive && <div className="velocity-display">{wpm} WPM</div>}
        <div id="paragraph-box" ref={paragraphRef}>
          {testText
            ? testText.split('').map((char, i) => (
                <span
                  key={i}
                  className={[
                    charStates[i] === 'correct' ? 'correct' : charStates[i] === 'wrong' ? 'wrong' : '',
                    i === inputValue.length && isActive ? 'cursor-highlight' : '',
                  ].join(' ')}
                >
                  {char}
                </span>
              ))
            : "Click 'Start' to test your speed!"}
        </div>
        <input
          type="text"
          id="input-field"
          ref={inputRef}
          value={inputValue}
          onChange={handleInput}
          disabled={!isActive}
          onKeyDown={e => { if (e.key === 'Enter' && !isActive && !isCountdown) startTest(); }}
        />
      </div>

      {isFinished && velHistory.length >= 2 && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3>Speed Trends</h3>
          <WPMChart data={velHistory} />
        </div>
      )}

      <button id="start-bttn" onClick={startTest} disabled={isCountdown}>
        {isFinished ? 'Try Again' : isActive ? 'Restart' : 'Start Test'}
      </button>

      {(isActive || isFinished) && Object.keys(keyPressCount).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Keyboard Heatmap</h3>
          <div className="heatmap-grid">
            {'qwertyuiopasdfghjklzxcvbnm'.split('').map(k => (
              <div key={k} className="heatmap-key" style={{ backgroundColor: `rgba(122,162,247,${(keyPressCount[k] || 0) / maxKey})` }}>{k}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
