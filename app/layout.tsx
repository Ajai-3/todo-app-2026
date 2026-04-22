import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Emerald Todo — Productivity Dashboard',
  description: 'Powerful local-first todo app with heatmaps, spider graphs, timers and recurring tasks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-[#0f172a] text-slate-100 antialiased min-h-screen">
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
