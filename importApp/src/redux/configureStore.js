import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './rootReducer'

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
  
  return createStore(
    rootReducer,
    initialState,
    composedEnhancers
  )
}