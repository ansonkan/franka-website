import { ProjectsDocument, ProjectsQuery } from '@/gql/graphql'
import { client } from '@/lib/contentful-gql'
import { i18n } from '~/next-i18next.config'

const projects: Record<string, ProjectsQuery | undefined> = {}

export async function getProjects(locale: string) {
  if (!i18n.locales.includes(locale)) {
    locale = i18n.defaultLocale
  }

  if (!projects[locale]) {
    const data = await client.request(ProjectsDocument, { locale })
    projects[locale] = data
  }

  return projects[locale]
}
