import { useState } from 'react';
import { Logo } from './components/Logo';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SuccessScreen } from './components/SuccessScreen';
import { SubscriptionResponse } from './types/subscription';
import './App.css';

type ViewState = 'form' | 'success';

function App() {
  const [view, setView] = useState<ViewState>('form');
  const [response, setResponse] = useState<SubscriptionResponse | null>(null);

  const handleSuccess = (data: SubscriptionResponse) => {
    setResponse(data);
    setView('success');
  };

  const handleReset = () => {
    setResponse(null);
    setView('form');
  };

  return (
    <div className="app">
      <main className="container">
        <div className="card">
          <Logo />
          {view === 'form' ? (
            <SubscriptionForm onSuccess={handleSuccess} />
          ) : (
            <SuccessScreen response={response!} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
