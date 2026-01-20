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

const fontStack = [
  "Inter",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen-Sans",
  "Ubuntu",
  "Cantarell",
  "Helvetica Neue",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
].join(",")

const monoStack = [
  "ui-monospace",
  "SFMono-Regular",
  "SF Mono",
  "Consolas",
  "Liberation Mono",
  "Menlo",
  "monospace",
].join(",")

const serifStack = [
  "var(--font-serif)",
  "IBM Plex Serif",
  "Georgia",
  "Cambria",
  "Times New Roman",
  "Times",
  "serif",
].join(",")

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // 'media' or 'class'
  theme: {
    fontFamily: {
      sans: fontStack,
      mono: monoStack,
      serif: serifStack,
    },
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        black: colors.black,
        white: colors.white,
        ...customColors,
      },
      backgroundImage: {
        post: "linear-gradient(290.44deg, rgb(182 206 235 / 6%) 27.03%, rgba(204, 219, 235, 0.420833) 59.53%, rgb(215 185 238 / 30%) 86.77%)",
        bottomCta:
          "radial-gradient(80.92% 283.41% at 34.4% -121.22%, #269ACC 0%, #461B9F 46.86%, #830757 100%)",
      },
      fontSize: {
        // Headings
        huge: ["clamp(48px, 6vw, 64px)", "1.25"],
        jumbo: ["clamp(40px, 5vw, 48px)", "1.25"],
        large: ["clamp(32px, 4vw, 40px)", "1.25"],
        h1: ["clamp(28px, 2.5vw, 32px)", "1.375"],
        h2: ["clamp(24px, 3vw, 28px)", "1.375"],
        h3: ["clamp(22px, 2.5vw, 24px)", "1.375"],
        h4: ["20px", "1.375"],
        h5: ["18px", "1.5"],
        h6: ["16px", "1.5"],

        // Paragraphs
        xl: ["20px", "1.5"],
        lg: ["18px", "1.5"],
        base: ["16px", "1.5"],
        sm: ["14px", "21px"],
        xs: ["12px", "18px"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.foreground"),

            a: {
              color: theme("colors.foreground"),
              textDecoration: "none",

              "&:hover": {
                color: theme("colors.primary"),
              },
            },

            "a code": {
              color: theme("colors.white"),
            },

            p: {
              color: theme("colors.gray.800"),

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
              color: theme("colors.foreground"),
            },
            h3: {
              color: theme("colors.foreground"),
            },
            h4: {
              color: theme("colors.foreground"),
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
