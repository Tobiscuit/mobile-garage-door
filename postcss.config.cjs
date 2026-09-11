// Tailwind v4 applies vendor prefixes itself (and handles @import), so its
// upgrade guide says to drop autoprefixer. Removed here and from package.json.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
