import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Wrapping the App component with BrowserRouter to enable routing */}
    <App />
    </BrowserRouter>
  </StrictMode>
);
