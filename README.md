# 🎮 Lixso - Logic Puzzle Game

[![Run Tests](https://github.com/kluth/lexsio/actions/workflows/test.yml/badge.svg)](https://github.com/kluth/lexsio/actions/workflows/test.yml)
[![CI/CD Pipeline](https://github.com/kluth/lexsio/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/kluth/lexsio/actions/workflows/ci-cd.yml)
[![Angular](https://img.shields.io/badge/Angular-20+-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern implementation of **Lixso**, the Belgian logic puzzle game, built with Angular. Fill the grid with L-shaped tiles without letting the same colors touch!

## 🎯 What is Lixso?

Lixso is a logic puzzle game that combines elements of Sudoku with spatial reasoning. Players must:
- Fill a grid with L-shaped tiles (each covering 3 cells)
- Use 4 different symbols/colors: **I** (Yellow), **X** (Red), **S** (Green), **O** (Blue)
- Ensure tiles with the same symbol never touch (sides or corners)
- Complete the entire grid with one unique solution

## ✨ Features

### 🎲 Core Gameplay
- **Multiple Grid Sizes**: 6x6, 9x9, and 12x12 grids
- **6 Difficulty Levels**: From beginner to expert
- **Dynamic Puzzle Generator**: Generates puzzles with unique solutions using backtracking algorithm
- **Smart Collision Detection**: Validates tile placements in real-time
- **Hint System**: Get suggestions when you're stuck
- **Undo/Reset**: Experiment without fear

### 🎮 Game Modes (7 Modes!)
1. **🎯 Classic**: Standard puzzle solving - take your time and enjoy
2. **⏱️ Time Trial**: Race against the clock (5 minutes)
3. **🎲 Limited Moves**: Complete with only 30 tile placements
4. **📈 Progressive**: Start easy, progress through harder puzzles
5. **🧘 Zen Mode**: Relaxing puzzle without pressure or timer
6. **💎 Perfect Puzzle**: No mistakes allowed - one error and restart
7. **🚀 Speed Run**: Solve as many puzzles as possible in 10 minutes

### 🏆 Progression System
- **Highscores**: Track your best scores per mode and difficulty
- **Achievements**: Unlock 8 different achievements
  - 🎊 First Victory
  - ⚡ Speed Demon (< 2 minutes)
  - ✨ Perfectionist (no errors)
  - 🏃 Marathon Runner (60 min continuous play)
  - 🏆 Master Solver (50 puzzles)
  - 👑 Grandmaster (Level 6 in Perfect mode)
  - 🥇 Multiplayer Champion (10 wins)
  - 🔥 Streak Master (5 wins in a row)
- **Player Profile**: Track total games, wins, and scores
- **Tournament System**: Compete in timed tournaments

### 📱 UI/UX
- **Mobile-First Design**: Optimized for smartphones, tablets, and desktops
- **Responsive Layout**: Adapts to any screen size
- **Touch-Optimized Controls**: Smooth touch interactions
- **Visual Feedback**: Animated transitions and hover previews
- **Color-Coded Tiles**: Clear visual distinction between symbols
- **Accessibility**: Symbols included for colorblind players

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/kluth/lexsio.git
cd lexsio

# Install dependencies
npm install

# Start development server
npm start
```

Open your browser and navigate to `http://localhost:4200/`

## 🛠️ Development

### Available Scripts

```bash
# Development server with live reload
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Run tests with coverage
npm run test -- --code-coverage

# Run linter
npm run lint

# Build for GitHub Pages
npm run build -- --base-href /lexsio/
```

### Project Structure

```
src/app/
├── components/
│   ├── game-board/          # Main game component with grid and controls
│   ├── game-menu/           # Menu with game mode selection
│   └── l-tile/              # L-shaped tile component
├── models/
│   ├── game.models.ts       # Core game data models
│   └── game-modes.models.ts # Game modes and scoring models
├── services/
│   ├── game.ts              # Core game logic and rules engine
│   ├── puzzle-generator.ts  # Dynamic puzzle generation algorithm
│   └── score.ts             # Highscore and achievement system
└── data/
    └── puzzles.ts           # Predefined puzzle collection
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test -- --code-coverage

# Run tests in headless mode (CI)
npm run test -- --no-watch --no-progress --browsers=ChromeHeadless
```

### Test Coverage
- **Game Service**: 75+ test cases covering tile placement, collision detection, and game completion
- **Score Service**: 60+ test cases for scoring, achievements, and tournaments
- **Puzzle Generator**: 30+ test cases for puzzle generation and validation
- **Total**: 165+ test cases

## 🔄 CI/CD

The project uses GitHub Actions for automated testing and deployment:

### Test Pipeline (`test.yml`)
- ✅ Runs on every push to any branch
- ✅ Tests on Node.js 20.x and 22.x
- ✅ Generates code coverage reports
- ✅ Uploads coverage to Codecov

### Deployment Pipeline (`ci-cd.yml`)
- ✅ Builds and tests the application
- ✅ Deploys to GitHub Pages automatically
- ✅ Supports multiple branches

## 🎨 Game Rules

### Basic Rules
1. The grid must be completely filled with L-shaped tiles
2. Each L-tile covers exactly 3 cells
3. There are 4 symbols (I, X, S, O) with corresponding colors
4. Tiles with the same symbol cannot touch each other (including diagonally)
5. Pre-filled cells are hints and cannot be changed

### L-Tile Orientations
Each L-tile can be rotated into 4 orientations:
- ⌐ Up-Right
- ┐ Down-Right
- ┌ Down-Left
- └ Up-Left

### Scoring
Your score is calculated based on:
- ⏱️ **Time Efficiency**: Faster completion = higher score
- 🎯 **Move Efficiency**: Fewer moves = better score
- ❌ **Errors**: Penalties for mistakes
- 💡 **Hints Used**: Penalties for using hints
- 📊 **Difficulty Multiplier**: Higher levels = more points
- 🎮 **Mode Multiplier**: Different modes have different multipliers

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Write tests first (TDD approach)
4. Implement your feature
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

## 📝 Roadmap

### Upcoming Features
- [ ] Web-AI powered hint system
- [ ] AI-based puzzle difficulty analyzer
- [ ] Real-time multiplayer via WebSocket
- [ ] Global leaderboards
- [ ] Daily challenges
- [ ] Puzzle sharing functionality
- [ ] PWA support for offline play
- [ ] Social features (friends, challenges)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the original **Lixso** game from Belgium
- Based on the Four Color Theorem
- Built with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8

## 📧 Contact

Project Link: [https://github.com/kluth/lexsio](https://github.com/kluth/lexsio)

---

**Made with ❤️ and Angular**
