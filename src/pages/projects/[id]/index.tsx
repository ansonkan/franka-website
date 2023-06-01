import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  ProjectDocument,
  ProjectQuery,
  ProjectsDocument,
  SelectedProjectsQuery,
} from '@/gql/graphql'
import { useEffect, useRef, useState } from 'react'
import { ContentfulRichText } from '@/components/contentful-rich-text'
import { FillImage } from '@/components/fill-image'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import { fillColorMap } from '@/lib/get-img-color'
import { getSelectedProjects } from '@/lib/queries/get-selected-projects'
import { i18n } from '~/next-i18next.config'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useGsap } from '@/lib/use-gsap'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'
import { useTranslation } from 'next-i18next'

interface ProjectPageProps {
  project: NonNullable<ProjectQuery['projects']>
  nextSelectedProject?: NonNullable<
    NonNullable<
      NonNullable<
        SelectedProjectsQuery['selectedProjectsCollection']
      >['items'][number]
    >['projectsCollection']
  >['items'][number]
  colorMap: Record<string, string>
}

const ProjectPage: NextPage<ProjectPageProps> = ({
  project,
  nextSelectedProject,
  colorMap,
}) => {
  const { t } = useTranslation('common')
  const lenis = useStore(({ lenis }) => lenis)
  const gsap = useGsap()

  const galleryRef = useRef<HTMLOListElement | null>(null)
  const outroRef = useRef<HTMLDivElement | null>(null)

  const [scrollHeight, setScrollHeight] = useState(0)

  useEffect(() => {
    const onResize = () => {
      if (!gsap) return

      const isDesktop = window.innerWidth >= 800

      /**
       * Note:
       * - `useRect` returns `width` without the padding, so use `getBoundingClientRect` instead
       * - `window.innerHeight` -> 100vh plus the 2vh from `--overview-square-gap`
       * - `window.innerWidth` -> minus 100vw but add back the 2vw from `--header-px`
       */
      setScrollHeight(
        isDesktop
          ? Math.max(
              0,
              (galleryRef.current?.getBoundingClientRect().width || 0) +
                (outroRef.current?.getBoundingClientRect().width || 0) +
                window.innerHeight * (1 + 0.02) -
                window.innerWidth * (1 - 0.02)
            )
          : 0
      )

      if (!isDesktop) {
        gsap.set([galleryRef.current, outroRef.current], {
          x: 0,
        })
      }
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [gsap])

  useScroll(
    ({ scroll }) => {
      if (!gsap) return

      const isDesktop = window.innerWidth >= 800

      if (!isDesktop) return

      /**
       * Note:
       * If using the element references directly, whenever I left from `/projects/[id]` to other pages, I got "Cannot read properties of null (reading '_gsap')",
       * but using classes seems fine.
       *
       * Same error mentioned in https://greensock.com/forums/topic/29398-cannot-read-properties-of-null-reading-_gsap/
       * but I don't understand what was the cause still
       *
       * I suspect the scheduled gsap tweens break when running with these dead element references after page component unmounted
       */
      // gsap.to([galleryRef.current, outroRef.current], {
      gsap.to(['.gallery', '.outro'], {
        x: -scroll,
        duration: 0,
        ease: 'none',
      })
    },
    [gsap]
  )

  return (
    <>
      <div style={{ height: scrollHeight }} />

      <main className="projects_id-page">
        <m.div className="intro" {...mBlurProps}>
          <div className="info">
            <h1 className="title">{project.title}</h1>

            {project.description?.json && (
              <div className="meta">
                <ContentfulRichText>
                  {project.description.json}
                </ContentfulRichText>
              </div>
            )}
          </div>
        </m.div>

        <m.ol
          className="overview"
          // Note:
          /**
           * Note:
           * I think somehow lenis makes it harder to scroll natively in a direction that it is not configed to,
           * in this case, it is configed to scroll vertically, so this horizontal overviews is very difficult to be scrolled
           * unless lenis is stopped
           */
          onTouchStart={() => lenis?.stop()}
          onTouchCancel={() => lenis?.start()}
          onTouchEnd={() => lenis?.start()}
          {...mBlurProps}
        >
          {project.mediaCollection?.items.map((photo, i) => {
            if (!photo || !photo.url) return

            return (
              <li
                key={photo.sys.id}
                className="overviewImgWrapper"
                onClick={() => {
                  lenis?.scrollTo(`.galleryImgWrapper:nth-child(${i + 1})`)
                }}
              >
                <FillImage
                  src={photo.url}
                  alt={project.title || '' + ` ${i}`}
                  sizes="20vw"
                  color={colorMap[photo.url]}
                  quality={30}
                  isSquare
                />
              </li>
            )
          })}
        </m.ol>

        <m.div className="two" {...mBlurProps}>
          <ol className="gallery" ref={galleryRef}>
            {project.mediaCollection?.items.map((photo, i) => {
              if (!photo || !photo.url) return

              const { width, height } = photo

              return (
                <li
                  key={photo.sys.id}
                  className="galleryImgWrapper"
                  style={
                    width && height
                      ? {
                          // Note: aspectRatio worked fine in chrome, safari, arc but firefox
                          // firefox needs a width here for the gallery element (the parent)
                          // to have an expected width
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          '--desktop-width': `calc(50 * var(--vh, 1vh) * ${
                            width / height
                          })`,
                          aspectRatio: width / height,
                        }
                      : undefined
                  }
                >
                  <FillImage
                    src={photo.url}
                    alt={project.title || '' + ` ${i}`}
                    sizes={`(min-width: 800px) ${
                      width && height
                        ? `calc(40vh * ${width / height})`
                        : '60vw'
                    }, 60vw`}
                    color={colorMap[photo.url]}
                    priority={i < 2}
                  />
                </li>
              )
            })}
          </ol>

          <div className="outro" ref={outroRef}>
            {nextSelectedProject?.previewsCollection?.items.length && (
              <>
                <Link
                  href={`/projects/${nextSelectedProject.sys.id}`}
                  className="next"
                  scroll={false}
                >
                  {t('plain-text.project-id.next-label')}
                </Link>

                <div className="overview reverse">
                  {nextSelectedProject?.previewsCollection?.items.map(
                    (preview, i) => {
                      if (!preview || !preview.url) return

                      return (
                        <Link
                          key={preview.sys.id}
                          href={`/projects/${nextSelectedProject.sys.id}`}
                          className="overviewImgWrapper"
                          scroll={false}
                        >
                          <FillImage
                            src={preview.url}
                            alt={project.title || '' + ` ${i}`}
                            sizes="20vw"
                            color={colorMap[preview.url]}
                            quality={30}
                            isSquare
                          />
                        </Link>
                      )
                    }
                  )}
                </div>
              </>
            )}
          </div>
        </m.div>
      </main>
    </>
  )
}

ProjectPage.displayName = 'Project page'

export default ProjectPage

type Params = {
  id: string
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const data = await client.request(ProjectsDocument, { locale: 'en-US' })

  return {
    paths: (
      data.projectsCollection?.items
        .filter((item) => !!item)
        .map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params: { id: item!.sys.id },
        })) || []
    ).reduce((acc, cur) => {
      i18n.locales.forEach((l) => {
        acc = [...acc, { ...cur, locale: l }]
      })

      return acc
    }, [] as any),
    fallback: false, // can also be true or 'blocking'
  }
}

