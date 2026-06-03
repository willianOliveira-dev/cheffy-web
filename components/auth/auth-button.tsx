"use client";

import { useState } from "react";
import { FallbackImage as Image } from "@/components/shared/fallback-image";
import Link from "next/link";
import { BookOpen, Heart, LogIn, LogOut, PlusCircle, User } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full p-0 hover:bg-transparent"
              aria-label="Abrir menu do usuário"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Usuário"}
                  width={36}
                  height={36}
                  className="rounded-full border shadow-sm transition-shadow hover:shadow-md"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {session.user.name || session.user.email || "Minha conta"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/minhas-receitas">
                  <BookOpen data-icon="inline-start" />
                  As minhas receitas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/receitas/nova">
                  <PlusCircle data-icon="inline-start" />
                  Compartilhar receita
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/favoritos">
                  <Heart data-icon="inline-start" />
                  Os meus favoritos
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={(event) => event.preventDefault()}
                >
                  <LogOut data-icon="inline-start" />
                  Sair
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

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
