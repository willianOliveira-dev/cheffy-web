"use client";

import { useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { authClient } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full animate-pulse" disabled>
        <User className="h-5 w-5 text-muted-foreground" />
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "Usuário"}
            width={36}
            height={36}
            className="rounded-full border shadow-sm"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              <LogOut data-icon="inline-start" />
              Sair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Deseja sair da sua conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Você precisará entrar novamente para favoritar receitas e conversar com a IA.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => authClient.signOut()}>
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={() => setIsAuthOpen(true)}
      >
        <LogIn data-icon="inline-start" />
        Entrar
      </Button>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}
