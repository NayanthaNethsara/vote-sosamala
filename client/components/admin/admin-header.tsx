import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { adminSocialLinks, adminSupportLinks } from "@/config/side-config";

export function AdminHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <h1 className="text-sm font-bold uppercase tracking-tight">
          Administrator
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {adminSupportLinks.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              asChild
              size="sm"
              className="hidden md:flex text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              <a
                href={item.url}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={item.title}
                title={item.title}
              >
                {item.title}
              </a>
            </Button>
          ))}

          {adminSocialLinks.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              asChild
              size="icon"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <a
                href={item.url}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={item.title}
                title={item.title}
              >
                <item.icon className="size-5" />
              </a>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
