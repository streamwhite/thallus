import { IntlProvider } from 'react-intl';
import { DownloadForm } from './download-form';
import { getUiMessages, resolveUiLocale } from './i18n';

export function App() {
  const locale = resolveUiLocale();
  return (
    <IntlProvider locale={locale} messages={getUiMessages(locale)}>
      <div className="p-4">
        <DownloadForm />
      </div>
    </IntlProvider>
  );
}
