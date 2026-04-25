import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { defaultLocale, getPrefix, validatePrefix } from "intlayer";
import { IntlayerProvider } from "react-intlayer";
import { NotFoundComponent } from "@/components/not-found";
import { useI18nHTMLAttributes } from "@/hooks/use-i18n-html-attributes";

export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params }) => {
    const localeParam = params.locale;

    const { isValid } = validatePrefix(localeParam);

    if (!isValid) {
      const { localePrefix: defaultPrefix } = getPrefix(defaultLocale);
      throw redirect({
        to: "/{-$locale}/404",
        params: { locale: defaultPrefix },
      });
    }
  },
  component: LocaleLayout,
  notFoundComponent: NotFoundComponent,
});

function LocaleLayout() {
  const params = Route.useParams();
  const locale = params.locale ?? defaultLocale;

  return (
    <IntlayerProvider locale={locale}>
      <LocaleDocumentAttributes />
      <Outlet />
    </IntlayerProvider>
  );
}

function LocaleDocumentAttributes() {
  useI18nHTMLAttributes();
  return null;
}
