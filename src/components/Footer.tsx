import { Sprout } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agri-green to-agri-dark flex items-center justify-center">
              <Sprout className="w-4 h-4 text-agri-dark" />
            </div>
            <span className="font-display text-lg font-bold text-gradient-agri">
              AgriToken Ledger
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Blockchain-Verified Agriculture</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Base Sepolia</span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AgriToken Ledger. Blockchain-verified agricultural transactions.</p>
        </div>
      </div>
    </footer>
  );
}
