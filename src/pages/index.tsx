import { GetStaticProps, NextPage } from 'next'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SelectedProjectsCollectionQuery } from '@/gql/graphql'
import { getSelectedProjects } from '@/lib/queries/ssg-queries'
import gsap from 'gsap'
import { mapRange } from '@/lib/maths'
import s from './index.module.scss'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'

interface IndexProps {
  projects: NonNullable<
    NonNullable<
      NonNullable<
        SelectedProjectsCollectionQuery['selectedProjectsCollection']
      >['items'][number]
    >['projectsCollection']
  >['items']
}

const Index: NextPage<IndexProps> = ({ projects }) => {
  const [lenis] = useStore(({ lenis, setLenis }) => [lenis, setLenis])

  const scrollDivRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLDivElement>(null)
  const visibleProjectsRef = useRef<
    { projectElement: HTMLDivElement; previewsElement: HTMLDivElement }[]
  >([])

  useEffect(() => {
    lenis?.stop()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            if (
              visibleProjectsRef.current.findIndex(
                (p) => p.projectElement === target
              ) > -1
            ) {
              return
            }

            visibleProjectsRef.current.push({
              projectElement: target as HTMLDivElement,
              previewsElement: target.querySelector(
                `.${s.previews}`
              ) as HTMLDivElement,
            })
          } else {
            visibleProjectsRef.current = visibleProjectsRef.current.filter(
              (project) => project.projectElement !== target
            )
          }
        })
      },
      {
        root: null,
        threshold: [0, 1],
      }
    )

    gsap.utils.toArray<HTMLDivElement>(`.${s.project}`).forEach((project) => {
      observer.observe(project)
    })

    lenis?.start()

    return () => {
      observer.disconnect()
    }
  }, [lenis])

  useEffect(() => {
    const onResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight

      gsap.set(scrollDivRef.current, {
        height: isLandscape
          ? window.innerHeight +
            Math.max((projects.length || 0) - 1, 0) * (window.innerHeight / 2)
          : 0,
      })

      if (!isLandscape) {
        gsap.to(baseRef.current, { x: 0 })
      }
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [projects.length])

  useScroll(
    ({ scroll }) => {
      const isLandscape = window.innerWidth > window.innerHeight

      if (isLandscape) {
        gsap.to(baseRef.current, { x: -scroll })
        // return
      }

      const axis = isLandscape ? window.innerHeight : window.innerWidth

      const gap = axis * 0.02
      const squareSize = axis / 2 - gap
      const start = -(squareSize / 2)
      const end = -(3.5 * squareSize + 3 * gap)
      const distance = Math.abs(end - start)

      visibleProjectsRef.current.forEach(({ previewsElement }) => {
        /**
         * Note:
         * [1, 2, 3, 1, 2, 3] can reset at index 4 but
         * [1, 2, 1, 2, 1, 2] cannot.
         *
         * So this is an easy workaround, since the max
         * preview item count is still 3 on Contentful.
         */
        const _distance =
          previewsElement.dataset.previewsCount === '3'
            ? distance
            : distance - (squareSize + gap)

        const displacement = mapRange(
          0,
          distance,
          (scroll * 2) % _distance,
          start,
          end
        )

        /**
         * Note:
         * Note: scroll * 2 make sure we at least be able to see all three previews in 1 screen.
         *
         * But the multiplier can't be any number, otherwise the ending translate position
         * can be wrong, where 2 works fine.
         */
        gsap.to(previewsElement, {
          x: isLandscape ? 0 : displacement,
          y: isLandscape ? displacement : 0,
          duration: 0,
          ease: 'none',
        })

        // Note: this makes me quite dizzy, so let's keep the translations in the same direction
        // if (previewsElement.dataset.translateGroup === 'odd') {
        //   const displacement = mapRange(
        //     0,
        //     distance,
        //     scroll % _distance,
        //     start,
        //     end
        //   )
        //   gsap.to(previewsElement, {
        //     x: isLandscape ? 0 : displacement,
        //     y: isLandscape ? displacement : 0,
        //     duration: 0,
        //     ease: 'none',
        //   })
        // } else {
        //   const displacement = mapRange(
        //     0,
        //     distance,
        //     scroll % _distance,
        //     end,
        //     start
        //   )
        //   gsap.to(previewsElement, {
        //     x: isLandscape ? 0 : displacement,
        //     y: isLandscape ? displacement : 0,
        //     duration: 0,
        //     ease: 'none',
        //   })
        // }
      })
    },
    [visibleProjectsRef.current]
  )

  return (
    <main>
      <div ref={scrollDivRef} />

      <div className={s.base} ref={baseRef}>
        {projects.map((project, i) => {
          // project.
          if (!project || !project.previewsCollection?.items.length) return

          const { sys, previewsCollection, title } = project

          const previews = [1, 2, 3, 4, 5, 6].map(
            (index) =>
              previewsCollection.items[index % previewsCollection.items.length]
          )

          return (
            <article
              className={s.project}
              key={sys.id + i}
              data-project-index={i}
            >
              <div className={s.previewWrapper}>
                <div
                  className={s.previews}
                  data-previews-count={previewsCollection.items.length}
                  data-translate-group={i % 2 === 0 ? 'even' : 'odd'}
                >
                  {previews.map((preview, i) => {
                    if (!preview || !preview.url) return

                    return (
                      <Link
                        href={`/projects/${sys.id}`}
                        className={s.item}
                        key={i}
                      >
                        <Image
                          src={preview.url}
                          fill
                          alt={title || ''}
                          sizes="30vw"
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const data = await getSelectedProjects()

  return {
    props: {
      projects:
        data.selectedProjectsCollection?.items[0]?.projectsCollection?.items ||
        [],
    },
  }
}
