import { GraphQLClient } from 'graphql-request'

export const client = new GraphQLClient(
  `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
  {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`, // add our access token header
    },
  }
)
