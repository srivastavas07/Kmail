import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import store from './Redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
export const persistor = persistStore(store);

// persistor.purge();
//this will reset all the session and local Storage.

root.render(

  <React.StrictMode>

  <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID} >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} />
      <App />
    </Provider>
  </GoogleOAuthProvider>

  </React.StrictMode>

  // Strict mode renders components two times to detect any potential issue;

);