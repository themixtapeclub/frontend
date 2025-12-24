// frontend/src/modules/common/components/related-section/index.tsx
type RelatedSectionProps = {
  title: string
  isFirst?: boolean
  children: React.ReactNode
}

const SECTION_SPACING = "mt-10"

export default function RelatedSection({ 
  title, 
  isFirst = false, 
  children 
}: RelatedSectionProps) {
  return (
    <section className={`w-full ${isFirst ? "" : `border-t border-black ${SECTION_SPACING}`}`}>
      <div className="p-4 py-2">
        <h3 className="section-title text-base">{title}</h3>
      </div>
      <ul className="flex flex-wrap justify-center">
        {children}
      </ul>
    </section>
  )
}