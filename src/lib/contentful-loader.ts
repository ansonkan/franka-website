import { ImageLoaderProps } from 'next/image'

export default function contentfulLoader(props: ImageLoaderProps) {
  return getURL(props).href
}

export function squareLoader(props: ImageLoaderProps) {
  const url = getURL(props)
  url.searchParams.set('h', props.width.toString())
  url.searchParams.set('fit', 'fill')
  return url.href
}

const DEFAULT_QUALITY_MOBILE = '40'
const DEFAULT_QUALITY_DESKTOP = '60'

function getURL({ src, quality, width }: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('fm', 'webp')
  url.searchParams.set('w', width.toString())
  url.searchParams.set(
    'q',
    quality?.toString() ||
      (width < 800 ? DEFAULT_QUALITY_MOBILE : DEFAULT_QUALITY_DESKTOP)
  )

  return url
}
