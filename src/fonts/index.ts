import { Roboto_Flex } from 'next/font/google'
import localFont from 'next/font/local'

export const robotoFlex = Roboto_Flex({
  style: ['normal'],
  subsets: ['latin'],
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
