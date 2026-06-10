# Shikaku Puzzle Game

A mobile-friendly browser-based Shikaku puzzle game, playable on desktop and mobile devices.

## 🎮 Play Online

**[Play the game](https://ambhargava.github.io/shikaku-game/)**

## How to Play

Shikaku (四角) is a Japanese logic puzzle game. The objective is to:

1. **Divide the grid** into rectangular regions
2. **Each rectangle must contain exactly one number**
3. **The number equals the area** of that rectangle

### Example:
- A rectangle containing the number **6** must have an area of 6 (could be 1×6, 2×3, 3×2, or 6×1)
- A rectangle containing the number **4** must have an area of 4 (could be 1×4, 2×2, or 4×1)

## 📱 Features

- ✅ **Fully responsive** - Works perfectly on desktop, tablet, and mobile phones
- ✅ **Mobile-optimized UI** - Touch-friendly buttons and cells
- ✅ **Installable PWA** - Add to home screen on mobile for a native-app feel
- ✅ **Three difficulty levels** - Easy (4×4), Normal (5×5), Hard (6×6)
- ✅ **Game controls**:
  - **New Game** - Start a new puzzle
  - **Undo** - Undo last completed rectangle
  - **Hint** - Get a hint on where to start
  - **Reset** - Clear all progress and start over
- ✅ **Timer & Move Counter** - Track your performance
- ✅ **Win animation** - Celebration when you complete the puzzle
- ✅ **Hosted on GitHub Pages** - No server needed, always free

## 🎮 Controls

### Desktop
- **Click** a cell to select it
- **Click adjacent cells** to expand your selection
- **Press Enter** or wait briefly to complete a rectangle

### Mobile
- **Tap** cells to select/deselect them
- **Tap cells to form a rectangle** around a number
- The rectangle will be completed when valid

## 🚀 Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ambhargava/shikaku-game.git
   cd shikaku-game
   ```

2. Open `index.html` in your browser, or serve with a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 📁 File Structure

```
shikaku-game/
├── index.html       # HTML structure
├── styles.css       # Responsive styling
├── game.js          # Game logic and UI
├── manifest.json    # PWA configuration
└── README.md        # This file
```

## 🔧 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Responsive design with flexbox/grid
- **JavaScript (Vanilla)** - Pure game logic, no dependencies
- **Progressive Web App** - Works offline, installable

## 💡 Tips for Winning

1. Look for cells with small numbers first (easier to figure out)
2. Numbers can only belong to one rectangle
3. Rectangles can't overlap or leave gaps
4. Think about aspect ratios: a 6 could be 1×6, 2×3, or 3×2
5. Use the constraint that every cell must be in exactly one rectangle

## 🐛 Known Issues

- Puzzles are randomly generated (some might be harder than others)
- Mobile: Disable zoom for better gameplay experience

## 📝 License

Open source - feel free to fork and modify!

## 🎯 Future Improvements

- [ ] Custom difficulty levels
- [ ] Leaderboard/High scores
- [ ] Daily challenge puzzles
- [ ] Puzzle generator improvements
- [ ] Sound effects and haptic feedback
- [ ] Multiple themes
- [ ] Puzzles with solutions

---

**Enjoy the game! 🎮**
