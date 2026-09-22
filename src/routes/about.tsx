import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { useStorefront } from "@/lib/storefront";
import heroAbout from "@/assets/hero-about.webp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Nosotros — REDEX" },
      {
        name: "description",
        content:
          "REDEX comercializa tubería y accesorios de PP-R para instalaciones de agua en obra.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { name } = useStorefront();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Nosotros" image={heroAbout} alt="" />

      <main>
        <section className="bg-card py-20">
          <RiseIn className="mx-auto max-w-4xl px-5 text-center lg:px-10">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {name} vende tubería y accesorios de PP-R para instalaciones de agua en
              edificaciones. El catálogo está pensado para obra: piezas por medida, precio por
              unidad y descuento cuando el pedido llega al monto indicado.
            </p>
          </RiseIn>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl space-y-12 px-5 lg:px-10">
            {[
              {
                title: "Tubería y conexiones",
                body:
                  "El surtido incluye tubería PP-R y accesorios de termofusión, como codos, tees y reducciones, para armar la red de agua de un proyecto.",
              },
              {
                title: "Para instaladores y constructores",
                body:
                  "El pedido se prepara en el carrito con la cantidad de cada variante. REDEX lo recibe para confirmar disponibilidad y coordinar la entrega.",
              },
              {
                title: "Fichas en el producto",
                body:
                  "Cuando un producto tiene ficha técnica, el dibujo y la tabla aparecen en su página, junto con el enlace si está publicado.",
              },
            ].map((item, i) => (
              <RiseIn key={item.title} delay={riseStagger(i, 90, 6)}>
                <Article title={item.title} body={item.body} />
              </RiseIn>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Article({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-primary pl-6">
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
