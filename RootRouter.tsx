import React from 'react';
import PasswordResetPage from './components/PasswordResetPage';
import { App } from './App';

const RootRouter = () => {
  const [route, setRoute] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (route.startsWith('/reset-password')) {
    return <PasswordResetPage />;
  }
  return <App />;
};

export default RootRouter;
