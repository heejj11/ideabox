import React from 'react';
import ReactDOM from 'react-dom/client';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/nanum-pen-script/korean.css';
import { App } from './app/App';
import { AppProviders } from './app/AppProviders';
import { configureGoogleAuth } from './lib/google/auth';
import './styles/tokens.css';
import './styles/global.css';
import './styles/scrapbook.css';

configureGoogleAuth(import.meta.env.VITE_GOOGLE_CLIENT_ID);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
