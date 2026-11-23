import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import './premium.css';
import './spacing.css';

const root = document.getElementById('root')!;
const app = <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>;
const route = window.location.pathname.replace(/\/$/, '') || '/';
if (root.hasChildNodes() && root.dataset.route === route) hydrateRoot(root, app);
else createRoot(root).render(app);
