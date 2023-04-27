import { GetStaticProps, NextPage } from 'next'
import { useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import contentfulLoader from '@/lib/contentful-loader'
// import Link from 'next/link'
import { memo } from 'react'
import cn from 'clsx'
import gsap from 'gsap'
import { emberly } from '@/fonts'
import s from './index.module.scss'
import { random, randomInt } from '@/lib/maths'

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

interface Collection {
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
  }
}

interface IndexProps {
  selectedWorks: Collection[]
}

const Index: NextPage<IndexProps> = ({ selectedWorks }) => {
  const landingSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!landingSectionRef.current) return

    const createPreview = async () => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        if (!landingSectionRef.current) return

        const containerW = landingSectionRef.current.clientWidth
        const minW = containerW / 6
        const maxW = containerW / 4

        const work = selectedWorks[randomInt(0, selectedWorks.length)]
        const w = randomInt(minW, maxW)

        const img = document.createElement('img')
        img.width = w
        img.height = w * (work.thumbnail.height / work.thumbnail.width)
        img.className = s.preview
        img.onload = () => resolve(img)
        img.onerror = (event) => reject(event)
        img.src = contentfulLoader({
          src: work.thumbnail.url,
          width: w * 2,
        })
      })
    }

    const fadeDuration = 1
    const translateDuration = 3
    const translateDistance = 100

    const loop = () => {
      createPreview().then((img) => {
        if (!landingSectionRef.current) return

        const containerW = landingSectionRef.current.clientWidth
        const containerH = landingSectionRef.current.clientHeight

        landingSectionRef.current?.appendChild(img)

        // img.style.translate = `translateY(100px)`
        const y = random(
          containerH / -2 + img.height / 2,
          containerH / 2 - img.height / 2
        )
        gsap
          .timeline({
            onComplete: () => {
              landingSectionRef.current?.removeChild(img)
            },
          })
          .fromTo(img, { opacity: 0 }, { opacity: 1, duration: fadeDuration })
          .fromTo(
            img,
            {
              x: random(
                containerW / -2 + img.width / 2,
                containerW / 2 - img.width / 2 - translateDistance
              ),
              y,
              // x: containerW / -2 + img.width / 2,
              // x: containerW / 2 - img.width / 2 - 100,
              // x: img.width / 2,
            },
            {
              x: `+=${translateDistance}`,
              duration: translateDuration,
              ease: 'linear',
            },
            '<'
          )
          .to(img, { opacity: 0, duration: 1 }, `-=${fadeDuration}`)
      })
    }

    // to fire this on mount but workaround multi renders of this `useEffect`
    const timeout = setTimeout(loop, 0)
    const interval = setInterval(
      loop,
      1000 * (translateDuration + fadeDuration)
      // 1000
    )

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [selectedWorks])

  // const works = useMemo(() => selectedWorks, [])

  return (
    <main>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className={s.landing} ref={landingSectionRef}>
        <div className={cn(emberly.className, s.title)}>
          <div>Photographer</div>
          <div>+ Designer</div>
        </div>

        {/* <Previews works={works} /> */}
      </section>
    </main>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST', // GraphQL *always* uses POST requests!
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`, // add our access token header
      },
      // send the query we wrote in GraphiQL as a string
      body: JSON.stringify({
        // all requests start with "query: ", so we'll stringify that for convenience
        query: `
        {
          collectionCollection {
            items {
              sys {
                id
              }
              title
              thumbnail {
                width
                height
                url
              }
            }
          }
        }
      `,
      }),
    }
  )

  const data: {
    data: {
      collectionCollection: {
        items: Array<{
          sys: { id: string }
          title: string
          thumbnail: {
            width: number
            height: number
            url: string
          }
        }>
      }
    }
  } = await res.json()

  return {
    props: {
      selectedWorks: data.data.collectionCollection.items,
    },
  }
}

// interface PreviewProps {
//   work: Collection
//   container: HTMLElement
// }

// function Preview({ work: { title, thumbnail }, container }: PreviewProps) {
//   const isReady = useRef(false)
//   const

//   const w = useMemo(() => {
//     const minW = container.clientWidth / 8
//     const maxW = container.clientWidth / 4
//     return randomInt(minW, maxW)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   useEffect(() => {}, [isReady])

//   return (
//     <Image
//       src={thumbnail.url}
//       width={w}
//       height={w * (thumbnail.height / thumbnail.width)}
//       alt={title}
//       onLoad={() => (isReady.current = true)}
//     />
//   )
// }
