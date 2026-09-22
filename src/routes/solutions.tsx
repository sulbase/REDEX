import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import heroSolutions from "@/assets/hero-solutions.webp";
import pipes1 from "@/assets/solutions-pipes-1.webp";
import pipes2 from "@/assets/solutions-pipes-2.webp";
import pipesMaterial from "@/assets/solutions-material.webp";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Soluciones — REDEX" },
      {
        name: "description",
        content:
          "Tubería y accesorios de PP-R de REDEX para agua potable, agua caliente e instalaciones sanitarias.",
      },
    ],
  }),
  component: SolutionsPage,
});

const qualities = [
  {
    title: "Tubería PP-R",
    body: "La tubería de polipropileno se usa en redes de agua fría y caliente. En el catálogo cada medida tiene su precio y, cuando aplica, su descuento por monto.",
    image: pipes1,
    contain: false,
    flip: false,
  },
  {
    title: "Accesorios de termofusión",
    body: "Codos, tees, reducciones y demás conexiones se eligen por diámetro para armar la red. La ficha del producto muestra el dibujo y la tabla de medidas cuando está publicada.",
    image: pipes2,
    contain: false,
    flip: true,
  },
  {
    title: "Material de calidad",
    body: "El PP-R resiste presión, temperatura y golpes en obra. Las uniones por termofusión quedan selladas en toda la red.",
    image: pipesMaterial,
    contain: true,
    flip: false,
  },
];

const applications = [
  {
    title: "Agua potable",
    body: "El agua potable es agua fresca hasta 25 °C para beber, cocinar y preparar alimentos. Un suministro de calidad, seguro y suficiente es esencial en el día a día: consumo, higiene, limpieza y riego. La tubería PP-R de REDEX está pensada para llevar esa red con uniones selladas por termofusión.",
  },
  {
    title: "Agua caliente",
    body: "El agua caliente sanitaria se calienta hasta unos 60 °C y sube por las columnas hasta duchas, lavamanos y cocina. Esa instalación debe equilibrar calidad del agua, higiene, confort y economía. REDEX ofrece tubería y accesorios para armar ese circuito con la medida de cada variante.",
  },
  {
    title: "Instalaciones sanitarias",
    body: "En aparatos sanitarios, lavado y riego no siempre se exige calidad de agua potable, pero la red sí debe ser fiable. Las conexiones por termofusión mantienen el ramal cerrado y listo para obra, con las piezas del catálogo.",
  },
];

function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Soluciones" image={heroSolutions} alt="" />

      <main>
        <section className="bg-background py-20">
          <RiseIn className="mx-auto max-w-3xl px-5 text-center lg:px-10">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-primary sm:text-3xl">
              Asegura la confiabilidad
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
              REDEX reúne tubería y accesorios de PP-R para instalaciones de agua en edificaciones,
              con foco en durabilidad y calidad en obra.
            </p>
          </RiseIn>
        </section>

        <section className="pb-20">
          <div className="mx-auto flex max-w-[1100px] flex-col gap-16 px-5 lg:gap-20 lg:px-10">
            {qualities.map((item, i) => (
              <RiseIn key={item.title} delay={riseStagger(i, 90, 6)}>
                <article
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                    item.flip ? "lg:[&>div:first-child]:order-2" : ""
                  }`}
                >
                <div className={item.flip ? "lg:pl-4" : "lg:pr-4"}>
                  <h3 className="text-xl font-semibold uppercase tracking-[0.06em] text-primary sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                <div className="overflow-hidden rounded-sm rounded-br-[2.75rem] border border-primary bg-white">
                  <img
                    src={item.image}
                    alt=""
                    className={
                      item.contain
                        ? "mx-auto h-[220px] w-auto max-w-full object-contain sm:h-[260px]"
                        : "h-[220px] w-full object-cover sm:h-[260px]"
                    }
                  />
                </div>
              </article>
              </RiseIn>
            ))}
          </div>
        </section>

        <section className="bg-[#2a2a2a] py-20 text-white">
          <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
            <RiseIn>
              <h2 className="text-center">
              <span className="inline-block bg-primary px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground sm:text-base">
                Aplicaciones
              </span>
              </h2>
            </RiseIn>
            <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
              {applications.map((item, i) => (
                <RiseIn key={item.title} delay={riseStagger(i)}>
                  <div>
                  <h3 className="text-lg font-semibold uppercase tracking-[0.06em] sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-white/75">{item.body}</p>
                  </div>
                </RiseIn>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <RiseIn className="mx-auto max-w-4xl px-5 text-center lg:px-10">
            <h2 className="text-3xl font-semibold sm:text-4xl">Arma el pedido</h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              Elige las variantes en el catálogo y envía el pedido con tu nombre, teléfono, correo y
              cédula o RUC.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 rounded-full border border-primary px-7 py-3 text-[0.95rem] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Contacto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </RiseIn>
        </section>
      </main>

      <Footer />
    </div>
  );
}
