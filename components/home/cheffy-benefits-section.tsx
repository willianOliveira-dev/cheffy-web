import { BotMessageSquare, Heart, Printer, Timer, Utensils, Weight } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";

const benefits = [
  {
    title: "Ingredientes no lugar certo",
    description: "Chega de ficar rolando a tela para cima e para baixo. Se a receita tem massa, recheio e cobertura, tudo aparece separado para você focar no que vai usar naquele momento.",
    icon: Utensils,
  },
  {
    title: "Tempo sob controle",
    description: "Esqueça o olhômetro. O modo de preparo mostra o tempo estimado de cada etapa, então fica mais fácil saber quando avançar.",
    icon: Timer,
  },
  {
    title: "De olho na saúde",
    description: "Quer entender melhor o que vai no prato? A tabela nutricional segue o padrão atual do Brasil, com valores por porção e por 100 g.",
    icon: Weight,
  },
  {
    title: "Seu braço direito na cozinha",
    description: "Faltou um ingrediente ou quer mudar a medida? Pergunte sobre substituições e variações direto na receita, sem abrir outra aba no meio do preparo.",
    icon: BotMessageSquare,
  },
  {
    title: "Seu livro de receitas digital",
    description: "Gostou muito de um prato? Salve nos favoritos com sua conta Google e encontre tudo rápido quando for cozinhar de novo.",
    icon: Heart,
  },
  {
    title: "Direto para a bancada",
    description: "Se você prefere papel por perto, a versão de impressão deixa só o essencial: sem distrações, sem poluição visual, pronta para usar.",
    icon: Printer,
  },
];

export function CheffyBenefitsSection() {
  return (
    <section className="bg-muted/45 py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <SectionTitle>Como o Cheffy ajuda</SectionTitle>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            A receita fica organizada para você cozinhar de verdade: com passos claros, medidas que fazem sentido, seus pratos favoritos sempre à mão e um assistente para tirar dúvidas bem na hora que o aperto aperta.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="group rounded-2xl border border-border/70 bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
