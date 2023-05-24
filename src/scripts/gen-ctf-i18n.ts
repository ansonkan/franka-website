import dotenv from 'dotenv'

if (process.env.CI !== 'true') {
  dotenv.config({ path: '.env.local' })
}

import {
  I18nPlainTextDocument,
  I18nRichTextDocument,
  I18nRichTextKeysDocument,
} from '../gql/graphql'
import { LOCALES } from '../constants'
import { client } from '../lib/contentful-gql'
import fs from 'node:fs'
import { join } from 'node:path'

genI18n()

const LIMIT = 10

async function genI18n() {
  const translations: Record<string, unknown> = {}

  const i18nRichTextKeysResult = await client.request(I18nRichTextKeysDocument)
  const len = i18nRichTextKeysResult.i18NCollection?.items.length || 0

  for (const locale of LOCALES) {
    // Note: Plain text
    const { inPlainTextCollection } = await client.request(
      I18nPlainTextDocument,
      { locale }
    )

    for (const item of inPlainTextCollection?.items || []) {
      if (!item || !item.key) continue

      translations[item.key] = item.value
    }

    // Note: Rich text
    for (let i = 0; i < len; i += LIMIT) {
      const { i18NCollection } = await client.request(I18nRichTextDocument, {
        skip: i,
        limit: LIMIT,
        locale,
      })

      for (const item of i18NCollection?.items || []) {
        if (!item || !item.key) continue

        translations[item.key] = item.value
      }
    }

    // Note: Write locale files
    const filepath = join(__dirname, '..', '..', 'public', 'locales', locale)

    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath, { recursive: true })
    }

    fs.writeFileSync(
      join(filepath, 'common.json'),
      JSON.stringify(translations)
    )
  }
}
