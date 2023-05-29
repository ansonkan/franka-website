import { ImageLoaderProps } from 'next/image'

export default function contentfulLoader({
  src,
  quality,
  width,
}: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('fm', 'webp')
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', quality?.toString() || '55')
  return url.href
}
