# Square Fruit - Game State Refactoring Plan

## Executive Summary

**Goal:** Refactor game to use React Context + useReducer pattern to eliminate prop drilling and centralize state management.

**Approach:** Single context file (~500-600 lines) containing all game logic. Components simplified to dispatch actions and read from context.

**Key Changes:**
- 14 useState hooks → 1 useReducer in provider
- All props removed from components (use context hooks)
- Game logic moves from components → reducer + helper functions
- 6 clear phases with testable milestones

**Files Modified:** 6 existing components + 1 new context file
**Estimated Effort:** Medium complexity - main challenge is preserving exact game logic during migration

---

## Current State Audit

### Component Hierarchy
```
Home (page.tsx)
  └─ MathGame (orchestrator)
      ├─ RewardGallery (config screen)
      └─ GameBoard (playing state)
          ├─ CompletionScreen
          └─ EquationDisplay
```

### State Management Issues

#### 1. **MathGame Component** ([math-game.tsx](src/app/_components/math-game.tsx))
**Current state:**
- `gameState`: "config" | "playing"
- `config`: GameConfig (mode, maxNumber, boardSize, selectedTimesTables)
- `unlockedImages`: number[]
- `isMounted`: boolean (hydration workaround)

**Responsibilities:**
- Manages localStorage persistence (lines 41-42)
- Orchestrates screen transitions (config ↔ playing)
- Handles game completion + unlocking rewards (lines 90-95)
- Renders entire config UI (lines 106-293)
- 7 props passed down to GameBoard (lines 298-307)

#### 2. **GameBoard Component** ([game-board.tsx](src/app/_components/game-board.tsx))
**Current state:**
- `board`: Square[] (id, value, revealed)
- `selectedSquares`: number[] (IDs)
- `target`: number
- `currentOperation`: "addition" | "subtraction" | "multiplication"
- `celebratingSquares`: number[]
- `backgroundImage`: string
- `backgroundImageNumber`: number
- `isComplete`: boolean
- `multiplicationTable`: number | null
- `multiplicationSwapOrder`: boolean

**Responsibilities:**
- Board initialization + number generation (lines 119-129)
- Target generation algorithm (lines 132-218)
- Square selection logic (lines 221-261)
- Answer validation (lines 243-258)
- Background image selection (lines 107-116)
- Celebration animations
- Completion detection + callback (lines 136-139)
- 10 internal useState hooks!

#### 3. **Prop Drilling Identified**

**MathGame → GameBoard:**
```typescript
mode={config.mode}
maxNumber={config.maxNumber}
boardSize={config.boardSize}
selectedTimesTables={config.selectedTimesTables || DEFAULT_CONFIG.selectedTimesTables}
onComplete={handleGameComplete}
onRestart={handleRestart}
onExit={() => setGameState("config")}
unlockedImages={unlockedImages}
```

**GameBoard → EquationDisplay:**
```typescript
currentOperation={currentOperation}
multiplicationTable={multiplicationTable}
multiplicationSwapOrder={multiplicationSwapOrder}
selectedSquaresCount={selectedSquares.length}
firstValue={firstValue}
secondValue={secondValue}
target={target}
```

**GameBoard → CompletionScreen:**
```typescript
onRestart={onRestart}
```

**MathGame → RewardGallery:**
```typescript
unlockedImages={unlockedImages}
onResetProgress={handleResetProgress}
```

### Key Complexity Points

1. **Game logic split across components** - Target generation, answer validation, board state all in GameBoard
2. **Excessive useState hooks** - 10 in GameBoard, 4 in MathGame (14 total!)
3. **Multiple useEffect chains** - Complex dependencies for target generation, board initialization, image selection
4. **Deep prop drilling** - 7 props to GameBoard, 7 to EquationDisplay
5. **Mixed concerns** - MathGame handles both orchestration AND full config UI rendering
6. **No clear state machine** - gameState is simple string, transitions are ad-hoc
7. **LocalStorage coupling** - Tied directly to component state in MathGame

## Target Architecture

### Game Provider Pattern with useReducer

```
Home (page.tsx)
  └─ GameProvider (context provider with useReducer)
      └─ MathGame (orchestrator, same structure)
          ├─ RewardGallery (uses context)
          └─ GameBoard (simplified - grid rendering only)
              ├─ CompletionScreen (uses context)
              └─ EquationDisplay (uses context)
```

**Note:** Keeping existing component structure, just removing props and useState.

### State Structure

