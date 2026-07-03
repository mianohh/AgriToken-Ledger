import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center">
      <Card className="glass-card-purple border-border/50">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-display text-foreground">404</h1>
            <p className="text-muted-foreground">Page not found</p>
          </div>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
