import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const fullTailwindConfig = resolveConfig(tailwindConfig)
const theme = fullTailwindConfig.theme

export default theme
