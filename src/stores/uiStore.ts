import { create } from 'zustand';

const ORGANIZED_MODE_KEY = 'idea-box:organized-mode';

function readOrganizedMode(): boolean {
  return localStorage.getItem(ORGANIZED_MODE_KEY) === 'true';
}

interface UiState {
  organizedMode: boolean;
  selectedIdeaId: string | null;
  setOrganizedMode: (enabled: boolean) => void;
  selectIdea: (ideaId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  organizedMode: readOrganizedMode(),
  selectedIdeaId: null,
  setOrganizedMode: (organizedMode) => {
    localStorage.setItem(ORGANIZED_MODE_KEY, String(organizedMode));
    set({ organizedMode });
  },
  selectIdea: (selectedIdeaId) => set({ selectedIdeaId }),
}));
