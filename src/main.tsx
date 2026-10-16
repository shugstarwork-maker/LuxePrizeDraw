import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AudioProvider } from './audio/AudioProvider.tsx';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider><App /><SpeedInsights /></AudioProvider>
  </StrictMode>,
);
