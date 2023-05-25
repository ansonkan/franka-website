import { SelectedProjectsDocument, SelectedProjectsQuery } from '@/gql/graphql'
import { LOCALES } from '@/constants'
import { client } from '@/lib/contentful-gql'

const selectedProjects: Record<string, SelectedProjectsQuery | undefined> = {}

export async function getSelectedProjects(locale = 'en-US') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!LOCALES.includes(locale as any)) {
    locale = LOCALES[0]
  }

  if (!selectedProjects[locale]) {
    const data = await client.request(SelectedProjectsDocument, { locale })
    selectedProjects[locale] = data
  }

  return selectedProjects[locale]
}
