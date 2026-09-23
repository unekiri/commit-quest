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

type WorldMapAction =
  | { type: "SELECT_NODE"; repoKey: string }
  | { type: "ARRIVED" }
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
        commandOpen: false,
        moving: state.playerPosition !== action.repoKey,
      };
    }
    case "ARRIVED":
      return {
        ...state,
        playerPosition: state.selectedRepository ?? state.playerPosition,
        moving: false,
        commandOpen: true,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useWorldMapState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectNode = useCallback((repoKey: string) => {
    dispatch({ type: "SELECT_NODE", repoKey });
  }, []);

  const arrived = useCallback(() => {
    dispatch({ type: "ARRIVED" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return { state, selectNode, arrived, reset };
}
