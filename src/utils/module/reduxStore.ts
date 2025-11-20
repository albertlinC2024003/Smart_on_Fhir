// store.ts
import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: {
  },
});

// 从 store 本身推断出 `RootState` 和 `AppDispatch` types
export type MyState = ReturnType<typeof store.getState>;
export type MyDispatch = typeof store.dispatch;
export default store;