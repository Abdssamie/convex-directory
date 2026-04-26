import { useState, useEffect } from "react";
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
import { useLandingContent } from "./content";
import { CommandSearch } from "@/components/command-search";

function SearchTrigger({
  className = "",
  placeholder,
  onClick,
}: {
  className?: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center group cursor-text ${className}`}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      <div className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-muted-foreground flex items-center justify-between hover:bg-accent/50 transition-colors text-left">
        <span>{placeholder}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </button>
  );
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const session = authClient.useSession();
  const content = useLandingContent();
  const isAuthenticated = !!session.data;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { name: content.navbar.directory, to: "/" },
    { name: content.navbar.submit, to: "/dashboard/submit" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <LocalizedLink to="/" className="flex items-center gap-2 cursor-pointer">
          <Logo size={28} />
          <span className="whitespace-nowrap font-bold text-base">{content.navbar.title}</span>
        </LocalizedLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <LocalizedLink
              key={item.name}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {item.name}
            </LocalizedLink>
          ))}
        </nav>

        {/* Desktop search */}
        <SearchTrigger
          className="hidden md:flex w-56 lg:w-72"
          placeholder={content.navbar.searchPlaceholder}
          onClick={() => setSearchOpen(true)}
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
                <LocalizedLink to="/dashboard/submit">{content.navbar.submit}</LocalizedLink>
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
              <SearchTrigger
                className="w-full"
                placeholder={content.navbar.searchPlaceholder}
                onClick={() => {
                  setIsOpen(false);
                  setSearchOpen(true);
                }}
              />

              {navItems.map((item) => (
                <LocalizedLink
                  key={item.name}
                  to={item.to}
                  className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </LocalizedLink>
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
                    <LocalizedLink to="/dashboard/submit">
                      {content.navbar.submitShort}
                    </LocalizedLink>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
