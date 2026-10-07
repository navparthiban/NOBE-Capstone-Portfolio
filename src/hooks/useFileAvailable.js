import { useEffect, useState } from 'react'

export default function useFileAvailable(url, contentType) {
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(url, { method: 'HEAD' })
      .then((response) => {
        const type = response.headers.get('content-type') ?? ''
        if (!cancelled) setAvailable(response.ok && type.includes(contentType))
      })
      .catch(() => {
        if (!cancelled) setAvailable(true)
      })
    return () => {
      cancelled = true
    }
  }, [url, contentType])

  return available
}
