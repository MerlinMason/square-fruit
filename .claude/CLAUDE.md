# Square Fruit - Math Game for Kids

## Overview
Square Fruit is a kawaii-styled mathematics game built for 7-year-old children. Players match pairs of numbers on a grid to achieve target equations, progressively revealing reward images.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: v19
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with custom animations
- **Components**: shadcn/ui (Button, Slider, Card)
- **State Management**: React useState + useLocalStorage (usehooks-ts)
- **Linting**: Biome (not ESLint)
- **Database**: Drizzle ORM with PostgreSQL (not used in game yet)
- **Auth**: NextAuth v5 (not implemented yet)

## Project Structure

### Key Components
- **src/app/_components/math-game.tsx** - Main orchestrator
  - Handles game state (config/playing)
  - Manages localStorage for preferences and unlocked images
  - Renders config screen with operation modes, sliders, reward gallery

- **src/app/_components/game-board.tsx** - Game logic & rendering
  - Grid-based number matching game
  - Target generation with equation display
  - Progressive image reveal as squares are cleared
  - Smart background image selection (prioritizes unseen images)

- **src/app/_components/reward-gallery.tsx** - Collection display
  - 2-column grid of reward thumbnails (18:9 aspect ratio)
  - Lightbox modal for full-size viewing
  - Shows locked (🔒) vs unlocked images

### Game Mechanics
1. **Configuration Screen**:
   - Operation modes: Addition, Subtraction, Multiplication, All Mixed
   - Board size: 4×4, 6×6, 8×8, 10×10 (even numbers only to ensure all squares pair)
   - Number range: 1-100 (slider with rainbow gradient)
   - Reward gallery showing collection progress

2. **Gameplay**:
   - Player sees equation: `? [operator] ? = [target]`
   - Selects two squares from grid to fill in the `?` marks
   - Correct answers reveal part of background image
   - Completion shows celebration screen

3. **Reward System**:
   - 10 reward images (1.png - 10.png in public/assets/)
   - Each game uses one unseen image as background
   - Completing game unlocks that image in gallery
   - Once all unlocked, cycles through randomly

## Important Implementation Details

### LocalStorage Persistence
- **square-fruit-config**: Game preferences (mode, maxNumber, boardSize)
- **square-fruit-unlocked**: Array of unlocked image numbers (1-10)
- Uses `isMounted` pattern to avoid hydration errors with SSR

### Background Image Selection
- Logic in game-board.tsx line ~91
- **Critical**: useEffect runs ONCE on mount with empty dependency array
- This prevents image changing when completing game
- Uses biome-ignore comment to suppress exhaustive-deps warning
- Filters unlocked images, picks from unseen, falls back to random if all seen

### Target Generation Algorithm
- Enumerates ALL valid pairs from remaining squares (not random selection)
- Ensures every target is achievable
- Fixed bug where impossible targets could occur

### Styling Theme - Kawaii
- Pastel colors: pink, purple, blue gradients
- Rounded corners, shadows, semi-transparent elements
- Emoji decorations (✨💖🦄🌈)
- Floating pulsing background blobs
- Custom animations in globals.css

### Layout Structure
- Config screen: 2-column grid (lg:grid-cols-2)
  - Left: game settings card
  - Right: reward gallery
- Responsive: single column on mobile
- Even width with gap-6

## Assets
- **public/assets/logo.png** - Game logo (has white background in file)
- **public/assets/1.png through 10.png** - Reward images

## Custom Styling
- **Font**: Poetsen One (Google Font)
- **Slider**: Enhanced with rainbow gradient, 32px handle, grab cursor
- **Text effects**: Simple gradient (pink→purple→blue), no fancy effects after user feedback
- **Animations**: Custom wiggle animation and animation-delay utilities in globals.css

## Known Issues & Fixes
1. **Hydration errors**: Fixed with isMounted pattern
2. **Image 404s**: Moved from src/assets to public/assets
3. **Odd board sizes**: Restricted to even numbers only (step={2} on slider)
4. **Border cropping**: Added z-index layers (z-10 selected, z-20 celebrating)
5. **Image changing on completion**: Fixed with empty deps array in useEffect
6. **Play Again button**: Separated onComplete (saves to storage) from onRestart (returns to config)

## Running Commands
```bash
bun dev                 # Development server
bun run build          # Production build
bun run check          # Biome linter
bun run check:write    # Biome fix
bun run typecheck      # TypeScript check
```

## Biome Configuration
- Uses Biome instead of ESLint
- Suppress linting with: `// biome-ignore lint/[rule]: reason`
- Class sorting enforced (Tailwind order)

## Design Decisions
1. **Even board sizes only**: Prevents odd remaining squares
2. **Single image per game**: Stable background throughout gameplay
3. **Smart image selection**: Always shows new content when available
4. **No server state yet**: All client-side with localStorage
5. **Cursor pointer on buttons**: All buttons have explicit cursor-pointer class

## Future Considerations
- Database integration for cross-device progress sync
- Authentication for multiple players
- More reward images
- Additional game modes (division, fractions)
- Sound effects and music
- Difficulty levels
- Timer/scoring system
