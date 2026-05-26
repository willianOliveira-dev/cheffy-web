"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export function AuthDialog({
  open,
  onOpenChange,
  title = "Entre para continuar",
  description = "Faça login com sua conta Google para salvar receitas e acessar sua experiência personalizada.",
}: AuthDialogProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-11 justify-center gap-2"
          disabled={isSigningIn}
          onClick={handleGoogleSignIn}
        >
          {isSigningIn ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <FcGoogle data-icon="inline-start" />
          )}
          Autenticar com Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
