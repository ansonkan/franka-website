import { useEffect, useMemo } from 'react'
import _Stats from 'stats.js'
import { useFrame } from '@studio-freight/hamo'

export const Stats = () => {
  const stats = useMemo(() => new _Stats(), [])

  useEffect(() => {
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    return () => {
      stats.dom.remove()
    }
  }, [stats])

  useFrame(() => {
    stats.begin()
  }, -Infinity)

  useFrame(() => {
    stats.end()
  }, Infinity)

  return null
}
