"use client";
import { useState, useMemo, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const searchItems = [
  { label: "Home", path: "/", group: "Pages", description: "Go to homepage" },
  {
    label: "About Us",
    path: "/about",
    group: "Pages",
    description: "Learn about DevAIHumanizer",
  },
  {
    label: "Refund Policy",
    path: "/refund-policy",
    group: "Legal",
    description: "Our no-refund policy",
  },
  {
    label: "Pricing Plans",
    path: "/pricing",
    group: "Pages",
    description: "View pricing & plans",
  },
  {
    label: "Blog",
    path: "/blog",
    group: "Pages",
    description: "Read our latest articles",
  },
  {
    label: "Contact",
    path: "/contact",
    group: "Pages",
    description: "Get in touch with us",
  },
  {
    label: "Login / Sign Up",
    path: "/login",
    group: "Account",
    description: "Access your account",
  },
  {
    label: "Profile",
    path: "/profile",
    group: "Account",
    description: "View your profile & usage",
  },
  {
    label: "History",
    path: "/history",
    group: "Account",
    description: "View humanization history",
  },
  {
    label: "AI Humanizer Tool",
    path: "/#humanizer",
    group: "Features",
    description: "Start humanizing text",
  },
  {
    label: "AI Detector Bypass",
    path: "/#detectors",
    group: "Features",
    description: "See supported detectors",
  },
  {
    label: "How It Works",
    path: "/#how-it-works",
    group: "Features",
    description: "Understand our process",
  },
  {
    label: "FAQ",
    path: "/#faq",
    group: "Features",
    description: "Frequently asked questions",
  },
  {
    label: "Reviews",
    path: "/reviews",
    group: "Pages",
    description: "Read user reviews",
  },
  {
    label: "Careers",
    path: "/careers",
    group: "Pages",
    description: "Join our team",
  },
  {
    label: "Sitemap",
    path: "/sitemap",
    group: "Pages",
    description: "View all pages",
  },
];

const SiteSearch = forwardRef<HTMLButtonElement>((_, ref) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const grouped = useMemo(() => {
    const groups: Record<string, typeof searchItems> = {};
    searchItems.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      router.push(route || "/");
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Search site"
      >
        <Search className="w-4 h-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, features..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(grouped).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelect(item.path)}
                  className="cursor-pointer"
                >
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
});

SiteSearch.displayName = "SiteSearch";

export default SiteSearch;
