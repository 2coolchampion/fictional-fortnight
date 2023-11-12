import {useState, useEffect} from "react";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import extensionModeStorage from "@root/src/shared/storages/extensionModeStorage";
import whitelistStorage from "@root/src/shared/storages/whitelistStorage";
import blacklistStorage from "@root/src/shared/storages/blacklistStorage";
import withSuspense from "@src/shared/hoc/withSuspense";
import settingsIcon from "@src/assets/icons/settings.svg";

const Popup = () => {
  // const theme = useStorage(exampleThemeStorage);
  const mode = useStorage (extensionModeStorage);
  const [widgetEnabled, setWidgetEnabled] = useState(false)
  const whitelist = useStorage(whitelistStorage);
  const blacklist = useStorage(blacklistStorage);
  const [currentSite, setCurrentSite] = useState<URL | null>(null);
  const  [currentSiteHostname, setCurrentSiteHostname] = useState(currentSite?.hostname?.replace(/^www\./, "") ?? "Something's wrong");

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

  const toggleWidget = () => {
    if (widgetEnabled) {
      chrome.scripting.unregisterContentScripts();
    } else {
      chrome.scripting.registerContentScripts([
        {
          id: "compactWidget-script",
          matches: ['*://*/*'],
          js: ["src/pages/content/index.js"],
        },
      ]);
    }
    setWidgetEnabled(!widgetEnabled)
  }

  const toggleExtesionMode = () => {
    extensionModeStorage.toggle()
  }

  const addCurrentSite = async () => {
    const activeTab = await chrome.tabs.query({active: true, currentWindow: true});
    const currentSite = new URL(activeTab[0].url).hostname

    if (activeTab.length > 0) {
      if (
        mode === "whitelist" &&
        !whitelist.includes(currentSite)
      ) {
        whitelistStorage.set([...whitelist, currentSite]);
      } else if (
        mode === "whitelist" &&
        whitelist.includes(currentSite)
        ) {
        whitelistStorage.remove(currentSite);
      };
      
      if (
        mode === 'blacklist' &&
        !blacklist.includes(currentSite)
      ) {
        blacklistStorage.set([...blacklist, currentSite]);
      } else if (
        mode === 'blacklist' &&
        blacklist.includes(currentSite)
        ) {
        blacklistStorage.remove(currentSite);
      };
    } else {
      console.error("No active tab");
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
        <button className="text-sm p-1 border-1 border-red-500" onClick={addCurrentSite}>
          -
          {currentSiteHostname}
        </button>
      );
    } else {
      return (
        <button className="text-sm p-1 border-1 border-green-500" onClick={addCurrentSite}>
          +
          {currentSiteHostname}
        </button>
      );
    }
  };

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

        <div className="flex justify-between">
          <div 
          className="flex justify-between items-center"
          >
            {renderButton()}
          </div>
          <button
            onClick={toggleExtesionMode}
          >
            {mode === "whitelist" ? "Whitelist" : "Blacklist"}
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
                  onClick={() => whitelistStorage.remove(site)}
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
                  onClick={() => blacklistStorage.remove(site)}
                >
                  X
                </button>
              </div>
            ))
          )  
          }
          
        </div>

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