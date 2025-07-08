import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'
import { SpeedInsights } from "@vercel/speed-insights/next"
import GoogleAnalytics from './components/GoogleAnalytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialissed`}>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        )}
        {children} <SpeedInsights /></body>
    </html>
  );
}
