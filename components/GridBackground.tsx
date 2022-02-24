export const GridBackground: React.FC<{ className?: string }> = ({
  className,
}) => {
  return <img src="/grid.svg" className={`${className}`} />
}
