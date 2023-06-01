import { GetStaticProps, NextPage } from 'next'
import { ProjectsDocument, ProjectsQuery } from '@/gql/graphql'
import { FillImage } from '@/components/fill-image'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import { getImgColor } from '@/lib/get-img-color'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

interface ProjectsPageProps {
  projects: NonNullable<ProjectsQuery>
  colorMap: Record<string, string>
}

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects, colorMap }) => {
  const { t } = useTranslation('common')

  return (
    <main className="projects-page normalPageRoot">
      <m.div {...mBlurProps}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('plain-text.projects.table.header.title')}</th>
              <th>{t('plain-text.projects.table.header.previews')}</th>
            </tr>
          </thead>

          <tbody>
            {projects.projectsCollection?.items.map((project) => {
              if (!project) return

              const { sys, title, previewsCollection } = project

              const href = `/projects/${sys.id}`

              return (
                <tr key={sys.id}>
                  <td>
                    <Link href={href} scroll={false}>
                      <h2 className="title">{title}</h2>
                    </Link>
                  </td>

                  <td>
                    <Link href={href} className="previewsCol" scroll={false}>
                      {previewsCollection?.items.map((photo, i) => {
                        if (!photo || !photo.url) return

                        return (
                          <figure
                            key={photo.sys.id}
                            className="previewsImgWrapper"
                          >
                            <FillImage
                              src={photo.url}
                              alt={`${title || ''} ${i}`}
                              sizes="15vw"
                              color={colorMap[photo.url]}
                              quality={30}
                              isSquare
                            />
                          </figure>
                        )
                      })}
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
