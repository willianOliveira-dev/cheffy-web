import Link from "next/link";
import { Heart } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Logo } from "./logo";

const footerLinks = [
  { label: "Explorar receitas", href: "/receitas" },
  { label: "Categorias", href: "/#sabores-favoritos" },
  { label: "Destaques", href: "/#destaques" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr_0.7fr] md:items-start">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Logo />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Receitas com etapas organizadas, medidas claras, favoritos e ferramentas que ajudam antes, durante e depois do preparo.
            </p>
          </div>

          <nav aria-label="Links do rodapé">
            <h2 className="text-sm font-semibold text-foreground">Navegação</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Criador</h2>
            <div className="mt-4 flex gap-2">
              <Link
                href="https://github.com/willianOliveira-dev"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <FaGithub className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 Cheffy. Cozinha feita com contexto.</p>
          <p className="inline-flex items-center gap-1">
            Feito para quem salva receita e realmente cozinha
            <Heart className="h-3.5 w-3.5 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}
