## Litefarm translation helper

This is a Chrome extension to assist with localization of webpages using locale json files.

### Installation

0. change the `localesPath` in `src/lib/server/files.js` to the path to your locales folder
1. Install the extension as unpacked from the src folder
2. Run the server with `npm run dev`
3. Open the Litefarm webapp and set the url in the extension popup. (default is http://localhost:5173)
4. If you hover any text in the webapp while holding ctrl+shift, the extension will show a dialog with the translation tool.
5. Saving or deleteing a key will immediately update the locale json file. The changes can then be committed to the repo.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.



