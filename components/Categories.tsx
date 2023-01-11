import { useRouter } from "next/router"
import Link from "./Link"

export const Categories: React.FC = () => {
  return (
    <ul className="flex gap-8 mt-8 mb-12">
      <CategoryItem item="Everything" slug="/" />
      <CategoryItem item="News" slug="/news" />
      <CategoryItem item="Guides" slug="/guide" />
      <CategoryItem item="Company" slug="/company" />
      <CategoryItem item="Engineering" slug="/engineering" />
    </ul>
  )
}

const CategoryItem: React.FC<{ item: string; slug: string }> = ({
  item,
  slug,
}) => {
  const { asPath } = useRouter()
  const isActive = asPath === slug

  return (
    <li>
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
