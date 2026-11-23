import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
export { allRoutes, metadata } from './metadata';
export function render(url: string) {
  return renderToString(<StaticRouter location={url}><App /></StaticRouter>);
}
