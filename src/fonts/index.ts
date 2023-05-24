import { EB_Garamond, Roboto } from 'next/font/google'
import localFont from 'next/font/local'

export const roboto = Roboto({
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['100', '400', '700'],
})

// Note: font weight of this flex version seems to have become very very light even at 700, so switching back to the normal version
// export const robotoFlex = Roboto_Flex({
//   style: ['normal'],
//   subsets: ['latin'],
//   axes: ['wdth', 'slnt', 'opsz', 'XTRA'],
// })

export const emberly = localFont({
  src: [
    {
      path: './Emberly_Variable_Regular-VF.woff2',
      style: 'normal',
    },
    // Note: italic still works without this, don't know why
    // {
    //   path: './Emberly_Variable_Italic-VF.woff2',
    //   style: 'italic',
    // },
  ],
})

export const ebGaramond = EB_Garamond({ subsets: ['latin'] })
