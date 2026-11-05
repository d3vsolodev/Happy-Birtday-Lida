# Happy Birthday Lida

A birthday website for Lida (21 November), built with love by TH3AN.

Pages: `/` home + opening card, `/love-Letter` letters, `/flower` blooming flower, and `/wish` make a wish.

## Run locally

```sh
npm ci
npm run dev
```

The home page photo is `src/assets/cutegirl.jpg`.

## GitHub Pages

The repository is configured to deploy with GitHub Actions to:
`https://d3vsolodev.github.io/Happy-Birtday-Lida/`

Push to the `main` branch to trigger deployment. In the repository settings, open **Pages** and set the build and deployment source to **GitHub Actions**. The workflow builds the app with its project-page base path and includes a fallback for refreshing nested pages.

If a deployment run failed before Pages was enabled, push a new commit to `main` or run **Deploy to GitHub Pages** from the **Actions** tab.
