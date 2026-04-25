import { useState } from "react";
import { Menu, X, LayoutDashboard, Search } from "lucide-react";
import { Button } from "@convex-directory/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@convex-directory/ui/components/sheet";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { authClient } from "@/lib/auth-client";
import { LocalizedLink } from "@/components/localized-link";
import { useIntlayer } from "react-intlayer";

// TODO: wire up to a real project search query
function SearchBox({ className = "", placeholder }: { className?: string; placeholder: string }) {
  const [query, setQuery] = useState("");

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        aria-label={placeholder}
      />
    </div>
  );
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const session = authClient.useSession();
  const content = useIntlayer("landing");
  const isAuthenticated = !!session.data;

  const navItems = [
    { name: content.navbar.directory.value, href: "#directory" },
    { name: content.navbar.submit.value, href: "/sign-up" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <LocalizedLink to="/" className="flex items-center gap-2 cursor-pointer">
          <Logo size={28} />
          <span className="font-bold text-base">{content.navbar.title}</span>
        </LocalizedLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop search */}
        <SearchBox
          className="hidden md:flex w-56 lg:w-72"
          placeholder={content.navbar.searchPlaceholder.value}
        />

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <LocaleSwitcher />
          <ModeToggle variant="ghost" />
          {isAuthenticated ? (
            <Button variant="outline" size="sm" asChild className="cursor-pointer">
              <LocalizedLink to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                {content.navbar.dashboard}
              </LocalizedLink>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <LocalizedLink to="/sign-in">{content.navbar.signIn}</LocalizedLink>
              </Button>
              <Button size="sm" asChild className="cursor-pointer">
                <LocalizedLink to="/sign-up">{content.navbar.submit}</LocalizedLink>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[340px] p-0 flex flex-col [&>button]:hidden"
          >
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Logo size={20} />
                <SheetTitle className="text-base font-semibold">{content.navbar.title}</SheetTitle>
                <div className="ml-auto flex items-center gap-1">
                  <LocaleSwitcher />
                  <ModeToggle variant="ghost" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Mobile search */}
              <SearchBox className="w-full" placeholder={content.navbar.searchPlaceholder.value} />

              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="border-t p-4 space-y-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <LocalizedLink to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Paste rows
                    {content.navbar.dashboard}
                  </LocalizedLink>
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <LocalizedLink to="/sign-in">{content.navbar.signIn}</LocalizedLink>
                  </Button>
                  <Button
                    size="lg"
                    asChild
                    className="cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <LocalizedLink to="/sign-up">{content.navbar.submitShort}</LocalizedLink>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
