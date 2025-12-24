// frontend/src/modules/products/components/thumbnail/index.tsx
import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  format?: string | string[] | null
  "data-testid"?: string
}

const getPlaceholder = (format?: string | string[] | null) => {
  const formats = Array.isArray(format) ? format : typeof format === "string" ? [format] : []
  const lower = formats.map(f => f.toLowerCase())
  if (lower.some(f => f.includes("cd"))) return "/static/noimageplaceholder-cd.jpg"
  if (lower.some(f => f.includes("cassette"))) return "/static/noimageplaceholder-cassette.jpg"
  return "/static/noimageplaceholder.jpg"
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  format,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  return (
    <div
      className={clx(
        "relative w-full overflow-hidden bg-black",
        className,
        {
          "aspect-square": true,
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <Image
        src={initialImage || getPlaceholder(format)}
        alt="Thumbnail"
        className="absolute inset-0 object-cover object-center transition-opacity duration-300"
        draggable={false}
        quality={85}
        sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
        fill
      />
    </div>
  )
}

export default Thumbnail