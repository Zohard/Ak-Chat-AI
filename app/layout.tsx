export const metadata = {
  title: 'Anime-Kun AI Orchestrator',
  description: 'AI-powered admin assistant for Anime-Kun',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
