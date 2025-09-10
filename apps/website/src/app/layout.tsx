import type { Metadata } from 'next'
import '@primer/react-brand/lib/css/main.css'
import '@primer/react-brand/fonts/fonts.css'

import './index.css'
import { Navigation } from './components'

export const metadata: Metadata = {
  title: 'Sophosic',
  description: 'Sophosic Documentation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-color-mode="dark">
      <body>
        <Navigation />
        {children}
        {/* Plausible analytics (optional). Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to enable */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </body>
    </html>
  )
} 