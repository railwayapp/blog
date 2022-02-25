export const Background = () => (
  <div className="hidden md:block md:opacity-100 background absolute inset-0 pointer-events-none">
    <img
      src="/grid.svg"
      className="absolute top-0 left-0 transform scale-x-[-1] max-w-none"
    />
    <img src="/grid.svg" className="absolute top-[500px] right-0 max-w-none" />
    <img src="/blog.svg" className="absolute top-[0px] left-[-500px]" />
    <img
      src="/blog.svg"
      className="absolute top-[350px] right-[-450px] transform scale-x-[-1] rotate-[17deg]"
    />
  </div>
)
