"use client";

import { checkAnswer } from "@/lib/answer-validation";
import { createBoard, selectBackgroundImage } from "@/lib/board-setup";
import { generateTarget } from "@/lib/target-generation";
import { type ReactNode, createContext, useContext, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

// ============================================================================
// Types
// ============================================================================

export type OperationMode = "addition" | "subtraction" | "multiplication" | "all";
export type Operation = Exclude<OperationMode, "all">;

export type Square = {
  id: number;
  value: number;
  revealed: boolean;
};

export type GameConfig = {
  mode: OperationMode;
  maxNumber: number;
  boardSize: number;
  selectedTimesTables: number[];
};

type ActiveGame = {
  board: Square[];
  selectedSquares: number[];
  target: number;
  currentOperation: Operation;
  multiplicationTable: number | null;
  multiplicationSwapOrder: boolean;
  celebratingSquares: number[];
  backgroundImage: string;
  backgroundImageNumber: number;
  isComplete: boolean;
};

type GameState = {
  config: GameConfig;
  unlockedImages: number[];
  screen: "config" | "playing";
  game: ActiveGame | null;
};

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
  | { type: "REVEAL_SQUARES" }
  // Reward actions
  | { type: "RESET_PROGRESS" };

// ============================================================================
// Constants
// ============================================================================

export const BOARD_SIZE_MIN = 4;
export const BOARD_SIZE_MAX = 10;
export const BOARD_SIZE_STEP = 2;
export const NUMBER_RANGE_MIN = 1;
export const NUMBER_RANGE_MAX = 100;
export const TIMES_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DEFAULT_CONFIG: GameConfig = {
  mode: "addition",
  maxNumber: 12,
  boardSize: 6,
  selectedTimesTables: [2, 5, 10],
};

export const ALL_REWARD_IMAGES = Array.from({ length: 12 }, (_, i) => i + 1);

// LocalStorage keys
const STORAGE_KEYS = {
  CONFIG: "square-fruit-config",
  UNLOCKED: "square-fruit-unlocked",
} as const;

// ============================================================================
// Reducer Helpers
// ============================================================================

const updateConfig = (state: GameState, updates: Partial<GameConfig>): GameState => ({
  ...state,
  config: { ...state.config, ...updates },
});

const updateGame = (state: GameState, updates: Partial<ActiveGame>): GameState => ({
  ...state,
  game: state.game ? { ...state.game, ...updates } : null,
});

const completeGame = (game: ActiveGame, board: Square[]): ActiveGame => ({
  ...game,
  board,
  selectedSquares: [],
  celebratingSquares: [],
  isComplete: true,
});

// ============================================================================
// Reducer
// ============================================================================

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_MODE":
      return updateConfig(state, { mode: action.mode });

    case "SET_MAX_NUMBER":
      return updateConfig(state, { maxNumber: action.maxNumber });

    case "SET_BOARD_SIZE":
      return updateConfig(state, { boardSize: action.boardSize });

    case "SET_TIMES_TABLES":
      return updateConfig(state, { selectedTimesTables: action.timesTables });

    case "START_GAME": {
      // Validate times tables selection for multiplication modes
      const needsTimesTables = state.config.mode === "multiplication" || state.config.mode === "all";
      if (needsTimesTables && state.config.selectedTimesTables.length === 0) {
        return state;
      }

      // Create game board and select background image
      const board = createBoard(state.config.boardSize, state.config.maxNumber);
      const { imageNumber, imageUrl } = selectBackgroundImage(state.unlockedImages, ALL_REWARD_IMAGES);

      // Generate first target
      const targetInfo = generateTarget(board, state.config.mode, state.config.selectedTimesTables);
      if (!targetInfo) return state;

      return {
        ...state,
        screen: "playing",
        game: {
          board,
          selectedSquares: [],
          celebratingSquares: [],
          backgroundImage: imageUrl,
          backgroundImageNumber: imageNumber,
          isComplete: false,
          ...targetInfo,
        },
      };
    }

    case "EXIT_TO_CONFIG":
      return { ...state, screen: "config" };

    case "RESTART_GAME":
      return { ...state, screen: "config", game: null };

    case "TOGGLE_SQUARE": {
      if (!state.game || state.game.isComplete) return state;

      const { game } = state;
      const square = game.board.find((sq) => sq.id === action.squareId);
      if (!square || square.revealed) return state;

      // Deselect if already selected
      if (game.selectedSquares.includes(action.squareId)) {
        return updateGame(state, {
          selectedSquares: game.selectedSquares.filter((id) => id !== action.squareId),
        });
      }

      // Check max selections
      const maxSelections = game.currentOperation === "multiplication" ? 1 : 2;
      if (game.selectedSquares.length >= maxSelections) return state;

      const newSelected = [...game.selectedSquares, action.squareId];

      // Check answer when max selections reached
      if (newSelected.length === maxSelections) {
        const selectedValues = newSelected
          .map((id) => game.board.find((sq) => sq.id === id)?.value)
          .filter((v): v is number => v !== undefined);

        const isCorrect = checkAnswer(selectedValues, game.target, game.currentOperation, game.multiplicationTable);

        if (isCorrect) {
          return updateGame(state, { selectedSquares: newSelected, celebratingSquares: newSelected });
        }

        toast.error("Oops! That's not quite right 😿 Try again!");
        return updateGame(state, { selectedSquares: [] });
      }

      return updateGame(state, { selectedSquares: newSelected });
    }

    case "REVEAL_SQUARES": {
      if (!state.game) return state;

      const { game } = state;
      const newBoard = game.board.map((sq) =>
        game.celebratingSquares.includes(sq.id) ? { ...sq, revealed: true } : sq,
      );

      // Game complete - unlock image
      if (newBoard.every((sq) => sq.revealed)) {
        const imageAlreadyUnlocked = state.unlockedImages.includes(game.backgroundImageNumber);
        return {
          ...state,
          unlockedImages: imageAlreadyUnlocked
            ? state.unlockedImages
            : [...state.unlockedImages, game.backgroundImageNumber],
          game: completeGame(game, newBoard),
        };
      }

      // Generate next target
      const targetInfo = generateTarget(newBoard, state.config.mode, state.config.selectedTimesTables);
      if (!targetInfo) {
        return { ...state, game: completeGame(game, newBoard) };
      }

      return updateGame(state, {
        board: newBoard,
        selectedSquares: [],
        celebratingSquares: [],
        ...targetInfo,
      });
    }

    case "RESET_PROGRESS":
      return { ...state, unlockedImages: [] };

    default:
      return state;
  }
};