export const getStaticProps: GetStaticProps<ProjectPageProps, Params> = async ({
  params,
  locale = 'en-US',
}) => {
  if (!params?.id) {
    return {
      notFound: true,
    }
  }

  const selectedProjects = await getSelectedProjects(locale)

  const data = await client.request(ProjectDocument, {
    id: params.id,
    locale,
  })

  if (!data.projects) {
    return {
      notFound: true,
    }
  }

  const translations = await serverSideTranslations(locale, ['common'])
  const colorMap: Record<string, string> = {}

  await fillColorMap(data.projects.mediaCollection?.items, colorMap)
  await fillColorMap(data.projects.previewsCollection?.items, colorMap)

  const indexInSelectedProjects =
    selectedProjects?.selectedProjectsCollection?.items[0]?.projectsCollection?.items.findIndex(
      (selectedProject) => selectedProject?.sys.id === params.id
    )

  const nextSelectedProject =
    typeof indexInSelectedProjects === 'number' &&
    indexInSelectedProjects > -1 &&
    indexInSelectedProjects + 1 <
      (selectedProjects?.selectedProjectsCollection?.items[0]
        ?.projectsCollection?.items.length || 0)
      ? selectedProjects?.selectedProjectsCollection?.items[0]
          ?.projectsCollection?.items[indexInSelectedProjects + 1]
      : undefined

  if (nextSelectedProject) {
    await fillColorMap(nextSelectedProject.previewsCollection?.items, colorMap)

    return {
      props: {
        ...translations,
        project: data.projects,
        nextSelectedProject,
        colorMap,
      },
    }
  }

  return {
    props: {
      ...translations,
      project: data.projects,
      colorMap,
    },
  }
}
