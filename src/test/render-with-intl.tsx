import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';

/**
 * Renders a component inside the same translation context the app provides in
 * `app/(site)/(public)/(localized)/[locale]/layout.tsx`.
 *
 * Components calling `useTranslations` throw without a surrounding
 * `NextIntlClientProvider`. Using the real `messages/en.json` rather than a
 * stub keys the assertions to the strings the app actually ships, so a deleted
 * or renamed translation key fails the test instead of passing against a mock.
 */
export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
