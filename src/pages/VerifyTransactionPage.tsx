import { VerifyTransaction } from "@/components/VerifyTransaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function VerifyTransactionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="glass-card-purple border-border/50 animate-fade-in">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-gradient-agri">
            <ShieldCheck className="w-5 h-5" />
            Verify Transaction
          </CardTitle>
          <CardDescription>
            Publicly verify any agricultural transaction on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyTransaction />
        </CardContent>
      </Card>
    </div>
  );
}
