import NextImage from "next/image"
import { useState } from "react"

export const NotionImage: React.FC<{
  src: string
  alt: string
  blockId: string
}> = ({ src, alt, blockId }) => {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <div className="imageContainer w-full">
      <NextImage
        src={imageSrc}
        alt={alt}
        fill
        // layout="fill"
        // objectFit="cover"
        // objectPosition="center"
        className="nextImage p-0 rounded overflow-hidden"
        unoptimized={process.env.NODE_ENV !== "production"}
        onError={async () => {
          const res = await fetch(`/api/image?blockId=${blockId}`).then((res) =>
            res.json()
          )
          setImageSrc(res.imageSrc)
        }}
      />
    </div>
  )
}
