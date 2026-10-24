import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AudioProvider } from './audio/AudioProvider.tsx';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

const onVercel = typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider><App />{onVercel && <><SpeedInsights /><Analytics /></>}</AudioProvider>
  </StrictMode>,
);
