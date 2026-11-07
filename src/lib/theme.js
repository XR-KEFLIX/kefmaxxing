export const THEMES = ['light', 'dark', 'void']

export const THEME_META = {
  light: { label: 'Light', themeColor: '#F6F3EC', title: 'White mode' },
  dark: { label: 'Dark', themeColor: '#10110F', title: 'Dark mode' },
  void: { label: 'Void', themeColor: '#050605', title: 'Void - experimental' },
}

const KEY = 'kef-theme'

export function isTheme(value) {
  return value === 'light' || value === 'dark' || value === 'void'
}

export function getTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(KEY)
    if (isTheme(stored)) return stored
  } catch {
    // ignore
  }
  return 'light'
}

export function setTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.background = THEME_META[theme].themeColor
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_META[theme].themeColor)
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    // ignore
  }
}
