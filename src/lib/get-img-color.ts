import { Asset } from '@/gql/graphql'
import { getPlaiceholder } from 'plaiceholder'

const colorMap: Record<string, string> = {}

export const getImgColor = async (url: string) => {
  if (!colorMap[url]) {
    const imageRes = await fetch(`${url}?w=10&q=75`)
    // Convert the HTTP result into a buffer
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    colorMap[url] = (await getPlaiceholder(buffer)).color.hex
  }

  return colorMap[url]
}

export const fillColorMap = async (
  photos: Array<Pick<Asset, 'url'> | null> | undefined | null,
  colorMap: Record<string, string>
) => {
  const promises = (photos || []).map(
    (p) =>
      new Promise<void | { color: string; url: string | undefined | null }>(
        (resolve) => {
          if (!p?.url) return resolve()

          getImgColor(p.url).then((color) => resolve({ url: p.url, color }))
        }
      )
  )

  const results = await Promise.all(promises)

  for (const result of results) {
    if (!result || !result.url) continue

    colorMap[result.url] = result.color
  }
}
