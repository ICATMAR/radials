# radials
Website to visualize the radials of the antennas of the HF Radars used to measure currents. https://icatmar.github.io/radials


npm create vite@6.1.1
> Vue
> Javascript

npm ci // if package-lock.json is present, otherwise "npm install"

npm run dev

## Deployment
npm run build

npm run preview

Follow instructions to create a custom deployment
https://vite.dev/guide/static-deploy.html#github-pages
Change in vite.config.js and add base, as in:
```js
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/radials/' // here add the name of the repository if <yourUserNameOrOrganization>.github.io/<yourRepository>
})
```

Go to repository Settings > Pages > Build and Deployment, Source - select GitHubActions > Copy the code from the tutorial
This will create a file (yml) inside the folder .github/workflows
