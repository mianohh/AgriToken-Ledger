import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";

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
    <Alert className="border-amber-500/50 bg-amber-500/5">
      <AlertTriangle className="h-4 w-4 text-amber-400" />
      <AlertTitle className="text-amber-400">Low Balance</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Your balance is {balanceNum.toFixed(4)} ETH. Get testnet ETH from:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1"
            >
              Alchemy Base Sepolia Faucet
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="https://docs.base.org/docs/tools/network-faucets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1"
            >
              Base Faucets
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
