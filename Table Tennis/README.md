# Table Tennis Web Game

A browser-based table tennis game featuring both multiplayer and AI-powered single-player modes with adjustable difficulty levels.

## Features

- **2-Player Mode**: Play against another person on the same keyboard
- **Single-Player Mode**: Challenge the AI opponent at three difficulty levels
- **Difficulty Levels**: Adjust game difficulty for each player independently
  - **Easy**: Larger paddle, slower ball
  - **Medium**: Standard gameplay
  - **Hard**: Smaller paddle, faster ball
- **AI Opponents**: Smart AI with three difficulty levels
  - **Easy**: Simple reactions, slower movement
  - **Medium**: Predictive ball tracking
  - **Hard**: Advanced prediction, aggressive positioning
- **Realistic Physics**: Ball bounces realistically off paddles and walls
- **Score Tracking**: First to 11 points wins (win by 2 in case of tie)
- **Responsive Design**: Works on desktop and tablet devices

## How to Play

### Running the Game

1. Open `index.html` in your web browser
2. You can also run it via a local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (with http-server installed)
   http-server
   ```
   Then navigate to `http://localhost:8000`

### Game Controls

**Player 1 (Top Paddle)**
- `Arrow Keys Left/Right` or `A/D` - Move paddle left/right
- `Space` - Pause/Resume game
- `R` - Reset/Start new game
- `Esc` - Return to main menu

**Player 2 (Bottom Paddle)** - 2-Player Mode Only
- `Arrow Keys Up/Down` or `W/S` - Move paddle left/right
  - Note: In 2-player mode, Player 2 uses arrow up/down instead of left/right

### Game Modes

#### 2-Player Mode
1. Select "2 Player Mode" from main menu
2. Choose difficulty for Player 1
3. Choose difficulty for Player 2
4. First player to 11 points wins
5. Ball is served from center, alternating between players each point

#### Single-Player Mode
1. Select "Single Player (vs AI)" from main menu
2. Choose your difficulty level
3. Choose AI opponent difficulty
4. Play against the computer to 11 points
5. AI player has three intelligence levels with different strategies

### Difficulty System

**Player Difficulties (Affect Gameplay)**
- **Easy**: 1.5x larger paddle, slower ball (0.8x speed)
- **Medium**: Standard paddle and ball speed
- **Hard**: 0.7x smaller paddle, faster ball (1.2x speed)

**AI Difficulties**
- **Easy**: Limited ball prediction, slow reactions (200-500ms delay)
- **Medium**: ~1 second ball prediction, moderate reactions (80-150ms delay)
- **Hard**: ~2 second ball prediction, fast reactions (30-80ms delay), aggressive positioning

## Game Rules

- First player/AI to score 11 points wins
- Must win by 2 points (e.g., 11-9, 12-10, etc.)
- Ball is served from center of table
- Hit the ball with your paddle to return it to opponent's side
- If ball goes past your paddle, opponent scores a point
- Paddles cannot cross the center line into opponent's side
- Ball speeds up slightly with each paddle hit (up to a maximum)

## Technical Details

### Technology Stack
- **HTML5** - Game structure
- **CSS3** - Styling and responsive layout
- **Vanilla JavaScript** - Game logic, physics, and AI

### Project Structure
```
Table Tennis/
├── index.html          # Main game container
├── style.css           # Styling
├── js/
│   ├── main.js        # Initialization and main flow
│   ├── game.js        # Game loop and state management
│   ├── physics.js     # Ball physics and collision detection
│   ├── paddle.js      # Paddle control and difficulty settings
│   ├── ai.js          # AI player logic
│   └── ui.js          # UI management and screen rendering
└── README.md          # This file
```

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with HTML5 Canvas support

## Tips for Winning

1. **Easy Difficulty**: Good for learning the controls
2. **Medium Difficulty**: Balanced challenge, AI will track your shots
3. **Hard Difficulty**: Advanced opponent - predict its moves, use angles
4. **2-Player Tips**: Both players can select different difficulties for fun variations
5. **Master the Edges**: Hit the ball near the edges of your paddle for angled returns

## Known Limitations

- The game requires keyboard input (no mouse support)
- Touch controls for mobile devices are not currently implemented
- No network multiplayer (local play only)
- No sound effects (can be added in future versions)

## Future Enhancements

- Touch/mobile controls
- Sound effects and background music
- Network multiplayer
- Power-ups
- Different game modes
- Replay system
- Leaderboards

## License

This is a personal project created for educational purposes.

## Credits

Created as a fun table tennis simulation using vanilla JavaScript and HTML5 Canvas.
