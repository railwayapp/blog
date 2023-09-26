import { useState } from "react"

export const NotionVideo: React.FC<{
  src: string
  blockId: string
}> = ({ src, blockId }) => {
  const [videoSrc, setVideoSrc] = useState(src)

  return (
    <video
      src={videoSrc}
      controls
      autoPlay
      loop
      muted
      className="rounded-lg"
      onError={async () => {
        const res = await fetch(`/api/image?blockId=${blockId}`).then((res) =>
          res.json()
        )
        setVideoSrc(res.imageSrc)
      }}
    />
  )
}
