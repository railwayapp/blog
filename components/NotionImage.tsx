import NextImage from "next/image"

export const NotionImage: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => {
  return (
    <div className="imageContainer w-full">
      <NextImage
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className="nextImage mb-8 p-0 rounded overflow-hidden"
        unoptimized={process.env.NODE_ENV !== "production"}
      />
    </div>
  )
}
