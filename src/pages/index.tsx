import { GetStaticProps, NextPage } from 'next'
import { useCallback, useEffect, useRef } from 'react'
import { FillImage } from '@/components/fill-image'
import Link from 'next/link'
import { SelectedProjectsQuery } from '@/gql/graphql'
import { getImgColor } from '@/lib/get-img-color'
import { getSelectedProjects } from '@/lib/queries/get-selected-projects'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { mapRange } from '@/lib/maths'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useGsap } from '@/lib/use-gsap'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'
import { useTranslation } from 'next-i18next'

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
  const { t } = useTranslation('common')
  const [lenis] = useStore(({ lenis }) => [lenis])
  const gsap = useGsap()

  const scrollDivRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLDivElement>(null)
  const visibleProjectsRef = useRef<
    { projectElement: HTMLDivElement; previewsElement: HTMLDivElement }[]
  >([])

  useEffect(() => {
    if (!gsap) return

    lenis?.stop()

    // Note:
    // This is simple but still not in perfect sync with RAF. Probably better to find a way
    // to track what's visible mathematically
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
                '.previews'
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

    gsap.utils.toArray<HTMLDivElement>('.project').forEach((project) => {
      observer.observe(project)
    })

    lenis?.start()

    return () => {
      observer.disconnect()
    }
  }, [gsap, lenis])

  const onScroll = useCallback<
    ({ scroll, resetAll }: { scroll: number; resetAll?: boolean }) => void
  >(
    ({ scroll, resetAll }) => {
      if (!gsap) return

      const isLandscape = window.innerWidth > window.innerHeight

      if (isLandscape) {
        gsap.to(baseRef.current, { x: -scroll })

        gsap.to('.home-page .hint', { opacity: scroll > 100 ? 0 : 1 })
      }

      const axis = isLandscape ? window.innerHeight : window.innerWidth

      const gap = axis * 0.02
      const squareSize = axis / 2 - gap
      const start = -(squareSize / 2)
      const end = -(3.5 * squareSize + 3 * gap)
      const distance = Math.abs(end - start)

      const targets = resetAll
        ? gsap.utils
            .toArray<HTMLDivElement>('.previews')
            .map((elem) => ({ previewsElement: elem }))
        : visibleProjectsRef.current

      targets.forEach(({ previewsElement }) => {
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
    [gsap]
  )

  useEffect(() => {
    const onResize = () => {
      if (!gsap) return

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
      onScroll({ scroll: 0, resetAll: true })
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [gsap, lenis, onScroll, projects.length])

  useScroll(onScroll, [onScroll])

  return (
    <main className="home-page">
      <div ref={scrollDivRef} />

      <m.div className="base" ref={baseRef} {...mBlurProps}>
        {projects.map((project) => {
          if (!project || !project.previewsCollection?.items.length) return

          const { sys, previewsCollection, title } = project

          const previews = [1, 2, 3, 4, 5, 6].map(
            (index) =>
              previewsCollection.items[index % previewsCollection.items.length]
          )

          return (
            <article
              className="project"
              key={sys.id}
              // data-project-index={projectIndex}
            >
              <div className="previewWrapper">
                <Link
                  href={`/projects/${sys.id}`}
                  scroll={false}
                  className="previews"
                  data-previews-count={previewsCollection.items.length}
                  data-project-id={sys.id}
                >
                  {previews.map((preview, previewIndex) => {
                    if (!preview || !preview.url) return

                    return (
                      <div
                        className="item"
                        // Note: could have repeated `id` for repeated images, so need to add `i`
                        key={preview.sys.id + previewIndex}
                      >
                        <FillImage
                          src={preview.url}
                          alt={title || ''}
                          sizes="(orientation: landscape) 45vh, 45vw"
                          color={colorMap[preview.url]}
                          isSquare
                          /**
                           * Note:
                           * Due to this looping mechanism, a `FillImage` that being in the middle
                           * of its on-load animation could be instantly translated to offscreen, and
                           * vice versa.
                           *
                           * One of the hacky fix I guess would be forcing repeating images to load or
                           * animate their cover when one of them loaded.
                           *
                           * The other way, which is the current workaround, have all of them be `priority`
                           * and `loading="eager"` to force them to load even before entering the screen,
                           * hence finishing the appearing animation before that. But this is the dirtier
                           * workaround because this really depends on user's loading speed at the end of
                           * day.
                           */
                          priority
                          loading="eager"
                        />
                      </div>
                    )
                  })}
                </Link>
              </div>
            </article>
          )
        })}
      </m.div>

      <div className="hint">{t('plain-text.home.hint.scroll')}</div>
    </main>
  )
}

Index.displayName = 'Index page'

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
