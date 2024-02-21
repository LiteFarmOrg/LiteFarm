import theme from "../src/assets/theme"
import { CssBaseline, ThemeProvider, StyledEngineProvider } from "@mui/material"
import "../src/assets/colors.scss"
import "../src/assets/variables.scss"
import "../src/assets/mixins.scss"

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </StyledEngineProvider>
    ),
  ],
}

export default preview
