import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import vi from '../../messages/vi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      vi: { translation: vi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
