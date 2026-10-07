import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../domain/theme/context'
import { PostsProvider } from '../domain/post/context'

export const metadata: Metadata = {
  title: 'Social Media Post Generator',
  description: 'Generate social media posts for your products',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PostsProvider>{children}</PostsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
