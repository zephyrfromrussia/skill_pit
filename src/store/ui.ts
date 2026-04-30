import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  mobileQa: boolean
  toggleMobileQa: () => void
  setMobileQa: (value: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileQa: false,
      toggleMobileQa: () => set((s) => ({ mobileQa: !s.mobileQa })),
      setMobileQa: (value) => set({ mobileQa: value }),
    }),
    { name: 'skill-pit-ui' },
  ),
)

