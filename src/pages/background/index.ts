import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

// register content scripts onInstall of the extension.

chrome.runtime.onInstalled.addListener(async () => {
  chrome.scripting.registerContentScripts([{
    id: "compactWidget-script",
    matches: ['*://*/*'],
    js: ["src/pages/content/index.js"],
    // KEY for cache invalidation
    // css: ["assets/css/contentStyle.chunk.css"],
  }]).then(async () => {
    const registeredScripts = await chrome.scripting.getRegisteredContentScripts();

    console.log('Scripts sucesfully registered: ', registeredScripts);
  }).catch((err) => {
    console.error('Error registering content scripts: ', err);
  })
})