import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// HashRouter (not BrowserRouter) is deliberate: GitHub Pages returns a
// static 404 for any path it doesn't recognize on a hard refresh or direct
// link, since there's no server to rewrite sub-paths back to index.html.
// Hash-based routes (e.g. #/profile) never leave index.html as far as the
// server is concerned, so deep links and refreshes just work with zero
// extra GitHub Pages configuration.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
