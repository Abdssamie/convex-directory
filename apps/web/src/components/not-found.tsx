import { LocalizedLink } from "./localized-link";
import { useIntlayer } from "react-intlayer";

export function NotFoundComponent() {
  const content = useIntlayer("common");
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-4xl font-bold">{content.error.title.value}</h1>
      <p className="text-muted-foreground text-sm">{content.error.description.value}</p>
      <LocalizedLink to="/" className="text-primary hover:underline">
        Go back home
      </LocalizedLink>
    </div>
  );
}

export { NotFoundComponent as NotFound };
