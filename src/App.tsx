import { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SignInForm } from './components/SignInForm';
import { Dashboard } from './components/Dashboard';
import { SuccessScreen } from './components/SuccessScreen';
import { SubscriptionResponse, AuthResponse, Subscriber } from './types/subscription';
import './App.css';

type ViewState = 'signup' | 'signin' | 'dashboard' | 'success';

interface AuthState {
  accessToken: string;
  subscriber: Subscriber;
}

function App() {
  const [view, setView] = useState<ViewState>('signup');
  const [response, setResponse] = useState<SubscriptionResponse | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);

  useEffect(() => {
    // Check for existing auth in localStorage
    const savedAuth = localStorage.getItem('suncoin_auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth) as AuthState;
        setAuthState(parsed);
        setView('dashboard');
      } catch (e) {
        localStorage.removeItem('suncoin_auth');
      }
    }
  }, []);

  const handleSignupSuccess = (data: SubscriptionResponse) => {
    setResponse(data);
    setView('success');
  };

  const handleSignInSuccess = (data: AuthResponse) => {
    if (data.accessToken) {
      if (data.subscriber) {
        const auth: AuthState = {
          accessToken: data.accessToken,
          subscriber: data.subscriber,
        };
        setAuthState(auth);
        localStorage.setItem('suncoin_auth', JSON.stringify(auth));
        setView('dashboard');
      } else {
        // User exists in Cognito but has no subscriber record
        // This can happen for users who signed up but didn't complete coin selection
        alert('Your account setup is incomplete. Please sign up again to select your coins.');
        setView('signup');
      }
    }
  };

  const handleLogout = () => {
    setAuthState(null);
    localStorage.removeItem('suncoin_auth');
    setView('signup');
  };

  const handleSubscriberUpdate = (subscriber: Subscriber) => {
    if (authState) {
      const newAuthState = { ...authState, subscriber };
      setAuthState(newAuthState);
      localStorage.setItem('suncoin_auth', JSON.stringify(newAuthState));
    }
  };

  const handleReset = () => {
    setResponse(null);
    setView('signup');
  };

  const renderContent = () => {
    switch (view) {
      case 'signin':
        return (
          <SignInForm
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setView('signup')}
          />
        );
      case 'dashboard':
        return authState ? (
          <Dashboard
            key={authState.subscriber.phoneNumber + JSON.stringify(authState.subscriber.selectedCoins)}
            subscriber={authState.subscriber}
            accessToken={authState.accessToken}
            onLogout={handleLogout}
            onUpdate={handleSubscriberUpdate}
          />
        ) : null;
      case 'success':
        return <SuccessScreen response={response!} onReset={handleReset} />;
      case 'signup':
      default:
        return (
          <SubscriptionForm
            onSuccess={handleSignupSuccess}
            onSwitchToSignIn={() => setView('signin')}
          />
        );
    }
  };

  return (
    <div className="app">
      <main className="container">
        <div className="card">
          <Logo />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
