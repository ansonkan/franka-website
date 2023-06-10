import { AnimatePresence, m } from 'framer-motion'
import {
  Asset,
  ProjectDocument,
  ProjectQuery,
  ProjectsDocument,
  SelectedProjectsQuery,
} from '@/gql/graphql'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { BackArrow } from '@/components/icons/back-arrow'
import { CloseFullScreen } from '@/components/icons/close-full-screen'
import { CloseIcon } from '@/components/icons/close'
import { ContentfulRichText } from '@/components/contentful-rich-text'
import { FillImage } from '@/components/fill-image'
import { ForwardArrow } from '@/components/icons/forward-arrow'
import Link from 'next/link'
import { OpenInFull } from '@/components/icons/open-in-full'
import { client } from '@/lib/contentful-gql'
import { fillColorMap } from '@/lib/get-img-color'
import { getProjects } from '@/lib/queries/get-projects'
import { getSelectedProjects } from '@/lib/queries/get-selected-projects'
import { i18n } from '~/next-i18next.config'
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
  projectsPreviews?: Pick<Asset, 'url'>[]
  colorMap: Record<string, string>
}

const Main = memo(MainComponent)
Main.displayName = 'Main'

const ProjectPage: NextPage<ProjectPageProps> = ({
  project,
  nextSelectedProject,
  projectsPreviews,
  colorMap,
}) => {
  const lenis = useStore(({ lenis }) => lenis)
  const [targetImgIndex, setTargetImgIndex] = useState(0)
  const [isModal, setIsModal] = useState(false)

  const show = useCallback(
    (index: number) => {
      if (window.innerWidth < 800) return

      lenis?.stop()
      setTargetImgIndex(index)
      setIsModal(true)
    },
    [lenis]
  )

  const close = useCallback(() => {
    lenis?.start()
    setIsModal(false)
  }, [lenis])

  const prev = useCallback(() => {
    setTargetImgIndex((prevState) => Math.max(prevState - 1, 0))
  }, [])

  const next = useCallback(() => {
    setTargetImgIndex((prevState) =>
      Math.min(prevState + 1, project.mediaCollection?.items.length || 0)
    )
  }, [project.mediaCollection?.items.length])

  return (
    <>
      <Main
        project={project}
        nextSelectedProject={nextSelectedProject}
        projectsPreviews={projectsPreviews}
        colorMap={colorMap}
        show={show}
      />

      <AnimatePresence>
        {isModal && project.mediaCollection?.items[targetImgIndex] && (
          <ModalComponent
            img={project.mediaCollection.items[targetImgIndex]!}
            prev={prev}
            next={next}
            hasPrev={targetImgIndex > 0}
            hasNext={
              targetImgIndex < (project.mediaCollection.items.length || 0) - 1
            }
            close={close}
          />
        )}
      </AnimatePresence>
    </>
  )
}

ProjectPage.displayName = 'Project page'

export default ProjectPage

interface MainComponentProps extends ProjectPageProps {
  show: (index: number) => void
}

