import React from 'react';
import ReactDOM from 'react-dom/client';
import RootRouter from './RootRouter';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
