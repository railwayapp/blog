import { useEffect } from "react"

export const useAsyncEffect = (
  func: () => any | Promise<any>,
  args: Array<any> = []
) => {
  useEffect(() => {
    const p = func()
    if (p) {
      p.then(() => {
        return undefined
      }).catch(() => {
        return undefined
      })
    }
  }, args)
}
