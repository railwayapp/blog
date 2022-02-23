import NextImage from "next/image"

export const NotionImage: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => {
  return (
    <div className="imageContainer -mx-5 md:mx-0 w-full">
      <NextImage
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className="nextImage mb-8 p-0"
        unoptimized={process.env.NODE_ENV !== "production"}
      />
    </div>
  )
}
