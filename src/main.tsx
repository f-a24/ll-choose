import { render } from 'solid-js/web'
import { CssBaseline } from '@suid/material'
import { ThemeProvider } from '@suid/material/styles'
import App from './App'
import { theme } from './theme'

render(
  () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  ),
  document.getElementById('root')!,
)
