import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CartButton } from "@/lib/cart";
import { useStorefront } from "@/lib/storefront";

type NavItem =
  | {
      label: string;
      href: string;
      to: "/" | "/products" | "/about" | "/contact" | "/solutions" | "/downloads";
    }
  | { label: string; href: string; to: null };

const nav: NavItem[] = [
  { label: "Soluciones", href: "/solutions", to: "/solutions" },
  { label: "Productos", href: "/products", to: "/products" },
  { label: "Proyectos", href: "/#projects", to: null },
  { label: "Descargas", href: "/downloads", to: "/downloads" },
  { label: "Nosotros", href: "/about", to: "/about" },
  { label: "Contacto", href: "/contact", to: "/contact" },
];

export function Header({ solid = false }: { solid?: boolean }) {
  const { categories } = useStorefront();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!productsRef.current?.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const opaque = solid || scrolled || open || productsOpen;

  return (
    <>
      {solid ? <div className="h-[76px]" aria-hidden="true" /> : null}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out ${
          opaque
            ? "border-border bg-background/95 shadow-sm backdrop-blur-sm"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 lg:px-10">
          <Link to="/" aria-label="Inicio REDEX">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) =>
              item.label === "Productos" && item.to ? (
                <div
                  key={item.label}
                  ref={productsRef}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <div className="inline-flex items-center gap-1">
                    <Link
                      to={item.to}
                      className="text-[0.95rem] text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Categorías de productos"
                      aria-expanded={productsOpen}
                      onClick={() => setProductsOpen((value) => !value)}
                      className="text-primary"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${productsOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  {productsOpen ? (
                    <div className="absolute left-0 top-full z-50 min-w-[220px] border border-border bg-background py-2 shadow-lg">
                      <Link
                        to="/products"
                        search={{ categoria: undefined }}
                        onClick={() => setProductsOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary"
                      >
                        Todos los productos
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to="/products"
                          search={{ categoria: category.slug }}
                          onClick={() => setProductsOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="inline-flex items-center gap-1 text-[0.95rem] text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1 text-[0.95rem] text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menú"
              onClick={() => setOpen(!open)}
              className="text-primary lg:hidden"
            >
              {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
            <CartButton />
          </div>
        </div>

        {open && (
          <div className="mx-5 rounded-md bg-background p-5 shadow-lg lg:hidden">
            <nav className="flex flex-col gap-4">
              {nav.map((item) =>
                item.label === "Productos" && item.to ? (
                  <div key={item.label} className="flex flex-col gap-2">
                    <Link
                      to={item.to}
                      search={{ categoria: undefined }}
                      onClick={() => setOpen(false)}
                      className="text-base text-foreground"
                    >
                      {item.label}
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to="/products"
                        search={{ categoria: category.slug }}
                        onClick={() => setOpen(false)}
                        className="pl-4 text-sm text-muted-foreground"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="text-base text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-base text-foreground"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
