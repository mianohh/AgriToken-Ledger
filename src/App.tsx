import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { NetworkStatus } from './components/NetworkStatus';
import { BalanceWarning } from './components/BalanceWarning';
import { TransactionForm } from './components/TransactionForm';
import { VerifyTransaction } from './components/VerifyTransaction';
import { TransactionList } from './components/TransactionList';
import { useWallet } from './hooks/useWallet';
import './index.css';

function App() {
  const { balance } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'verify' | 'dashboard'>('create');

  return (
    <div className="app">
      <header>
        <h1>🌾 AgriToken Ledger</h1>
        <div className="header-controls">
          <NetworkStatus />
          <WalletConnect />
        </div>
      </header>
      
      <main>
        <BalanceWarning balance={balance} />
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Transaction
          </button>
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Transaction
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="card">
            <h2>Create Agricultural Transaction</h2>
            <TransactionForm />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="card">
            <h2>Transaction Dashboard</h2>
            <TransactionList />
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="card">
            <h2>Verify Transaction</h2>
            <VerifyTransaction />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
