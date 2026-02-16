interface BalanceWarningProps {
  balance: string;
  isConnected: boolean;
}

export function BalanceWarning({ balance, isConnected }: BalanceWarningProps) {
  const balanceNum = parseFloat(balance);
  
  if (!isConnected || balanceNum >= 0.01) {
    return null;
  }

  return (
    <div className="balance-warning">
      <p>⚠️ Low balance: {balanceNum.toFixed(4)} ETH</p>
      <p>Get testnet ETH from:</p>
      <ul>
        <li><a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer">Alchemy Sepolia Faucet</a></li>
        <li><a href="https://www.infura.io/faucet/sepolia" target="_blank" rel="noopener noreferrer">Infura Faucet</a></li>
      </ul>
    </div>
  );
}
