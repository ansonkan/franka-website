import { GetStaticProps, NextPage } from 'next'
import { useCallback, useEffect, useRef } from 'react'
import { FillImage } from '@/components/fill-image'
import Link from 'next/link'
import { SelectedProjectsQuery } from '@/gql/graphql'
import { getImgColor } from '@/lib/get-img-color'
import { getSelectedProjects } from '@/lib/queries/get-selected-projects'
import gsap from 'gsap'
import { mapRange } from '@/lib/maths'
import s from './index.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'

interface IndexProps {
  projects: NonNullable<
    NonNullable<
      NonNullable<
        SelectedProjectsQuery['selectedProjectsCollection']
      >['items'][number]
    >['projectsCollection']
  >['items']
  colorMap: Record<string, string>
}

const Index: NextPage<IndexProps> = ({ projects, colorMap }) => {
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

  const onScroll = useCallback<({ scroll }: { scroll: number }) => void>(
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
    []
  )

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

      // Note: reset
      lenis?.scrollTo(0, { immediate: true })
      onScroll({ scroll: 0 })
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [lenis, onScroll, projects.length])

  useScroll(onScroll, [onScroll])

  return (
    <main>
      <div ref={scrollDivRef} />

      <div className={s.base} ref={baseRef}>
        {projects.map((project, i) => {
          if (!project || !project.previewsCollection?.items.length) return

          const { sys, previewsCollection, title } = project

          const previews = [1, 2, 3, 4, 5, 6].map(
            (index) =>
              previewsCollection.items[index % previewsCollection.items.length]
          )

          return (
            <article className={s.project} key={sys.id} data-project-index={i}>
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
                        // Note: could have repeated `id` for repeated images, so need to add `i`
                        key={preview.sys.id + i}
                      >
                        <FillImage
                          src={preview.url}
                          alt={title || ''}
                          sizes="30vw"
                          color={colorMap[preview.url]}
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

export const getStaticProps: GetStaticProps<IndexProps> = async ({
  locale = 'en-US',
}) => {
  const data = await getSelectedProjects(locale)

  const projects =
    data?.selectedProjectsCollection?.items[0]?.projectsCollection?.items || []

  const colorMap: Record<string, string> = {}

  for (const project of projects) {
    for (const preview of project?.previewsCollection?.items || []) {
      if (!preview?.url) continue

      colorMap[preview.url] = await getImgColor(preview.url)
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      projects,
      colorMap,
    },
  }
}
