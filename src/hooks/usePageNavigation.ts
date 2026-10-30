import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export function usePageNavigation(
  pathname: string,
  title: string,
  mainRef: RefObject<HTMLElement | null>,
) {
  const previousPath = useRef(pathname)

  useEffect(() => {
    document.title = `${title} · SyncPassWeb`
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      // Run after the link's native focus behavior and cancel on a new navigation.
      const frame = window.requestAnimationFrame(() => {
        mainRef.current?.focus({ preventScroll: true })
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [pathname, title, mainRef])
}
