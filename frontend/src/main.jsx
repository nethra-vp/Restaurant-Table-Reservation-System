import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import MenuContextProvider from './context/MenuContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <MenuContextProvider>
  <App />
  </MenuContextProvider>
  </BrowserRouter>
)
