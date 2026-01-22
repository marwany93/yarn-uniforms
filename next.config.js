/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Base path for GitHub Pages (update with your repo name)
  // Example: If deploying to https://username.github.io/yarn-uniforms/
  // Uncomment and set basePath: '/yarn-uniforms'
  // basePath: '/yarn-uniforms',
  
  // Trailing slash for better compatibility with static hosting
  trailingSlash: true,
  
  // Internationalization support (optional - can be handled client-side)
  // Disabled for simpler client-side language switching
  i18n: null,
  
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://yarnuniforms.com.sa',
  },
}

module.exports = nextConfig
