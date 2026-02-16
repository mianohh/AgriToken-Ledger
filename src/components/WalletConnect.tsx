import { useWallet } from '../hooks/useWallet';

export function WalletConnect() {
  const { address, isConnected, balance, connect, disconnect, isLoading, error } = useWallet();

  if (!window.ethereum) {
    return (
      <div className="wallet-install">
        <p>MetaMask not detected</p>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          Install MetaMask
        </a>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
        <span>{parseFloat(balance).toFixed(4)} ETH</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div className="wallet-disconnected">
      <button onClick={connect} disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
