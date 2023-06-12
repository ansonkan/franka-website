import { GetStaticProps, NextPage } from 'next'
import { ProjectsDocument, ProjectsQuery } from '@/gql/graphql'
import { FillImage } from '@/components/fill-image'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import { getImgColor } from '@/lib/get-img-color'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface ProjectsPageProps {
  projects: NonNullable<ProjectsQuery>
  colorMap: Record<string, string>
}

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects, colorMap }) => {
  return (
    <main className="normalPageRoot projects-page">
      <m.div {...mBlurProps}>
        <ol className="project-list">
          {projects.projectsCollection?.items.map((project) => {
            if (!project) return

            const { sys, title, previewsCollection } = project

            const href = `/projects/${sys.id}`

            return (
              <li key={sys.id} className="project-list-item">
                <Link href={href} className="previewsCol" scroll={false}>
                  {previewsCollection?.items.map((photo, i) => {
                    if (!photo || !photo.url) return

                    return (
                      <figure key={photo.sys.id} className="previewsImgWrapper">
                        <FillImage
                          src={photo.url}
                          alt={`${title || ''} ${i}`}
                          sizes="20vw"
                          color={colorMap[photo.url]}
                          isSquare
                        />
                      </figure>
                    )
                  })}
                </Link>
              </li>
            )
          })}
        </ol>
      </m.div>
    </main>
  )
}

ProjectsPage.displayName = 'Projects page'

export default ProjectsPage

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async ({
  locale = 'en-US',
}) => {
  const data = await client.request(ProjectsDocument, { locale })

  const colorMap: Record<string, string> = {}

  for (const project of data.projectsCollection?.items || []) {
    for (const preview of project?.previewsCollection?.items || []) {
      if (!preview?.url) continue

      colorMap[preview.url] = await getImgColor(preview.url)
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      projects: data,
      colorMap,
    },
  }
}
