import { createTheme } from '@suid/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#e4407f' },
    secondary: { main: '#3aa8e0' },
    background: { default: '#fdf7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: [
      '"M PLUS Rounded 1c"',
      '"Hiragino Kaku Gothic ProN"',
      '"Yu Gothic UI"',
      'Meiryo',
      'sans-serif',
    ].join(','),
  },
  shape: { borderRadius: 14 },
})
