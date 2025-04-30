import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
	  port: 443,
	  watch: {
      ignored: [
        "**/server/**"
      ]
    },
	 allowedHosts: ["intelligence.itwithlyam.co.uk"],
	  https: {
		  key: fs.readFileSync('/etc/letsencrypt/live/intelligence.itwithlyam.co.uk/privkey.pem'),
		  cert: fs.readFileSync('/etc/letsencrypt/live/intelligence.itwithlyam.co.uk/fullchain.pem')
	  },
	  proxy: {
		  '/api': {
			  target: 'http://localhost:1231',
			  changeOrigin: true
		  }
	  }
  }
})
