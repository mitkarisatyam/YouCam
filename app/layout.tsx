import type { Metadata } from 'next'
import './globals.css'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PageTransition } from '@/components/ui/PageTransition'

export const metadata: Metadata = {
  title: 'ContextMirror — Fashion & Beauty AI Simulator',
  description: 'See how your look works before the real world does. Skin AI + Apparel VTO + Context Stress Testing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="editorial-ivory" data-appearance="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('contextmirror_theme');
                  if (savedTheme) {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  }
                  const savedMode = localStorage.getItem('contextmirror_appearance');
                  if (savedMode) {
                    document.documentElement.setAttribute('data-appearance', savedMode);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[#191919] selection:text-white relative min-h-screen overflow-x-hidden">
        {/* Living Animated Background System */}
        <AnimatedBackground />

        {/* Page Content & Motion Transitions */}
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}
