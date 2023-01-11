import { useRouter } from "next/router"
import Link from "./Link"

export const Categories: React.FC = () => {
  return (
    <ul className="flex flex-wrap gap-4 md:gap-8 mt-8 mb-12">
      <CategoryItem item="Everything" slug="/" className="hidden md:block" />
      <CategoryItem item="News" slug="/news" />
      <CategoryItem item="Guides" slug="/guide" />
      <CategoryItem item="Company" slug="/company" />
      <CategoryItem item="Engineering" slug="/engineering" />
    </ul>
  )
}

const CategoryItem: React.FC<{
  item: string
  slug: string
  className?: string
}> = ({ item, slug, className }) => {
  const { asPath } = useRouter()
  const isActive = asPath === slug

  return (
    <li className={className}>
      <Link
        className={`font-semibold ${
          isActive ? "text-foreground" : "text-gray-500"
        } hover:text-foreground`}
        href={`${slug}`}
      >
        {item}
      </Link>
    </li>
  )
}