// ============================================================================
// Context
// ============================================================================

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

const initialState: GameState = {
  config: DEFAULT_CONFIG,
  unlockedImages: [],
  screen: "config",
  game: null,
};

type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider = ({ children }: GameProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [storedConfig, setStoredConfig] = useLocalStorage<GameConfig>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  const [storedUnlocked, setStoredUnlocked] = useLocalStorage<number[]>(STORAGE_KEYS.UNLOCKED, []);

  // Initialize with defaults to avoid hydration mismatch
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load stored values on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only load stored config once on mount to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);

    // Ensure selectedTimesTables exists (backwards compatibility)
    const config = {
      ...storedConfig,
      selectedTimesTables: storedConfig.selectedTimesTables || DEFAULT_CONFIG.selectedTimesTables,
    };

    // Apply non-default config values
    const configUpdates: GameAction[] = [];

    if (config.mode !== DEFAULT_CONFIG.mode) {
      configUpdates.push({ type: "SET_MODE", mode: config.mode });
    }
    if (config.maxNumber !== DEFAULT_CONFIG.maxNumber) {
      configUpdates.push({ type: "SET_MAX_NUMBER", maxNumber: config.maxNumber });
    }
    if (config.boardSize !== DEFAULT_CONFIG.boardSize) {
      configUpdates.push({ type: "SET_BOARD_SIZE", boardSize: config.boardSize });
    }
    if (JSON.stringify(config.selectedTimesTables) !== JSON.stringify(DEFAULT_CONFIG.selectedTimesTables)) {
      configUpdates.push({ type: "SET_TIMES_TABLES", timesTables: config.selectedTimesTables });
    }

    for (const action of configUpdates) {
      dispatch(action);
    }
  }, []);

  // Persist state to localStorage after mount
  useEffect(() => {
    if (isMounted) setStoredConfig(state.config);
  }, [state.config, setStoredConfig, isMounted]);

  useEffect(() => {
    if (isMounted) setStoredUnlocked(state.unlockedImages);
  }, [state.unlockedImages, setStoredUnlocked, isMounted]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};
