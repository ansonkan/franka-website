import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import cn from 'clsx'
import { emberly } from '@/fonts'
import gsap from 'gsap'
import s from './index.module.scss'
import { useRect } from '@studio-freight/hamo'
import { useRef } from 'react'
import { useScroll } from '@/lib/use-scroll'
import { useWindowSize } from 'react-use'

interface IndexProps {
  selectedWorks: string[]
}

const Index: NextPage<IndexProps> = ({ selectedWorks }) => {
  const activeIndex = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [listRectRef, listRect] = useRect()

  const { height: windowHeight } = useWindowSize()

  const itemHeight = listRect.height / selectedWorks.length
  const total = listRect.height - itemHeight
  const scrollHeight = windowHeight + total

  useScroll(({ scroll }) => {
    if (!listRect || !listRef.current) return

    gsap.to(listRef.current, {
      translateY: (windowHeight - itemHeight) / 2 - scroll,
      ease: 'none',
      duration: 0,
    })

    const newActiveIndex = Math.round(scroll / itemHeight)

    if (newActiveIndex !== activeIndex.current) {
      gsap.to(listRef.current.children.item(newActiveIndex), {
        fontWeight: 900,
        duration: 0.3,
      })

      if (typeof activeIndex.current === 'number') {
        gsap.to(listRef.current.children.item(activeIndex.current), {
          fontWeight: 100,
          duration: 0.3,
        })
      }

      activeIndex.current = newActiveIndex
    }
  })

  return (
    <main className="page">
      <Head>
        <title>Franka Zweydinger</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={s.center} style={{ height: itemHeight || 'auto' }} />

      <div style={{ height: scrollHeight || 'auto' }} />

      <div
        ref={(node) => {
          listRef.current = node
          listRectRef(node)
        }}
        className={s.list}
      >
        {selectedWorks.map((title, i) => (
          <h2 key={i} className={cn(s.work, emberly.className)}>
            {title}
          </h2>
        ))}
      </div>
    </main>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = () => {
  return {
    props: {
      selectedWorks: [
        'Franka Zweydinger',
        'Hong Kong',
        'Sunset',
        'Island',
        'Very Loooooooooooong Title',
        'Testing out Ä ä Ö ö Ü ü ß',
        'Second time',
        'Hong Kong',
        'Sunset',
        'Island',
        'Very Loooooooooooong Title',
        'Testing out Ä ä Ö ö Ü ü ß',
      ],
    },
  }
}
