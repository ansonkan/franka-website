import { ComponentProps, memo, useState } from 'react'
import Image from 'next/image'
import cn from 'clsx'
import s from './fill-image.module.scss'

export interface FillImageProps
  extends Omit<
    ComponentProps<typeof Image>,
    'width' | 'height' | 'fill' | 'placeholder' | 'blurDataURL'
  > {
  color?: string
}

export interface FillImageProps
  extends Omit<
    ComponentProps<typeof Image>,
    'width' | 'height' | 'fill' | 'placeholder' | 'blurDataURL'
  > {
  color?: string
}

export const FillImage = memo(
  ({ color, alt, onLoadingComplete, ...others }: FillImageProps) => {
    const [loaded, setLoaded] = useState(false)

    return (
      <div className={cn(s.abt, s.root, loaded && s.loaded)}>
        <Image
          alt={alt}
          fill
          onLoadingComplete={(elem) => {
            setLoaded(true)
            onLoadingComplete?.(elem)
          }}
          {...others}
        />
        <div
          className={cn(s.abt, s.cover)}
          style={color ? { backgroundColor: color } : undefined}
        />
      </div>
    )
  }
)

FillImage.displayName = 'FillImage'

// const IMMEDIATE = {
//   duration: 0,
//   ease: 'none',
// }

// export const FillImage = memo(
//   ({
//     // color,
//     alt,
//     onLoadingComplete,
//     ...others
//   }: FillImageProps) => {
//     const coverRef = useRef<HTMLDivElement | null>(null)

//     return (
//       <div className={cn(s.abt, s.root)}>
//         <Image
//           alt={alt}
//           fill
//           onLoadingComplete={(elem) => {
//             const { x, y, right, bottom } = elem.getBoundingClientRect()

//             const isVisible = !(
//               x >= window.innerWidth ||
//               y >= window.innerHeight ||
//               right <= 0 ||
//               bottom <= 0
//             )

//             const t = gsap.timeline({ delay: 0.3 })

//             t.to(coverRef.current, {
//               opacity: 0,
//               ...(isVisible ? {} : IMMEDIATE),
//             })

//             if (isVisible) {
//               t.fromTo(elem, { scale: 1.1 }, { scale: 1 }, '<')
//             }

//             onLoadingComplete?.(elem)
//           }}
//           {...others}
//         />
//         <div className={cn(s.abt, s.cover)} ref={coverRef} />
//       </div>
//     )
//   }
// )

// FillImage.displayName = 'FillImage'
