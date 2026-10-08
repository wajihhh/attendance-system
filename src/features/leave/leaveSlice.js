import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  requests: [],
}

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    addLeave: {
      reducer(state, action) {
        state.requests.push(action.payload)
      },
      prepare({ userId, leaveDate, reason }) {
        return {
          payload: {
            id: nanoid(),
            userId,
            leaveDate,
            reason: reason.trim(),
            status: 'pending',
          },
        }
      },
    },
    approveLeave(state, action) {
      const request = state.requests.find((entry) => entry.id === action.payload)
      if (request) request.status = 'approved'
    },
    rejectLeave(state, action) {
      const request = state.requests.find((entry) => entry.id === action.payload)
      if (request) request.status = 'rejected'
    },
    setRequests(state, action) {
      state.requests = action.payload || []
    },
  },
})

export const { addLeave, approveLeave, rejectLeave, setRequests } = leaveSlice.actions
export default leaveSlice.reducer
