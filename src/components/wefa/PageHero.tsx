export function PageHero({
  eyebrow,
  title,
  image,
  alt = "",
}: {
  eyebrow: string;
  title: string;
  image: string;
  alt?: string;
}) {
  return (
    <section className="relative flex min-h-[52vh] items-center justify-center overflow-hidden sm:min-h-[58vh]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background via-background/75 to-transparent sm:h-44" />
      <div className="relative px-5 text-center">
        <p className="hero-rise eyebrow mb-5 inline-block bg-primary px-3 py-1 text-primary-foreground">
          {eyebrow}
        </p>
        <h1 className="hero-rise hero-rise-delay text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.75rem]">
          <span className="bg-primary px-4 py-1 text-primary-foreground">{title}</span>
        </h1>
      </div>
    </section>
  );
}
