import { EB_Garamond, Roboto_Flex } from 'next/font/google'
import localFont from 'next/font/local'

export const robotoFlex = Roboto_Flex({
  style: ['normal'],
  subsets: ['latin'],
  axes: ['wdth', 'slnt', 'opsz', 'XTRA'],
})

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
