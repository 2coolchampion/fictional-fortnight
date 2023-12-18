import { useState } from "react";
import useStorage from "@src/shared/hooks/useStorage";
import whitelistStorage from "@root/src/shared/storages/whitelistStorage";
import blacklistStorage from "@root/src/shared/storages/blacklistStorage";

const useListManagement = (mode) => {
  let whitelist = useStorage(whitelistStorage);
  let blacklist = useStorage(blacklistStorage);

  const registerScript = (mode: "whitelist" | "blacklist", updatedList?) => {
    // updated list property -> By passing updatedList as an argument, the registerScript function does not rely on the state variable whitelist or blacklist to be already updated. Instead, it uses the most recent data without waiting for the next render cycle where the state would be updated.

    if (mode === "whitelist") {
      chrome.scripting.registerContentScripts([
        {
          id: "compactWidget-script",
          matches: updatedList
            ? updatedList.map((site) => `*://${site}/*`)
            : whitelist.map((site) => `*://${site}/*`),
          js: ["src/pages/content/index.js"],
          css: ["./assets/css/Global.chunk.css"],
        },
      ]);
    } else if (mode === "blacklist") {
      chrome.scripting.registerContentScripts([
        {
          id: "compactWidget-script",
          matches: ["*://*/*"],
          excludeMatches: updatedList
            ? updatedList.map((site) => `*://${site}/*`)
            : blacklist.map((site) => `*://${site}/*`),
          js: ["src/pages/content/index.js"],
          css: ["./assets/css/Global.chunk.css"],
        },
      ]);
    }
  };

  const unregisterScript = async (updatedList) => {
    // ONLY USE FOR WHEN ITEMS ARE BEING REMOVED FROM WHITELIST OR BLACKLIST
    // removes a script if the last item in current whitelist or blacklist is removed.

    // if ((mode === 'whitelist' && whitelist.length === 0) || (mode === 'blacklist' && blacklist.length === 0)) {
    //   chrome.scripting.unregisterContentScripts({
    //     ids: ["compactWidget-script"],
    //   });
    // }

    const registeredScripts =
      await chrome.scripting.getRegisteredContentScripts();

    if (
      mode === "whitelist" &&
      updatedList.length === 0 &&
      registeredScripts.length > 0
    ) {
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"],
      });
    }

    if (
      mode === "blacklist" &&
      updatedList.length === 0 &&
      registeredScripts.length > 0
    ) {
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"],
      });
    }
  };

  const updateScript = (mode: "whitelist" | "blacklist", updatedList?) => {
    if (mode === "whitelist") {
      chrome.scripting.updateContentScripts([
        {
          id: "compactWidget-script",
          matches: updatedList
            ? updatedList.map((site) => `*://${site}/*`)
            : whitelist.map((site) => `*://${site}/*`),
          excludeMatches: [],
          js: ["src/pages/content/index.js"],
        },
      ]);
    } else if (mode === "blacklist") {
      chrome.scripting.updateContentScripts([
        {
          id: "compactWidget-script",
          matches: ["*://*/*"],
          excludeMatches: updatedList
            ? updatedList.map((site) => `*://${site}/*`)
            : blacklist.map((site) => `*://${site}/*`),
          js: ["src/pages/content/index.js"],
        },
      ]);
    }
  };

  const addToList = async (widgetEnabled) => {
    const activeTab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentSite = new URL(activeTab[0].url).hostname;

    if (activeTab.length > 0) {
      if (mode === "whitelist") {
        if (widgetEnabled) {
          if (whitelist.length === 0) {
            // add to whitelist and register the content script
            const updatedWhitelist = await whitelistStorage.set([currentSite]);
            registerScript("whitelist", updatedWhitelist);
          } else {
            // add to whitelist and update the content script
            const updatedWhitelist = await whitelistStorage.set([
              ...whitelist,
              currentSite,
            ]);
            updateScript("whitelist", updatedWhitelist);
          }
        } else if (!widgetEnabled) {
          // just add to whitelist
          whitelistStorage.set([...whitelist, currentSite]);
        }
      } else if (mode === "blacklist") {
        if (widgetEnabled) {
          const registeredScripts =
            await chrome.scripting.getRegisteredContentScripts();

          if (blacklist.length === 0 && registeredScripts.length === 0) {
            // add to blacklist and register the content script
            const updatedBlacklist = await blacklistStorage.set([currentSite]);
            registerScript("blacklist", updatedBlacklist);
          } else if (blacklist.length === 0 && registeredScripts.length != 0) {
            // add to blacklist and update the content script. This is only going to execute when the extension is first installed.
            const updatedBlacklist = await blacklistStorage.set([
              ...blacklist,
              currentSite,
            ]);
            updateScript("blacklist", updatedBlacklist);
          } else {
            // add to blacklist and update the content script
            const updatedBlacklist = await blacklistStorage.set([
              ...blacklist,
              currentSite,
            ]);
            updateScript("blacklist", updatedBlacklist);
          }
        } else if (!widgetEnabled) {
          // just add to blacklist
          blacklistStorage.set([...blacklist, currentSite]);
        }
      }
    } else {
      console.error("No active tab");
    }
  };

  const removeFromList = async (widgetEnabled) => {
    const activeTab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentSite = new URL(activeTab[0].url).hostname;

    if (activeTab.length > 0) {
      if (mode === "whitelist") {
        if (widgetEnabled) {
          if (whitelist.length === 1) {
            // remove from whitelist and unregister the content script
            whitelistStorage.remove(currentSite);
            chrome.scripting.unregisterContentScripts({
              ids: ["compactWidget-script"],
            });
          } else {
            // remove from whitelist and update the content script
            const updatedWhitelist = await whitelistStorage.remove(currentSite);
            updateScript("whitelist", updatedWhitelist);
          }
        } else if (!widgetEnabled) {
          whitelistStorage.remove(currentSite);
        }
      } else if (mode === "blacklist") {
        if (widgetEnabled) {
          // remove from blacklist and update the content script
          const updatedBlacklist = await blacklistStorage.remove(currentSite);
          updateScript("blacklist", updatedBlacklist);
        } else if (!widgetEnabled) {
          blacklistStorage.remove(currentSite);
        }
      }
    }
  };

  return {
    whitelist,
    blacklist,
    registerScript,
    unregisterScript,
    updateScript,
    addToList,
    removeFromList,
  };
};

// !todo: I could potentially group register and unregister script into their own hook, related to script managment, and leave the rest for siteList managment.

export default useListManagement;