```typescript
type GameState = {
  // Config
  config: {
    mode: OperationMode;
    maxNumber: number;
    boardSize: number;
    selectedTimesTables: number[];
  };

  // Rewards
  unlockedImages: number[];

  // Game flow
  screen: "config" | "playing";

  // Active game state
  game: {
    board: Square[];
    selectedSquares: number[];
    target: number;
    currentOperation: "addition" | "subtraction" | "multiplication";
    multiplicationTable: number | null;
    multiplicationSwapOrder: boolean;
    celebratingSquares: number[];
    backgroundImage: string;
    backgroundImageNumber: number;
    isComplete: boolean;
  } | null;
};
```

### Action Types

```typescript
type GameAction =
  // Config actions
  | { type: "SET_MODE"; mode: OperationMode }
  | { type: "SET_MAX_NUMBER"; maxNumber: number }
  | { type: "SET_BOARD_SIZE"; boardSize: number }
  | { type: "SET_TIMES_TABLES"; timesTables: number[] }

  // Game flow actions
  | { type: "START_GAME" }
  | { type: "EXIT_TO_CONFIG" }
  | { type: "RESTART_GAME" }

  // Gameplay actions
  | { type: "TOGGLE_SQUARE"; squareId: number }
  | { type: "REVEAL_SQUARES" } // After celebration delay

  // Reward actions
  | { type: "RESET_PROGRESS" }

  // Hydration
  | { type: "HYDRATE_FROM_STORAGE"; config: GameConfig; unlockedImages: number[] };
```

**Note:** Reducer handles logic, component handles timing:
- **TOGGLE_SQUARE:** Validates answer when enough squares selected
  - If correct: Sets celebratingSquares
  - If incorrect: Clears selectedSquares
  - Component checks if celebratingSquares changed, dispatches REVEAL_SQUARES after 600ms
  - Component checks if selectedSquares was cleared (validation failed), shows toast & re-clears after 600ms
- **REVEAL_SQUARES:** Reveals squares, clears celebratingSquares, generates new target, checks completion
- **START_GAME:** Initializes board, selects image, generates first target

### Context Hook API

```typescript
// Single hook exported from game-context.tsx
const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within GameProvider");
  return context;
};

// Usage in components:
const { state, dispatch } = useGameContext();

// Access state directly:
state.config.mode
state.game?.board
state.unlockedImages

// Dispatch actions:
dispatch({ type: "SET_MODE", mode: "addition" })
dispatch({ type: "TOGGLE_SQUARE", squareId: 5 })
```

## Refactoring Steps

### Phase 1: Create Game Context ✅ COMPLETE

**Files created:**
- `src/contexts/game-context.tsx` (260 lines) - Context provider with reducer
- `src/lib/game-helpers.ts` (12 lines) - `randomInt`, `calculateTarget`
- `src/lib/answer-validation.ts` (19 lines) - `checkAnswer`
- `src/lib/board-setup.ts` (29 lines) - `createBoard`, `selectBackgroundImage`
- `src/lib/target-generation.ts` (62 lines) - `generateTarget`

