import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { NetworkStatus } from './components/NetworkStatus';
import { BalanceWarning } from './components/BalanceWarning';
import { TransactionFormEnhanced } from './components/TransactionFormEnhanced';
import { VerifyTransaction } from './components/VerifyTransaction';
import { TransactionList } from './components/TransactionList';
import { useWallet } from './hooks/useWallet';
import './index.css';

function App() {
  const { balance, isConnected, address } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'verify' | 'dashboard'>('create');

  return (
    <div className="app">
      <header>
        <h1>AgriToken Ledger</h1>
        <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>AI-Powered Agricultural Oracle on Base Sepolia</p>
        <div className="header-controls">
          <NetworkStatus />
          <WalletConnect />
        </div>
      </header>
      
      <main>
        {isConnected && address && (
          <div style={{
            padding: '15px',
            background: 'var(--card-glass)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid var(--border-glow)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.15)'
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              <strong style={{ color: 'var(--ai-green-glow)' }}>Connected:</strong> {address.slice(0, 10)}...{address.slice(-8)} | 
              <strong style={{ color: 'var(--ai-green-glow)' }}> Balance:</strong> {parseFloat(balance).toFixed(4)} ETH
            </p>
          </div>
        )}
        
        <BalanceWarning balance={balance} isConnected={isConnected} />
        
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
            <h2>New Agricultural Record</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Transparent AI Oracle Pipeline: Upload → Analyze → Verify → Hash</p>
            <TransactionFormEnhanced />
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
