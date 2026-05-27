import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Players - 스포츠 용품 중고거래',
  description: '스포츠 용품 전문 중고거래 플랫폼',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
        <Script
          id="maze-snippet"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function (m, a, z, e) {
  var s, t, u, v;
  try { t = m.sessionStorage.getItem('maze-us'); } catch (err) {}
  if (!t) { t = new Date().getTime(); try { m.sessionStorage.setItem('maze-us', t); } catch (err) {} }
  u = document.currentScript || (function () { var w = document.getElementsByTagName('script'); return w[w.length - 1]; })();
  v = u && u.nonce;
  s = a.createElement('script');
  s.src = z + '?apiKey=' + e;
  s.async = true;
  if (v) s.setAttribute('nonce', v);
  a.getElementsByTagName('head')[0].appendChild(s);
  m.mazeUniversalSnippetApiKey = e;
})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', '7f2d00cb-3f72-4a68-9982-cc7799ffec96');`,
          }}
        />
      </body>
    </html>
  )
}
