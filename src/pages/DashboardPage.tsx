import { useWallet } from "@/hooks/useWallet";
import { TransactionList } from "@/components/TransactionList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="glass-card-purple border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-gradient-agri">
            <LayoutDashboard className="w-5 h-5" />
            Transaction Dashboard
          </CardTitle>
          <CardDescription>
            {isConnected
              ? "Your verified agricultural transactions on the blockchain"
              : "Connect your wallet to view transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList />
        </CardContent>
      </Card>
    </div>
  );
}
