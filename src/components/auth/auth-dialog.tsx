"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/services/auth/client";
import { buildAuthRedirectURL } from "@/utils/auth-redirect-url";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
      const redirectURL = buildAuthRedirectURL();

      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectURL,
        errorCallbackURL: redirectURL,
        newUserCallbackURL: redirectURL,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-2xl md:grid md:min-h-[22rem] md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-4 p-5 md:justify-center md:p-6">
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
        </div>

        <div className="relative hidden min-h-[22rem] md:block">
          <Image
            src="/images/banquet-image.png"
            alt="Mesa com pratos variados"
            fill
            priority
            sizes="(min-width: 768px) 24rem, 0px"
            className="object-cover"
          />
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 bg-background/80 shadow-sm backdrop-blur"
              aria-label="Fechar login"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-2 md:hidden"
            aria-label="Fechar login"
          >
            <X />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
