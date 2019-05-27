import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import * as storage from 'localforage';

import thunk from 'redux-thunk'
import rootReducer from './rootReducer'

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)


export default function configureStore ( initialState = {} ) {
  const enhancers = []
  const middleware = [thunk]
  
  if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__
  
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }
  
  const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
  )
  
  let store = createStore(
    rootReducer,
    // persistedReducer,
    initialState,
    composedEnhancers
  )
  let persistor = persistStore(store)
  return { store, persistor }
}