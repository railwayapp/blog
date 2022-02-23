// eslint-disable-next-line
const colors = require("tailwindcss/colors")

const generateColorShades = (name) =>
  [50, ...Array.from({ length: 9 }).map((_, i) => (i + 1) * 100), 950].reduce(
    (acc, k) => ({
      ...acc,
      [k]: `var(--${name}-${k})`,
    }),
    {}
  )

const customColors = {
  foreground: `var(--foreground)`,
  background: `var(--background)`,
  secondaryBg: `var(--secondaryBg)`,
  gray: generateColorShades("gray"),
  pink: generateColorShades("pink"),
  blue: generateColorShades("blue"),
  yellow: generateColorShades("yellow"),
  green: generateColorShades("green"),
  red: generateColorShades("red"),
}

module.exports = {
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // 'media' or 'class'
  theme: {
    fontFamily: {
      sans: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
    },
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: colors.black,
        white: colors.white,
        ...customColors,
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.text"),

            a: {
              color: theme("colors.text"),
              textDecoration: "none",

              "&:hover": {
                color: theme("colors.primary"),
              },
            },

            "a code": {
              color: theme("colors.white"),
            },

            p: {
              a: {
                textDecoration: "underline",
              },
            },
            li: {
              a: {
                textDecoration: "underline",
              },
            },
            h1: {
              color: theme("colors.pink.50"),
            },
            h2: {
              color: theme("colors.text"),
            },
            h3: {
              color: theme("colors.text"),
            },
            h4: {
              color: theme("colors.text"),
            },
            img: {
              borderRadius: "10px",
            },
            code: {
              background: theme("colors.gray.800"),
              color: theme("colors.gray.200"),
              padding: "2px",
              borderRadius: "2px",
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
}
