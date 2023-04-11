import cn from 'clsx'
import { roboto } from '@/styles/fonts'
import s from './default.module.scss'

export interface DefaultProps {
  children?: React.ReactNode
}

export const Default = ({ children }: DefaultProps) => (
  <>
    <main className={cn(s.main, roboto.className)}>{children}</main>
  </>
)
