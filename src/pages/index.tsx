import { GetStaticProps, NextPage } from 'next'
import { Default } from '@/layouts/default'
import Head from 'next/head'
import cn from 'clsx'
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
  const [wrapperRectRef, wrapperRect] = useRect()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { height: windowHeight } = useWindowSize()

  const baseHeight = windowHeight + wrapperRect.height

  useScroll(({ scroll }) => {
    const children = wrapperRef.current?.children[0].children
    if (!wrapperRect || !children) return

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const cards = [...children]

    gsap.to(cards, {
      y: -scroll,
      stagger: 0.01,
      ease: 'none',
      duration: 0.01,
    })
  })

  return (
    <Default>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ height: baseHeight || 0 }} ref={wrapperRef}>
        <div
          ref={wrapperRectRef}
          // ref={wrapperRef}
          className={cn(s.wrapper)}
          style={{
            transform: `translateY(${
              windowHeight / 2 - wrapperRect.height / selectedWorks.length / 2
            }px)`,
          }}
        >
          {selectedWorks.map((work, i) => (
            <h2 key={i} className={cn(s.work)}>
              {work}
            </h2>
          ))}
        </div>
      </div>
    </Default>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = () => {
  return {
    props: {
      selectedWorks: [
        'First time',
        'Hong Kong',
        'Sunset',
        'Island',
        'Very Loooooooooooong Title',
        'Testing out ü',
        'First time',
        'Hong Kong',
        'Sunset',
        'Island',
        'Very Loooooooooooong Title',
        'Testing out ü',
      ],
    },
  }
}
