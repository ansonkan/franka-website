import {
  SelectedProjectsCollectionDocument,
  SelectedProjectsCollectionQuery,
} from '@/gql/graphql'

import { client } from '@/lib/contentful-gql'

let selectedProjects: SelectedProjectsCollectionQuery

export async function getSelectedProjects() {
  if (!selectedProjects) {
    const data = await client.request(SelectedProjectsCollectionDocument)
    selectedProjects = data
  }

  return selectedProjects
}
