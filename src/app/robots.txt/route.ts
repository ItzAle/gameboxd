import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://gameboxd-pi.vercel.app/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
