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
        matches: updatedList.map((site) => `*://${site}/*`),
        js: ["src/pages/content/index.js"],
      }])
    } else if (mode === 'blacklist') {
      chrome.scripting.updateContentScripts([{
        id: "compactWidget-script",
        matches: ["*://*/*"],
        excludeMatches: updatedList.map((site) => `*://${site}/*`),
        js: ["src/pages/content/index.js"],
      }])
    }
  }

  const unregisterScript = (updatedList) => {
    // removes a script if the last item in current whitelist or blacklist is removed.
                  
    // if ((mode === 'whitelist' && whitelist.length === 0) || (mode === 'blacklist' && blacklist.length === 0)) {
    //   chrome.scripting.unregisterContentScripts({
    //     ids: ["compactWidget-script"], 
    //   });
    // }

    if (mode === 'whitelist' && updatedList.length === 0 && registerScript.length > 0) {
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"], 
      });

      console.log("unregistered script since the last item in blacklist is removed");
    };

    if (mode === 'blacklist' && updatedList.length === 0 && registerScript.length > 0) {
      chrome.scripting.unregisterContentScripts({
        ids: ["compactWidget-script"], 
      });

      console.log("unregistered script since the last item in blacklist is removed");
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

  const toggleExtesionMode = () => {

      if (mode === 'whitelist' && blacklist.length != 0) {

        registerScript("blacklist");

      } else if (mode === 'blacklist' && whitelist.length != 0) {
        registerScript("whitelist");
      };

    // update content script with appropriate amtches and excludeMatches properties.

    extensionModeStorage.toggle()
  }

  const addToList = async () => {
    const activeTab = await chrome.tabs.query({active: true, currentWindow: true});
    const currentSite = new URL(activeTab[0].url).hostname
  
    if (activeTab.length > 0) {
      if ( mode === 'whitelist') {

        if (widgetEnabled && whitelist.length === 0) {
          const updatedWhitelist = await whitelistStorage.set([currentSite]);
          registerScript("whitelist", updatedWhitelist);

        } else {
          if (!whitelist.includes(currentSite)) {
            whitelistStorage.set([...whitelist, currentSite]);

          } else if (whitelist.includes(currentSite)) {
            whitelistStorage.remove(currentSite);

            if (whitelist.length === 0) {
              chrome.scripting.unregisterContentScripts({
                ids: ["compactWidget-script"], 
              });
            }
          }
        }

      } else {
        if (widgetEnabled && blacklist.length === 0) {
          const updatedBlacklist = await blacklistStorage.set([currentSite]);
          registerScript("blacklist", updatedBlacklist);

        } else {
          if (!blacklist.includes(currentSite)) {
            blacklistStorage.set([...blacklist, currentSite]);

          } else if (blacklist.includes(currentSite)) {
            blacklistStorage.remove(currentSite);

            if (blacklist.length === 0) {
              chrome.scripting.unregisterContentScripts({
                ids: ["compactWidget-script"], 
              });
            }
          }
        }

        
      }
    } else {
      console.error("No active tab");
    }

    if (widgetEnabled) {
      updateScript(mode);
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
        <button className="text-sm p-1 border-1 border-red-500" onClick={addToList}>
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


  
  const onClickRemoveSite = async (site: string) => {
    const updatedBlacklist = await blacklistStorage.remove(site);
    await unregisterScript(updatedBlacklist);
    updateScript('blacklist');
  }

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
                    unregisterScript(updatedWhitelist);updateScript('whitelist', updatedWhitelist);
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
                    unregisterScript(updatedBlacklist);updateScript('blacklist', updatedBlacklist);
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