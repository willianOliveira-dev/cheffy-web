import { SectionTitle } from "@/components/shared/section-title";
import { CheckCircle2, ChefHat, Users } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="bg-muted py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center flex flex-col items-center">
          <SectionTitle className="items-center text-center">Como funciona o Cheffy</SectionTitle>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Uma comunidade apaixonada por culinária, compartilhando experiências e sabores reais.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mb-3 font-heading text-2xl font-bold text-foreground">
              Receitas Verificadas
            </h3>
            <p className="text-muted-foreground">
              Todas as receitas passam por um crivo da nossa comunidade para garantir que as medidas e passos funcionam na prática.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat className="h-10 w-10" />
            </div>
            <h3 className="mb-3 font-heading text-2xl font-bold text-foreground">
              Instruções Detalhadas
            </h3>
            <p className="text-muted-foreground">
              Passo a passo claro e conciso, com tempos de preparo, rendimento e substituições de ingredientes sugeridas por outros chefs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="mb-3 font-heading text-2xl font-bold text-foreground">
              Comunidade Ativa
            </h3>
            <p className="text-muted-foreground">
              Avalie, comente e salve suas receitas favoritas. Conecte-se com pessoas que compartilham da mesma paixão que você.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