**Architecture decisions:**
1. **Helper functions extracted to lib/** - Separated concerns, more testable
2. **Arrow functions everywhere** - Consistent modern syntax
3. **Context as source of truth for types** - Exports: `OperationMode`, `Operation`, `Square`, `GameConfig`
4. **useLocalStorage hook** - Replaced manual localStorage + isMounted pattern
5. **Removed HYDRATE_FROM_STORAGE action** - No longer needed with useLocalStorage
6. **Reducer helpers added** - `updateConfig`, `completeGame` for DRY code
7. **Spread targetInfo directly** - Cleaner object construction in START_GAME/REVEAL_SQUARES

**Type consolidation:**
- `OperationMode` - exported from context, used by target-generation
- `Operation` - extracted from ActiveGame.currentOperation, shared type
- `Square` - exported from context, used by board-setup and target-generation
- `GameConfig` - exported from context
- `ActiveGame`, `GameState`, `GameAction` - internal to context

**Reducer actions (10 total):**
- Config: SET_MODE, SET_MAX_NUMBER, SET_BOARD_SIZE, SET_TIMES_TABLES (use `updateConfig` helper)
- Flow: START_GAME, EXIT_TO_CONFIG, RESTART_GAME
- Gameplay: TOGGLE_SQUARE, REVEAL_SQUARES
- Rewards: RESET_PROGRESS

**Code review improvements:**
- Used `Array.from` instead of for loops
- Replaced switch with early returns where appropriate
- Used `flatMap` for array transformations
- Removed unused object properties in possibleTargets
- Extracted type aliases (TargetResult, ActiveGame)
- Removed redundant comments
- Fixed non-null assertions with const assignments

### Phase 2: Wrap App with Provider
**Modify:**
- `src/app/page.tsx`

**Tasks:**
1. Import GameProvider from context
2. Wrap MathGame with GameProvider
3. Test that context is accessible

### Phase 3: Refactor MathGame
**Modify:**
- `src/app/_components/math-game.tsx`

**Tasks:**
1. Remove all useState hooks (gameState, config, unlockedImages, isMounted)
2. Replace with useGameContext
3. Replace setConfig calls with dispatch actions
4. Replace handlers (handleStartGame, handleGameComplete, etc.) with dispatch calls
5. Keep existing UI structure (no component splitting yet)
6. Test config screen still works

### Phase 4: Refactor GameBoard
**Modify:**
- `src/app/_components/game-board.tsx`

**Tasks:**
1. Remove all 10 useState hooks
2. Remove all 3 useEffect hooks
3. Replace with useGameContext
4. Update handleSquareClick to dispatch actions
5. Remove all game logic (now in reducer)
6. Keep grid rendering only
7. Test gameplay works

### Phase 5: Refactor Child Components
**Modify:**
- `src/app/_components/equation-display.tsx` - Remove props, use context
- `src/app/_components/completion-screen.tsx` - Remove props, use context
- `src/app/_components/reward-gallery.tsx` - Remove props, use context

**Tasks:**
1. Replace props with useGameContext in each component
2. Update handlers to dispatch actions
3. Test all components render correctly

### Phase 6: Testing & Cleanup
**Tasks:**
1. Test full game flow (config → play → complete → restart)
2. Test localStorage persistence across page reload
3. Test all operations (addition, subtraction, multiplication, all)
4. Test reward unlocking + gallery
5. Test times tables selection
6. Verify no prop drilling remains
7. Remove any commented code
8. Run typecheck + build

## Benefits of Refactor

1. **Separation of concerns** - Logic in reducer, UI in components
2. **Testability** - Pure functions, easy to unit test
3. **No prop drilling** - Components access context directly
4. **Single source of truth** - All state in one reducer
5. **Predictable state updates** - Actions clearly document transitions
6. **Easier debugging** - Can log all actions, replay state
7. **Better performance** - Selective re-renders with context selectors
8. **Scalability** - Easy to add new features/screens/actions

## Migration Strategy

- **Keep old components working** during refactor
- **Build new structure alongside** old code
- **Migrate component-by-component** with feature flags if needed
- **Test each phase** before moving to next
- **Keep git commits small** - one phase per commit

## Potential Challenges

1. **localStorage sync** - Need careful timing to avoid race conditions
2. **SSR/hydration** - isMounted pattern still needed in provider
3. **Animation timing** - Celebration uses setTimeout (600ms) before revealing squares:
   - Current: `setCelebratingSquares(ids)` → 600ms → `setBoard(reveal)` → `setCelebratingSquares([])`
   - Options:
     - Keep setTimeout in component, dispatch after delay
     - Add "CELEBRATING" intermediate state in reducer
     - Use useEffect to watch celebratingSquares and auto-clear
4. **Backward compatibility** - Old localStorage format already compatible (same keys)
5. **Complex target generation** - Must preserve exact algorithm from lines 132-218
6. **Toast notifications** - Currently called from component, could stay there or move to reducer side-effect

## File Size Estimates

**Before:**
- math-game.tsx: ~313 lines
- game-board.tsx: ~355 lines
- **Total: ~668 lines** (core game logic)

**After Phase 1:**
- game-context.tsx: ~260 lines (types + reducer + provider)
- game-helpers.ts: ~12 lines
- answer-validation.ts: ~19 lines
- board-setup.ts: ~29 lines
- target-generation.ts: ~62 lines
- **Subtotal: ~382 lines** (core logic, well organized)

**After Phase 6 (estimated):**
- math-game.tsx: ~300 lines (same UI, simplified handlers)
- game-board.tsx: ~100 lines (just grid rendering)
- equation-display.tsx: ~140 lines (minimal change)
- completion-screen.tsx: ~35 lines (minimal change)
- reward-gallery.tsx: ~140 lines (minimal change)
- **Total: ~1097 lines** (better organized, easier to reason about, more maintainable)

## Success Criteria

- [x] Zero prop drilling beyond 1 level (Phase 1: types consolidated)
- [x] All game logic testable as pure functions (Phase 1: helpers in lib/)
- [ ] No useState in any game components (Phase 3-5)
- [x] Single useReducer in provider (Phase 1: complete)
- [x] All state transitions via actions (Phase 1: 10 actions defined)
- [x] LocalStorage sync working (Phase 1: useLocalStorage hook)
- [ ] All existing features working (Phase 6: testing)
- [ ] No performance regressions (Phase 6: testing)
- [ ] Game still feels responsive (Phase 6: testing)