function MainComponent({
  project,
  colorMap,
  nextSelectedProject,
  projectsPreviews,
  show,
}: MainComponentProps) {
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

        <m.ol className="overview" data-lenis-prevent {...mBlurProps}>
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
                  onClick={() => show(i)}
                >
                  <FillImage
                    src={photo.url}
                    alt={project.title || '' + ` ${i}`}
                    sizes={`(min-width: 800px) ${
                      width && height
                        ? `calc(50vh * ${width / height})`
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
              <Link
                href={`/projects/${nextSelectedProject.sys.id}`}
                scroll={false}
                className="link"
              >
                <div className="next">
                  {t('plain-text.project-id.next-label')}
                </div>

                <div className="overview reverse">
                  {nextSelectedProject?.previewsCollection?.items.map(
                    (preview, i) => {
                      if (!preview || !preview.url) return

                      return (
                        <div
                          key={preview.sys.id}
                          className="overviewImgWrapper"
                        >
                          <FillImage
                            src={preview.url}
                            alt={project.title || '' + ` ${i}`}
                            sizes="20vw"
                            color={colorMap[preview.url]}
                            quality={30}
                            isSquare
                          />
                        </div>
                      )
                    }
                  )}
                </div>
              </Link>
            )}

            {!nextSelectedProject?.previewsCollection?.items.length &&
              projectsPreviews?.length && (
                <Link href="/projects" scroll={false} className="link">
                  <div className="next">
                    {t('plain-text.project-id.projects-label')}
                  </div>

                  <div className="overview reverse">
                    {projectsPreviews.map((preview, i) => {
                      if (!preview || !preview.url) return

                      return (
                        <div key={i} className="overviewImgWrapper">
                          <FillImage
                            src={preview.url}
                            alt={project.title || '' + ` ${i}`}
                            sizes="20vw"
                            color={colorMap[preview.url]}
                            quality={30}
                            isSquare
                          />
                        </div>
                      )
                    })}
                  </div>
                </Link>
              )}
          </div>
        </m.div>
      </main>
    </>
  )
}

interface ModalComponentProps {
  img: Pick<Asset, 'url' | 'width' | 'height'>
  close: () => void
  prev: () => void
  next: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

function ModalComponent({
  img,
  close,
  prev,
  next,
  hasPrev,
  hasNext,
}: ModalComponentProps) {
  const gsap = useGsap()
  // const modalRef = useRef<HTMLDivElement | null>(null)
  // const modalWrapperRef = useRef<HTMLDivElement | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Note: doesn't seem to be working... maybe nested Lenis just doesn't work
  // useEffect(() => {
  //   if (!modalRef.current || !modalWrapperRef.current) return

  //   const lenis = new Lenis({
  //     wrapper: modalRef.current,
  //     content: modalWrapperRef.current,
  //     syncTouch: true,
  //   })

  //   return () => {
  //     lenis.destroy()
  //   }
  // }, [])

  const openFullScreen = useCallback(() => {
    if (!gsap || !img || !img.height || !img.url || !img.width) return

    const modalDiv = document.querySelector('.project_id-modal')

    const imgWrapperClass = '.project_id-modal-img-wrapper'
    const imgWrapperDiv = document.querySelector(imgWrapperClass)

    if (!modalDiv || !imgWrapperDiv) return

    setIsFullScreen(true)

    gsap
      .timeline()
      .set(imgWrapperClass, {
        height: imgWrapperDiv.getBoundingClientRect().height,
        onComplete: () => {
          modalDiv.classList.add('full-screen')
        },
      })
      .to(imgWrapperClass, {
        opacity: 0,
        duration: 0.15,
      })
      .set(imgWrapperClass, {
        // Note: should I cap this height? cuz this can goes really really big
        height:
          (imgWrapperDiv.getBoundingClientRect().width * img.height) /
          img.width,
      })
      .to(imgWrapperClass, {
        opacity: 1,
        duration: 0.15,
      })
  }, [gsap, img])

  const closeFullScreen = useCallback(() => {
    if (!gsap || !img || !img.height || !img.url || !img.width) return

    const modalDiv = document.querySelector('.project_id-modal')
    const imgWrapperClass = '.project_id-modal-img-wrapper'

    setIsFullScreen(false)

    gsap
      .timeline()
      .to(imgWrapperClass, {
        opacity: 0,
        duration: 0.15,
      })
      .set(imgWrapperClass, {
        height: '100%',
        onComplete: () => {
          modalDiv?.classList.remove('full-screen')
        },
      })
      .to(imgWrapperClass, {
        opacity: 1,
        duration: 0.15,
      })
  }, [gsap, img])

  const resetFullScreenMode = (onComplete?: () => void) => {
    if (!isFullScreen || !gsap) return

    const modalDiv = document.querySelector('.project_id-modal')
    const imgWrapperClass = '.project_id-modal-img-wrapper'

    gsap.set(imgWrapperClass, {
      height: '100%',
      onComplete: () => {
        modalDiv?.classList.remove('full-screen')
        setIsFullScreen(false)
        onComplete?.()
      },
    })
  }

  return (
    <m.div
      className="project_id-modal"
      initial={{ '--progress': '100%' } as any}
      animate={{ '--progress': '0%' } as any}
      exit={{ '--progress': '100%' } as any}
      data-lenis-prevent
      // ref={modalRef}
    >
      <div className="project_id-modal-content">
        {/* Note: the fade in/out with gsap makes animating transitioning from full screen mode to another image really difficult */}
        {/* probably should find a way to set this up in a reactive way, since gsap isn't reactive but framer-motion is */}
        {/* <AnimatePresence> */}
        <div
          className="project_id-modal-img-wrapper"
          onClick={() => {
            isFullScreen ? closeFullScreen() : openFullScreen()
          }}
          key={img.url}
        >
          <FillImage
            src={img.url || ''}
            alt=""
            disableHoverEffect
            color="#222222"
            sizes="90vw"
            priority
            useSpinner
            spinnerColor="white"
          />
        </div>
        {/* </AnimatePresence> */}
      </div>

      <div className="project_id-modal-control mix-blend-invert">
        <div className="project_id-modal-control-others">
          <button onClick={() => close()}>
            <CloseIcon />
          </button>

          <div className="invisible">
            <CloseIcon />
          </div>
        </div>

        <button
          onClick={() => (isFullScreen ? closeFullScreen() : openFullScreen())}
        >
          {isFullScreen ? <CloseFullScreen /> : <OpenInFull />}
        </button>

        <div className="project_id-modal-control-others">
          <button
            onClick={() => {
              isFullScreen ? resetFullScreenMode(prev) : prev()
            }}
            disabled={!hasPrev}
          >
            <BackArrow />
          </button>

          <button
            onClick={() => {
              isFullScreen ? resetFullScreenMode(next) : next()
            }}
            disabled={!hasNext}
          >
            <ForwardArrow />
          </button>
        </div>
      </div>
    </m.div>
  )
}

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

  const projects = await getProjects(locale)
  const projectsPreviews = projects?.projectsCollection?.items.reduce(
    (acc, cur) => {
      if (acc.length === 3) return acc

      if (
        cur?.previewsCollection?.items.length &&
        !!cur.previewsCollection.items[0]
      ) {
        acc.push(cur.previewsCollection.items[0])
      }

      return acc
    },
    [] as Pick<Asset, 'url'>[]
  )

  await fillColorMap(projectsPreviews, colorMap)

  return {
    props: {
      ...translations,
      project: data.projects,
      colorMap,
      projectsPreviews,
    },
  }
}
