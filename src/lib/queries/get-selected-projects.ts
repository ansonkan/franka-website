import { SelectedProjectsDocument, SelectedProjectsQuery } from '@/gql/graphql'
import { client } from '@/lib/contentful-gql'
import { i18n } from '~/next-i18next.config'

const selectedProjects: Record<string, SelectedProjectsQuery | undefined> = {}

export async function getSelectedProjects(locale: string) {
  if (!i18n.locales.includes(locale)) {
    locale = i18n.defaultLocale
  }

  if (!selectedProjects[locale]) {
    const data = await client.request(SelectedProjectsDocument, { locale })
    selectedProjects[locale] = data
  }

  return selectedProjects[locale]
}
