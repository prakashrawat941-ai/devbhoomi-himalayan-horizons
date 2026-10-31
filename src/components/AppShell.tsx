import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Compass, Map, Car, User, Menu, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const MENU = [
  { to: "/", label: "Home" },
  { to: "/villages", label: "Explore Hidden Villages" },
  { to: "/homestays", label: "Village Homestays" },
  { to: "/culture", label: "Uttarakhand Culture" },
  { to: "/aipan-art", label: "Aipan Art" },
  { to: "/nanda-devi-raj-jat", label: "Nanda Devi Raj Jat" },
  { to: "/golju-devta", label: "Golju Devta" },
  { to: "/dana-holi", label: "Dana Holi" },
  { to: "/holi-traditions", label: "Local Holi Traditions" },
  { to: "/trip-planner", label: "Trip Planner" },
  { to: "/workation", label: "Workation" },
  { to: "/cab", label: "Cab Requests" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, roles } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    setOpen(false);
    nav({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold text-primary">Devbhoomi</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ochre">Himalayan Horizons</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {MENU.slice(1, 4).concat(MENU.slice(9, 12)).map((m) => (
            <Link key={m.to} to={m.to} className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-primary" }}>
              {m.label.replace("Explore Hidden ", "")}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] max-w-sm overflow-y-auto bg-background">
              <SheetHeader><SheetTitle className="font-display text-xl">Live a little deeper.</SheetTitle></SheetHeader>
              <div className="mt-4 flex flex-col">
                {MENU.map((m) => (
                  <Link key={m.to} to={m.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-secondary" activeProps={{ className: "bg-secondary text-primary" }} activeOptions={{ exact: true }}>
                    {m.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-secondary">My dashboard</Link>
                    <Link to="/profile" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-secondary">Profile</Link>
                    {roles.includes("admin") && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium text-ochre hover:bg-secondary">Admin panel</Link>
                    )}
                    <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left font-medium text-destructive hover:bg-secondary"><LogOut className="size-4" /> Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-secondary">Login</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-secondary">Register</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/villages", label: "Explore", icon: Compass },
    { to: "/trip-planner", label: "Plan", icon: Map },
    { to: "/cab", label: "Cab", icon: Car },
    { to: user ? "/dashboard" : "/auth", label: user ? "Account" : "Login", icon: User },
  ] as const;
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={label} to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-1 pt-2 text-[11px] font-semibold text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro?: string; image?: string }) {
  if (image) {
    return (
      <section className="relative h-[52vh] min-h-80 overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="bg-dusk absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-8 text-snow fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
          {intro && <p className="mt-3 max-w-xl text-snow/85">{intro}</p>}
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-6xl px-5 pb-4 pt-8 fade-up">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-ochre">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>}
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-5 ${className}`}>{children}</div>;
}

export function SignInPrompt({ action }: { action: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <p className="font-medium">Sign in to {action}.</p>
      <div className="mt-4 flex justify-center gap-2">
        <Button asChild><Link to="/auth">Login</Link></Button>
        <Button asChild variant="outline"><Link to="/register">Register</Link></Button>
      </div>
    </div>
  );
}
