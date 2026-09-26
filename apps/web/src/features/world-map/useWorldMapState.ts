import { useCallback, useReducer } from "react";

export const HOME_POSITION = "HOME";

/**
 * World Map client state (design improvement §4.4). Server State (GitHub
 * data) stays in TanStack Query; URL State stays in TanStack Router; only
 * character position / Command Window UI lives here as React state.
 */
export type WorldMapState = {
  selectedRepository: string | null;
  playerPosition: string;
  commandOpen: boolean;
  moving: boolean;
};

const initialState: WorldMapState = {
  selectedRepository: null,
  playerPosition: HOME_POSITION,
  commandOpen: false,
  moving: false,
};

/**
 * Builds the initial state for a World Map mount. When an
 * `initialPosition` (the Repository last visited via "冒険する", carried
 * across route transitions by LastVisitedRepositoryContext) is given, the
 * character starts already standing on that node with the Command Window
 * closed and no movement animation. Otherwise it falls back to HOME.
 */
function makeInitialState(initialPosition?: string | null): WorldMapState {
  if (!initialPosition) {
    return initialState;
  }
  return {
    selectedRepository: initialPosition,
    playerPosition: initialPosition,
    commandOpen: false,
    moving: false,
  };
}

type WorldMapAction =
  | { type: "SELECT_NODE"; repoKey: string }
  | { type: "ARRIVED" }
  | { type: "RETURN_HOME" }
  | { type: "RESET" };

function reducer(state: WorldMapState, action: WorldMapAction): WorldMapState {
  switch (action.type) {
    case "SELECT_NODE": {
      // A move already in progress ignores further node clicks (design §4.4 / accept. criteria).
      if (state.moving) {
        return state;
      }
      return {
        selectedRepository: action.repoKey,
        playerPosition: state.playerPosition,
        // Already standing on the node: no move happens, so open the Command Window right away.
        commandOpen: state.playerPosition === action.repoKey,
        moving: state.playerPosition !== action.repoKey,
      };
    }
    case "ARRIVED":
      return {
        ...state,
        playerPosition: state.selectedRepository ?? HOME_POSITION,
        moving: false,
        // Only opens the Command Window when arriving AT a repository, not when returning home.
        commandOpen: state.selectedRepository !== null,
      };
    case "RETURN_HOME": {
      if (state.moving) {
        return state;
      }
      return {
        selectedRepository: null,
        playerPosition: state.playerPosition,
        commandOpen: false,
        moving: state.playerPosition !== HOME_POSITION,
      };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useWorldMapState(initialPosition?: string | null) {
  const [state, dispatch] = useReducer(reducer, initialPosition, makeInitialState);

  const selectNode = useCallback((repoKey: string) => {
    dispatch({ type: "SELECT_NODE", repoKey });
  }, []);

  const arrived = useCallback(() => {
    dispatch({ type: "ARRIVED" });
  }, []);

  const returnHome = useCallback(() => {
    dispatch({ type: "RETURN_HOME" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return { state, selectNode, arrived, returnHome, reset };
}
