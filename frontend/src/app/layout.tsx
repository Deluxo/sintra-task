import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../components/theme-context'

export const metadata: Metadata = {
  title: 'Social Media Post Generator',
  description: 'Generate social media posts for your products',
}

/**
 * Resolves the theme onto <html> before the browser paints, so the page never
 * flashes the wrong one. Inline and render-blocking on purpose: doing this in
 * a React effect would paint the default theme first.
 *
 * With no stored choice (or an explicit "system"), it follows the OS
 * preference, so a light system paints light and a dark system paints dark.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark;
    if (stored === 'light') {
      dark = false;
    } else if (stored === 'dark') {
      dark = true;
    } else {
      // No stored choice, or "system": follow the OS preference.
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.documentElement.classList.toggle('dark', dark);
  } catch (error) {
    /* Private mode with storage disabled: fall back to the browser preference. */
    document.documentElement.classList.toggle(
      'dark',
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
})();
`.trim()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // The theme script mutates this element's class list before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}