# ⌨️ Typing Master

A modern, feature-rich typing speed test application with beautiful UI, achievements system, and comprehensive statistics tracking.

![Typing Master](logo.png)

## ✨ Features

### 🎯 Core Functionality
- **Real-time WPM & CPM tracking** - Monitor your typing speed as you type
- **Accuracy measurement** - Track your typing precision
- **Multiple difficulty levels** - Easy, Medium, and Hard
- **Flexible test durations** - 15s, 30s, 60s, or Unlimited
- **Live velocity display** - See your current typing speed in real-time

### 🎨 Content Variety
- **Multiple text types**:
  - English - Standard typing practice
  - Motivational - Inspirational quotes
  - Technical Code - Programming-related content
- **Custom text mode** - Practice with your own text

### 🎮 Special Modes
- **Normal Mode** - Standard typing test
- **No Error Mode** - Test ends on first mistake (hardcore!)
- **Blind Mode** - Text reveals as you type correctly
- **Custom Text** - Use your own practice material

### 🏆 Achievements & Gamification
- **6 Unlockable Badges**:
  - 🌱 Getting Started - Complete your first test
  - ⚡ Speed Demon - Reach 100+ WPM
  - 🚀 Speedster - Reach 120+ WPM
  - 🎯 Perfect - Achieve 99%+ accuracy
  - 🏃 Marathon - Complete a 2-minute test
  - 📊 Consistent - Maintain 95%+ accuracy 3 times

### 📊 Statistics & Tracking
- **Comprehensive History** - All your test results saved locally
- **Personal Records** - Track your best WPM
- **Daily Streaks** - Maintain your practice consistency
- **Local Leaderboard** - Compare your best performances
- **Export to CSV** - Download your typing history

### 🎨 User Experience
- **Dark/Light Theme** - Toggle between themes
- **Keyboard Heatmap** - Visualize your most-used keys
- **Live Coach Tips** - Get real-time improvement suggestions
- **Sound Effects** - Optional audio feedback (can be toggled)
- **Smooth Animations** - Polished UI with fireworks on completion
- **3D Background** - Dynamic Three.js visual effects
- **Responsive Design** - Works on desktop and mobile

### ⌨️ Keyboard Layouts
- QWERTY (default)
- Dvorak
- Colemak

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build process required!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaid0091/typing-master.git
   cd typing-master
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server (recommended):
   
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

3. **Start typing!**
   - Navigate to `http://localhost:8000` (if using local server)
   - Or just double-click `index.html`

## 📖 Usage

1. **Configure Your Test**
   - Select difficulty level (Easy/Medium/Hard)
   - Choose duration (15s/30s/60s/Unlimited)
   - Pick text type (English/Motivational/Technical)
   - Select mode (Normal/No Error/Blind/Custom)

2. **Start Typing**
   - Click "Start Test" button
   - Wait for the 3-2-1 countdown
   - Type the displayed text as accurately and quickly as possible

3. **View Results**
   - See your WPM, CPM, accuracy, and errors
   - Check if you unlocked any achievements
   - Review your performance in the History section

4. **Track Progress**
   - Navigate to **Achievements** to see unlocked badges
   - Check **Leaderboard** for your top scores
   - View **History** for detailed test records
   - Export your data for external analysis

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, gradients, and animations
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Three.js** - 3D background effects
- **Lenis** - Smooth scrolling
- **Canvas Confetti** - Celebration animations
- **LocalStorage API** - Client-side data persistence

## 📁 Project Structure

```
typing-master/
├── index.html          # Main HTML structure
├── style.css           # All styles and themes
├── script.js           # Core typing test logic
├── visuals.js          # 3D background effects
├── logo.png            # Application logo
└── README.md           # This file
```

## 🎨 Features in Detail

### Theme System
Toggle between dark and light themes with a single click. Themes are persisted across sessions.

### Achievement System
Achievements are tracked in localStorage and unlock based on your performance:
- Speed-based achievements (100+ WPM, 120+ WPM)
- Accuracy achievements (99%+ accuracy)
- Endurance achievements (2-minute tests)
- Consistency tracking

### Data Persistence
All your data is stored locally in your browser:
- Test history
- Achievement progress
- Personal records
- Daily streaks
- Theme preference

### Keyboard Heatmap
Visual representation of your most frequently pressed keys, helping you identify patterns in your typing.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Font: [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- Icons: Emoji characters
- 3D Effects: [Three.js](https://threejs.org/)
- Smooth Scroll: [Lenis](https://github.com/studio-freight/lenis)
- Confetti: [canvas-confetti](https://github.com/catdad/canvas-confetti)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Happy Typing! ⌨️✨**
