import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import cn from 'clsx'
import gsap from 'gsap'
import { robotoFlex } from '@/fonts'
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

    if (isNaN(newActiveIndex)) return

    if (newActiveIndex !== activeIndex.current) {
      activateTitle(listRef.current.children.item(newActiveIndex), 'on')

      if (typeof activeIndex.current === 'number') {
        activateTitle(listRef.current.children.item(activeIndex.current), 'off')
      }

      activeIndex.current = newActiveIndex
    }
  })

  return (
    <main className="page">
      <Head>
        <title>Franka</title>
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
          <h2
            key={i}
            className={cn(s.work, robotoFlex.className)}
            onMouseEnter={(event) => {
              hoverTitle(event.target, 'on')
            }}
            onMouseLeave={(event) => {
              hoverTitle(event.target, 'off')
            }}
          >
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
        'Franka',
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

const PARAMS = {
  activate: {
    on: {
      duration: 0.15,
      '--wght': 1000,
      '--wdth': 100,
      opacity: 1,
    },
    off: {
      duration: 0.3,
      '--wght': 100,
      '--wdth': 25,
      opacity: 0.3,
    },
  },
  hover: {
    on: {
      duration: 0.3,
      '--slnt': -10,
    },
    off: {
      duration: 0.3,
      '--slnt': 0,
    },
  },
}

function activateTitle(target: Element | null, type: 'on' | 'off') {
  gsap.to(target, {
    ...PARAMS.activate[type],
  })
}

function hoverTitle(target: Element | EventTarget | null, type: 'on' | 'off') {
  gsap.to(target, {
    ...PARAMS.hover[type],
  })
}
