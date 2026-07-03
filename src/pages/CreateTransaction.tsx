import { useWallet } from "@/hooks/useWallet";
import { BalanceWarning } from "@/components/BalanceWarning";
import { TransactionFormEnhanced } from "@/components/TransactionFormEnhanced";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function CreateTransactionPage() {
  const { balance, isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isConnected && (
        <div className="mb-6">
          <BalanceWarning balance={balance} isConnected={isConnected} />
        </div>
      )}

      <Card className="glass-card-purple border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-gradient-agri">
            <FileText className="w-5 h-5" />
            New Agricultural Record
          </CardTitle>
          <CardDescription>
            Transparent AI Pipeline: Upload → Analyze → Verify → Hash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFormEnhanced />
        </CardContent>
      </Card>
    </div>
  );
}
