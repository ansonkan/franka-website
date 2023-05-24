import { GetStaticProps, NextPage } from 'next'
import { ProjectsDocument, ProjectsQuery } from '@/gql/graphql'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import s from './projects.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

interface ProjectsPageProps {
  projects: NonNullable<ProjectsQuery>
}

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects }) => {
  const { t } = useTranslation('common')

  return (
    <main className="normalPageRoot">
      <table className={s.table}>
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
                  <Link href={href}>
                    <h2 className={s.title}>{title}</h2>
                  </Link>
                </td>

                <td>
                  <Link href={href} className={s.previewsCol}>
                    {previewsCollection?.items.map((photo, i) => {
                      if (!photo || !photo.url) return

                      return (
                        <figure
                          key={photo.sys.id}
                          className={s.previewsImgWrapper}
                        >
                          <Image
                            src={photo.url}
                            fill
                            alt={`${title || ''} ${i}`}
                            sizes="15vw"
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
    </main>
  )
}

export default ProjectsPage

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async ({
  locale = 'en-US',
}) => {
  const data = await client.request(ProjectsDocument, { locale })

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      projects: data,
    },
  }
}
