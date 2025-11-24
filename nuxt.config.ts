// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: "Arxan's Planet",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'description', name: 'description', content: 'Personal Portfolio' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ]
    }
  },
  build: {
    transpile: ['globe.gl']
  },
  vite: {
    resolve: {
      alias: {
        'three': 'three'
      },
      dedupe: ['three']
    },
    optimizeDeps: {
      include: ['globe.gl', 'three-globe', 'frame-ticker', 'three']
    }
  }
})
