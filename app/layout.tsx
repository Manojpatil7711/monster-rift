import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Monster Rift ⚔️","description":"Battle monsters, defeat bosses, become legendary."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}