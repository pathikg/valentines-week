import { useState } from 'react';
import ProposalPage from './components/ProposalPage';
import MapPage from './components/MapPage';
import './App.css';

function App() {
  const [hasAccepted, setHasAccepted] = useState(false);

  return (
    <div className="app">
      {!hasAccepted ? (
        <ProposalPage onAccept={() => setHasAccepted(true)} />
      ) : (
        <MapPage />
      )}
    </div>
  );
}

export default App;
