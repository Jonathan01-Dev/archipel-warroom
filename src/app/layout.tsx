import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Archipel War Room",
  description: "Tableau de bord hackathon en temps réel",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="scanlines">{children}</body>
    </html>
  )
}
