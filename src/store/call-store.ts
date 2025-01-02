import { create } from 'zustand'

interface CallState {
  isInCall: boolean
  incomingCall: {
    from: string
    offer: any
    callerName: string
    callerImage: string
  } | null
  setIsInCall: (isInCall: boolean) => void
  setIncomingCall: (call: any) => void
  resetCall: () => void
}

export const useCallStore = create<CallState>((set) => ({
  isInCall: false,
  incomingCall: null,
  setIsInCall: (isInCall) => set({ isInCall }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  resetCall: () => set({ isInCall: false, incomingCall: null }),
}))
