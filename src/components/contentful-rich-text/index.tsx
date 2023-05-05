import { BLOCKS, Document, INLINES, MARKS } from '@contentful/rich-text-types'
import {
  Options,
  documentToReactComponents,
} from '@contentful/rich-text-react-renderer'
import Image from 'next/image'
import s from './contentful-rich-text.module.scss'

export type Asset = {
  sys: {
    id: string
  }
  title: string
  description: string
  contentType: string
  fileName: string
  size: number
  url: string
  width: number
  height: number
}

export type ContentAssets = {
  hyperlink: Asset[]
  block: Asset[]
}

export type Links = {
  assets: ContentAssets
}

export interface ContentfulRichTextProps {
  children: Document
  links?: Links
}

export const ContentfulRichText = ({
  children,
  links,
}: ContentfulRichTextProps) => {
  // create an asset block map
  const assetBlockMap = new Map<string, Asset>()
  // create an entry block map
  // const entryBlockMap = new Map()
  if (links) {
    // loop through the assets and add them to the map
    for (const asset of links.assets.block) {
      assetBlockMap.set(asset.sys.id, asset)
    }

    // // loop through the entries and add them to the map
    // for (const entry of links.entries.block) {
    //   entryBlockMap.set(entry.sys.id, entry)
    // }
  }

  const options: Options = {
    renderNode: {
      // [BLOCKS.DOCUMENT]: (node, children) => {
      //   // console.log(node, children)
      //   return <></>
      // },
      [BLOCKS.PARAGRAPH]: (node, children) => {
        return <p>{children}</p>
      },
      [BLOCKS.HEADING_1]: (node, children) => {
        return <h1 className={s.h1}>{children}</h1>
      },
      [BLOCKS.HEADING_2]: (node, children) => {
        return <h2 className={s.h2}>{children}</h2>
      },
      [BLOCKS.HEADING_3]: (node, children) => {
        return <h3 className={s.h3}>{children}</h3>
      },
      [BLOCKS.HEADING_4]: (node, children) => {
        return <h4 className={s.h4}>{children}</h4>
      },
      [BLOCKS.HEADING_5]: (node, children) => {
        return <h5 className={s.h5}>{children}</h5>
      },
      [BLOCKS.HEADING_6]: (node, children) => {
        return <h6 className={s.h6}>{children}</h6>
      },
      [BLOCKS.UL_LIST]: (node, children) => {
        return <ul className={s.ul}>{children}</ul>
      },
      [BLOCKS.OL_LIST]: (node, children) => {
        return <ol className={s.ol}>{children}</ol>
      },
      [BLOCKS.LIST_ITEM]: (node, children) => {
        return <li>{children}</li>
      },
      [BLOCKS.QUOTE]: (node, children) => {
        return <q className={s.q}>{children}</q>
      },
      [BLOCKS.HR]: () => {
        return <hr className={s.hr} />
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
        // console.log(node, children)
        return <></>
      },
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const asset = assetBlockMap.get(node.data.target.sys.id)

        return asset ? (
          <div className={s.imageWrapper}>
            <Image src={asset.url} alt={asset.title} fill />
          </div>
        ) : (
          <></>
        )
      },
      [BLOCKS.TABLE]: (node, children) => (
        <table>
          <tbody>{children}</tbody>
        </table>
      ),
      [BLOCKS.TABLE_ROW]: (node, children) => <tr>{children}</tr>,
      [BLOCKS.TABLE_CELL]: (node, children) => <td>{children}</td>,
      [BLOCKS.TABLE_HEADER_CELL]: (node, children) => <th>{children}</th>,
      [INLINES.EMBEDDED_ENTRY]: (node) => {
        return <></>
      },
      [INLINES.HYPERLINK]: (node, children) => {
        return (
          <a href={node.data.uri} className={s.u}>
            {children}
          </a>
        )
      },
      [INLINES.ENTRY_HYPERLINK]: (node) => {
        return <></>
      },
      [INLINES.ASSET_HYPERLINK]: (node) => {
        return <></>
      },
      // [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      //   const { title, description } = node.data.target.fields
      //   return <></>
      // },
    },
    renderMark: {
      [MARKS.BOLD]: (text) => {
        return <b className={s.b}>{text}</b>
      },
      [MARKS.ITALIC]: (text) => {
        return <i className={s.i}>{text}</i>
      },
      [MARKS.UNDERLINE]: (text) => {
        return <u className={s.u}>{text}</u>
      },
      [MARKS.CODE]: (text) => {
        return <code>{text}</code>
      },
    },
  }

  return (
    <div className={s.root}>{documentToReactComponents(children, options)}</div>
  )
}
