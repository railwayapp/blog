import { getCategoryLabel, getCategoryPath } from "@lib/cms"
import { BlogCategory } from "@lib/types"
import { useRouter } from "next/router"
import Link from "./Link"

export const Categories: React.FC<{ categories: BlogCategory[] }> = ({
  categories,
}) => {
  return (
    <ul className="flex flex-wrap gap-4 md:gap-8 mt-4 mb-8">
      <CategoryItem item="Everything" slug="/" className="hidden md:block" />

      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          item={getCategoryLabel(category)}
          slug={getCategoryPath(category)}
        />
      ))}
    </ul>
  )
}

const CategoryItem: React.FC<{
  item: string
  slug: string
  className?: string
}> = ({ item, slug, className }) => {
  const { asPath } = useRouter()
  const normalizedPath = asPath.split("?")[0]
  const isActive = normalizedPath === slug

  return (
    <li className={className}>
      <Link
        className={`text-base font-medium ${
          isActive ? "text-foreground" : "text-gray-500"
        } hover:text-foreground`}
        href={slug}
      >
        {item}
      </Link>
    </li>
  )
}
