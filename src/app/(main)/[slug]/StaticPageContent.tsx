"use client"
import { useEffect } from "react"

interface Page {
  title: string
  image?: string
  static_content?: string
}

export default function StaticPageContent({ page }: { page: Page }) {
  useEffect(() => {
    const main = document.querySelector('main')
    if (main) {
      if (page.image) {
        main.classList.add('overlay-header')
      } else {
        main.classList.remove('overlay-header')
      }
    }
    return () => {
      if (main) {
        main.classList.remove('overlay-header')
      }
    }
  }, [page.image])

  return (
    <div>
      {page.image && (
        <div 
          className="w-full h-80 md:h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${page.image})` }}
        />
      )}
      {page.static_content && (
        <div className="content-container py-12 px-4">
          <div 
            className="prose prose-lg max-w-none [&>p]:mb-4"
            dangerouslySetInnerHTML={{ __html: page.static_content }}
          />
        </div>
      )}
    </div>
  )
}
