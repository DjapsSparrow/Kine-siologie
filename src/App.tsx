import React from 'react';
import Router from './router';
import { AuthProvider } from './lib/auth';

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;