import {useState, useEffect} from "react";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import extensionModeStorage, { ExtensionMode } from "@root/src/shared/storages/extensionModeStorage";
import whitelistStorage from "@root/src/shared/storages/whitelistStorage";
import blacklistStorage from "@root/src/shared/storages/blacklistStorage";
import withSuspense from "@src/shared/hoc/withSuspense";
import settingsIcon from "@src/assets/icons/settings.svg";

const Popup = () => {
  // const theme = useStorage(exampleThemeStorage);
  const mode = useStorage (extensionModeStorage);
  const [widgetEnabled, setWidgetEnabled] = useState(false)
  let whitelist = useStorage(whitelistStorage);
  let blacklist = useStorage(blacklistStorage);
  const [currentSite, setCurrentSite] = useState<URL | null>(null);
  const  [currentSiteHostname, setCurrentSiteHostname] = useState(currentSite?.hostname?.replace(/^www\./, "") ?? "Something's wrong");
  const [contentScripts, setContentScripts] = useState([]);

  useEffect(() => {
    chrome.scripting.getRegisteredContentScripts((contentScripts) => {
      if (contentScripts.length > 0) {
        setWidgetEnabled(true);
      }
    });

    const updateCurrentSite = async () => {
      const activeTab = await chrome.tabs.query({active: true, currentWindow: true});
      const url = new URL(activeTab[0].url);
      const newSite = url;
      setCurrentSite(newSite);
      setCurrentSiteHostname(newSite.hostname.replace(/^www\./, ""));
    }

    // Call the function once when the component mounts
    updateCurrentSite();

    // Add a listener to update the current site whenever it changes
    chrome.tabs.onActivated.addListener(updateCurrentSite);
    chrome.tabs.onUpdated.addListener(updateCurrentSite);
  
     // Clean up the listeners when the component unmounts
     return () => {
      chrome.tabs.onActivated.removeListener(updateCurrentSite);
      chrome.tabs.onUpdated.removeListener(updateCurrentSite);
    };
  }, [])

  // SCRIPT STUFF

  const fetchContentScripts = () => {
    chrome.scripting.getRegisteredContentScripts(null, (scripts) => {
      setContentScripts(scripts);
    });
  };

  const registerScript = (mode: 'whitelist' | 'blacklist', updatedList?) => {

      if (mode === 'whitelist') {
        
          chrome.scripting.registerContentScripts([
            {
              id: "compactWidget-script",
              matches: updatedList ? 
              updatedList.map((site) => `*://${site}/*`) :
              whitelist.map((site) => `*://${site}/*`),
              js: ["src/pages/content/index.js"],
            }
          ])
    } else if (mode === 'blacklist') {

      chrome.scripting.registerContentScripts([
        {
          id: "compactWidget-script",
          matches: ["*://*/*"],
          excludeMatches: updatedList ? 
          updatedList.map((site) => `*://${site}/*`) : 
          blacklist.map((site) => `*://${site}/*`),
          js: ["src/pages/content/index.js"],
        }
      ])
    }
  }

  const updateScript = (mode: 'whitelist' | 'blacklist', updatedList?) => {
    if (mode === 'whitelist') {
      chrome.scripting.updateContentScripts([{
        id: "compactWidget-script",
        matches: updatedList ? updatedList.map((site) => `*://${site}/*`) : whitelist.map((site) => `*://${site}/*`),
        excludeMatches: [],
        js: ["src/pages/content/index.js"],
      }])
    } else if (mode === 'blacklist') {
      chrome.scripting.updateContentScripts([{
        id: "compactWidget-script",
        matches: ["*://*/*"],
        excludeMatches: updatedList ? updatedList.map((site) => `*://${site}/*`) : blacklist.map((site) => `*://${site}/*`),
        js: ["src/pages/content/index.js"],
      }])
    }
  }

  const unregisterScript = async (updatedList) => {
    // ONLY USE FOR WHEN ITEMS ARE BEING REMOVED FROM WHITELIST OR BLACKLIST
    // removes a script if the last item in current whitelist or blacklist is removed.
                  
    // if ((mode === 'whitelist' && whitelist.length === 0) || (mode === 'blacklist' && blacklist.length === 0)) {
    //   chrome.scripting.unregisterContentScripts({
    //     ids: ["compactWidget-script"], 
    //   });
    // }

    const registeredScripts = await chrome.scripting.getRegisteredContentScripts();

    if (mode === 'whitelist' && updatedList.length === 0 && registeredScripts.length > 0) {
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"], 
      });
    };

    if (mode === 'blacklist' && updatedList.length === 0 && registerScript.length > 0) {
      
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"], 
      });

    };

    
  }

  const toggleWidget = () => {
    if (widgetEnabled) {
      chrome.scripting.unregisterContentScripts();
    } else {
      if (mode === "whitelist" && whitelist.length != 0) {
        registerScript("whitelist");

      } else if (mode === "blacklist" && blacklist.length != 0) {
        registerScript("blacklist");
      }
    }
    setWidgetEnabled(!widgetEnabled)
  }

  // from blacklist to whitelist, didn't update Exclude matches

  const toggleExtesionMode = async () => {
    const registeredScripts = await chrome.scripting.getRegisteredContentScripts();

    if (widgetEnabled) {
      if (registeredScripts.length > 0) {
        if (mode === 'whitelist' && blacklist.length != 0) {
          updateScript("blacklist");
  
        } else if ( mode === 'whitelist' && blacklist.length === 0) {
          chrome.scripting.unregisterContentScripts({
            ids: ["compactWidget-script"], 
          });
        } else if (mode === 'blacklist' && whitelist.length != 0) {
          updateScript("whitelist");
  
        } else if (mode === 'blacklist' && whitelist.length === 0) {
          chrome.scripting.unregisterContentScripts({
            ids: ["compactWidget-script"], 
          });
        };
  
      } else {
        if (mode === 'whitelist' && blacklist.length != 0) {
          registerScript("blacklist");
        } else if (mode === 'blacklist' && whitelist.length != 0) {
          registerScript("whitelist");
        };
      }
    }

    extensionModeStorage.toggle()

  }

  const addToList = async () => {
    const activeTab = await chrome.tabs.query({active: true, currentWindow: true});
    const currentSite = new URL(activeTab[0].url).hostname
  
    if (activeTab.length > 0) {
      if ( mode === 'whitelist') {

        if (widgetEnabled) {
          if (whitelist.length === 0) {
            // add to whitelist and register the content script
            const updatedWhitelist = await whitelistStorage.set([currentSite]);
            registerScript("whitelist", updatedWhitelist);
          } else {
            // add to whitelist and update the content script
            const updatedWhitelist = await whitelistStorage.set([...whitelist, currentSite]);
            updateScript("whitelist", updatedWhitelist);
          }
        } else if (!widgetEnabled) {
          // just add to whitelist
          whitelistStorage.set([...whitelist, currentSite])
        }

      } else if (mode === 'blacklist') {

        if (widgetEnabled) {

          const registeredScripts = await chrome.scripting.getRegisteredContentScripts();

          if (blacklist.length === 0 && registeredScripts.length === 0) {
            // add to blacklist and register the content script
            const updatedBlacklist = await blacklistStorage.set([currentSite]);
            registerScript("blacklist", updatedBlacklist);
          } else if (blacklist.length === 0 && registeredScripts.length != 0) {
            // add to blacklist and update the content script. This is only going to execute when the extension is first installed.
            const updatedBlacklist = await blacklistStorage.set([...blacklist, currentSite]);
            updateScript("blacklist", updatedBlacklist);
          } else {
            // add to blacklist and update the content script
            const updatedBlacklist = await blacklistStorage.set([...blacklist, currentSite]);
            updateScript("blacklist", updatedBlacklist);
          }
        } else if (!widgetEnabled) {
          // just add to blacklist
          blacklistStorage.set([...blacklist, currentSite])
        }
      }
    } else {
      console.error("No active tab");
    }
  }

  const removeFromList = async () => {
    const activeTab = await chrome.tabs.query({active: true, currentWindow: true});
    const currentSite = new URL(activeTab[0].url).hostname
    
    if (activeTab.length > 0) {
      if (mode === 'whitelist') {

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
          
        } else if  (!widgetEnabled) {
          whitelistStorage.remove(currentSite)
        }

      } else if (mode === 'blacklist') {

        if (widgetEnabled) {

            // remove from blacklist and update the content script
            const updatedBlacklist = await blacklistStorage.remove(currentSite);
            updateScript("blacklist", updatedBlacklist);
          
        } else if (!widgetEnabled) {
          blacklistStorage.remove(currentSite)
        }
      }
    }
  }

  const isOnList = () => {
    if (mode === 'whitelist') {
      return whitelist.includes(currentSiteHostname);
    } else if (mode === 'blacklist') {
      return blacklist.includes(currentSiteHostname);
    }
    return false
  }
  
  const renderButton = () => {
    if (isOnList()) {
      return (
        <button className="text-sm p-1 border-1 border-red-500" onClick={removeFromList}>
          -
          {currentSiteHostname}
        </button>
      );
    } else {
      return (
        <button className="text-sm p-1 border-1 border-green-500" onClick={addToList}>
          +
          {currentSiteHostname}
        </button>
      );
    }
  };


  
  // const onClickRemoveSite = async (site: string) => {
  //   const updatedBlacklist = await blacklistStorage.remove(site);
  //   await unregisterScript(updatedBlacklist);
  //   updateScript('blacklist');
  // }

  return (
    <>
  
      <header className="w-full">
        <button
          className="text-lg p-2 border-2 border-blue-500"
          onClick={toggleWidget}
        >
          {widgetEnabled ? "Disable" : "Enable"} widget
        </button>
        
        <div
        className="flex justify-center items-center"
        >
          <hr className="border-gray-800 my-4 flex-1 "/>
          <h2 className="text-lg inline mx-2 ">OR</h2>
          <hr className="border-gray-800 my-4 flex-1"/>
        </div>

        <h3 className="text-center mb-4">Disable extension for following sites:</h3>

        <div className="flex justify-between mb-4">
          <div 
          className="flex justify-between items-center"
          >
            {renderButton()}
          </div>
          <button
            onClick={toggleExtesionMode}
          >
            {mode === "whitelist" ? "Whitelist" : `Blacklist [${blacklist.length}]`}
          </button>
          <img src={settingsIcon} alt="settings"/>
        </div>

        <div>
          {mode === 'whitelist' ? (
            whitelist.map((site) => (
              <div
                className="flex left"
                  key={site}
                >
                <p 
                  className="inline"
                >
                  {site}
                </p>
                <button 
                  className="inline-block bg-red-400 px-2 rounded-full"
                  onClick={async () => {
                    const updatedWhitelist = await whitelistStorage.remove(site);
                    if (updatedWhitelist.length === 0) {
                      unregisterScript(updatedWhitelist);
                    } else {
                      updateScript('whitelist', updatedWhitelist);
                    }
                  }}
                >
                  X
                </button>
              </div>
            ))
          ) : (
            blacklist.map((site) => (
              <div
                className="flex left"
                  key={site}
                >
                <p 
                  className="inline"
                >
                  {site}
                </p>
                <button 
                  className="inline-block bg-red-400 px-2 rounded-full"
                  onClick={async () => {
                    const updatedBlacklist = await blacklistStorage.remove(site);
                    updateScript('blacklist', updatedBlacklist);
                  }}
                >
                  X
                </button>
              </div>
            ))
          )  
          }
          
        </div>

        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pt-2' onClick={fetchContentScripts}>Fetch Content Scripts</button>

        {contentScripts.map((script, index) => (
          <div key={index}>
            <h3>{script.id}</h3>
            <p>Matches: {script.matches.join(", ")}</p>
            <p>Exclude Matches: {script.excludeMatches?.join(", ")}</p>
            <p>JS Files: {script.js.join(", ")}</p>
          </div>
        ))}

        {/* <button
          className="text-sm"
          style={{
            color: theme === "light" ? "red" : "blue",
          }}
          onClick={exampleThemeStorage.toggle}
        >
          Toggle theme: [{theme}]
        </button> */}
      </header>
    </>
  );
};

export default withSuspense(Popup);