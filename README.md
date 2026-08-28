# WICit: Where to Shop with WIC

### The California deployment of WICit is live!

#### Check it out at [findwic.com](http://findwic.com)!

---

### Development Environment Setup

1. [Install Vite+](https://viteplus.dev/guide/install)
2. [Fork the repository and setup a local clone](https://help.github.com/articles/fork-a-repo)
3. Move into your local wicit directory: `cd <yourdirectory>/wicit`
4. Copy the `.env.dist` file to a file called `.env`
   1. Navigate to https://www.mapbox.com/studio/
   2. Click "New style"
   3. Select "Classic styles" → "Streets"
   4. Click "Customize"
   5. Click "Share"
   6. In the Production URL section, copy the "Preview only" URL and update the MAPBOX_INTEGRATION_URL parameter in the .env file.
5. Start the server: `vp dev`
6. [Try it out](http://localhost:5173)

### Development

1. Setup the app using the relevant instructions above.
2. From a new command prompt, start the build watcher to automatically build client-side JavaScript and CSS when JS and CSS files change: `grunt dev`. This task does not watch for server-side changes. For those, you'll need to restart the app server.

### License

WICit is free software, and may be redistributed under the MIT-LICENSE.
