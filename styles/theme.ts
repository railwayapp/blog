export type ColorMode = "light" | "dark"

export const defaultColorMode: ColorMode = "dark"
export const modes: ColorMode[] = ["light", "dark"]

/*
 * Utility functions to invert colours in theme between light and dark modes
 */

const invertTheme = <T>(theme: T): T => {
  const invertMap = {
    "50": 950,
    "100": 900,
    "200": 800,
    "300": 700,
    "400": 600,
    "500": 500,
    "600": 400,
    "700": 300,
    "800": 200,
    "900": 100,
    "950": 50,
  }

  const newColours = {} as T
  for (const [name, colors] of Object.entries(theme)) {
    newColours[name] = {}
    for (const [lightScale, value] of Object.entries(colors)) {
      newColours[name][invertMap[lightScale]] = value
    }
  }

  return newColours
}

/*
 * Light / dark colour themes
 */

const lightTheme = {
  foreground: "hsl(250, 24%, 9%)",
  background: "#F1F0EF",
  secondaryBg: "hsl(0, 0%, 98%)",

  blue: {
    50: "hsl(220, 55%, 97%)",
    100: "hsl(220, 80%, 95%)",
    200: "hsl(220, 80%, 85%)",
    300: "hsl(220, 80%, 75%)",
    400: "hsl(220, 80%, 65%)",
    500: "hsl(220, 80%, 55%)",
    600: "hsl(220, 72%, 45%)",
    700: "hsl(220, 68%, 35%)",
    800: "hsl(220, 62%, 25%)",
    900: "hsl(220, 55%, 13%)",
    950: "hsl(220, 55%, 10%)",
  },

  gray: {
    50: "hsl(246,  6%, 95%)",
    100: "hsl(246,  6%, 95%)",
    200: "hsl(246,  6%, 87%)",
    300: "hsl(246,  6%, 78%)",
    400: "hsl(246,  6%, 65%)",
    500: "hsl(246,  6%, 55%)",
    600: "hsl(246,  7%, 45%)",
    700: "hsl(246,  8%, 35%)",
    800: "hsl(246, 11%, 22%)",
    900: "hsl(246, 18%, 15%)",
    950: "hsl(248, 21%, 13%)",
  },

  red: {
    50: "hsl(1, 55%, 98%)",
    100: "hsl(1, 68%, 95%)",
    200: "hsl(1, 64%, 85%)",
    300: "hsl(1, 62%, 76%)",
    400: "hsl(1, 62%, 60%)",
    500: "hsl(1, 62%, 44%)",
    600: "hsl(1, 62%, 35%)",
    700: "hsl(1, 62%, 28%)",
    800: "hsl(1, 55%, 20%)",
    900: "hsl(1, 45%, 12%)",
    950: "hsl(1, 35%, 10%)",
  },

  pink: {
    50: "hsl(270, 70%, 95%)",
    100: "hsl(270, 70%, 95%)",
    200: "hsl(270, 70%, 85%)",
    300: "hsl(270, 70%, 75%)",
    400: "hsl(270, 70%, 65%)",
    500: "hsl(270, 60%, 52%)",
    600: "hsl(270, 55%, 43%)",
    700: "hsl(270, 50%, 32%)",
    800: "hsl(270, 45%, 24%)",
    900: "hsl(270, 40%, 16%)",
    950: "hsl(270, 40%, 16%)",
  },

  green: {
    50: "hsl(152, 40%, 97%)",
    100: "hsl(152, 38%, 91%)",
    200: "hsl(152, 38%, 80%)",
    300: "hsl(152, 38%, 70%)",
    400: "hsl(152, 38%, 60%)",
    500: "hsl(152, 38%, 42%)",
    600: "hsl(152, 38%, 34%)",
    700: "hsl(152, 38%, 24%)",
    800: "hsl(152, 32%, 16%)",
    900: "hsl(152, 26%, 11%)",
    950: "hsl(152, 15%, 10%)",
  },

  yellow: {
    50: "hsl(44, 95%, 95%)",
    100: "hsl(44, 95%, 95%)",
    200: "hsl(44, 95%, 86%)",
    300: "hsl(44, 95%, 78%)",
    400: "hsl(44, 95%, 69%)",
    500: "hsl(44, 95%, 60%)",
    600: "hsl(44, 95%, 48%)",
    700: "hsl(44, 95%, 36%)",
    800: "hsl(44, 96%, 24%)",
    900: "hsl(44, 95%, 12%)",
    950: "hsl(44, 95%, 12%)",
  },
}

const darkTheme = {
  ...invertTheme(lightTheme),

  foreground: "hsl(0, 0%, 100%)",
  background: "#181622",
  secondaryBg: "hsl(250, 21%, 11%)",
}

export const colorThemes: Record<ColorMode, any> = {
  light: lightTheme,
  dark: darkTheme,
}
