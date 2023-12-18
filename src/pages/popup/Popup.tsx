import { useState, useEffect } from "react";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import extensionModeStorage, {
  ExtensionMode,
} from "@root/src/shared/storages/extensionModeStorage";
import whitelistStorage from "@root/src/shared/storages/whitelistStorage";
import blacklistStorage from "@root/src/shared/storages/blacklistStorage";
import withSuspense from "@src/shared/hoc/withSuspense";
import settingsIcon from "@src/assets/icons/settings.svg";
import useListManagement from "@src/pages/popup/Utils/useListManagment";

const Popup = () => {
  // const theme = useStorage(exampleThemeStorage);
  const mode = useStorage(extensionModeStorage);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  // let whitelist = useStorage(whitelistStorage);
  // let blacklist = useStorage(blacklistStorage);
  const [currentSite, setCurrentSite] = useState<URL | null>(null);
  const [currentSiteHostname, setCurrentSiteHostname] = useState(
    currentSite?.hostname?.replace(/^www\./, "") ?? "Something's wrong"
  );
  const {
    whitelist,
    blacklist,
    registerScript,
    unregisterScript,
    updateScript,
    addToList,
    removeFromList,
  } = useListManagement(mode);

  const [contentScripts, setContentScripts] = useState([]); //debugging

  // Sets the initial widgetEnabled state
  // And initializes the currentSite state variable
  useEffect(() => {
    chrome.scripting.getRegisteredContentScripts((contentScripts) => {
      if (contentScripts.length > 0) {
        setWidgetEnabled(true);
      }
    });

    const updateCurrentSite = async () => {
      const activeTab = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const url = new URL(activeTab[0].url);
      const newSite = url;
      setCurrentSite(newSite);
      setCurrentSiteHostname(newSite.hostname.replace(/^www\./, ""));
    };

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
  }, []);

  // SCRIPT STUFF

  const fetchContentScripts = () => {
    chrome.scripting.getRegisteredContentScripts(null, (scripts) => {
      setContentScripts(scripts);
    });
  };

  const toggleWidget = () => {
    if (widgetEnabled) {
      chrome.scripting.unregisterContentScripts();
    } else {
      if (mode === "whitelist" && whitelist.length != 0) {
        registerScript("whitelist");
      } else if (mode === "blacklist") {
        registerScript("blacklist");
      }
    }
    setWidgetEnabled(!widgetEnabled);
  };

  // from blacklist to whitelist, didn't update Exclude matches

  const toggleExtesionMode = async () => {
    const registeredScripts =
      await chrome.scripting.getRegisteredContentScripts();

    if (widgetEnabled) {
      if (registeredScripts.length > 0) {
        if (mode === "whitelist") {
          updateScript("blacklist");
        } else if (mode === "blacklist" && whitelist.length != 0) {
          updateScript("whitelist");
        } else if (mode === "blacklist" && whitelist.length === 0) {
          chrome.scripting.unregisterContentScripts({
            ids: ["compactWidget-script"],
          });
        }
      } else {
        if (mode === "whitelist") {
          registerScript("blacklist");
        } else if (mode === "blacklist" && whitelist.length != 0) {
          registerScript("whitelist");
        }
      }
    }

    extensionModeStorage.toggle();
  };

  const isOnList = () => {
    if (mode === "whitelist") {
      return whitelist.includes(currentSiteHostname);
    } else if (mode === "blacklist") {
      return blacklist.includes(currentSiteHostname);
    }
    return false;
  };

  const renderButton = () => {
    if (isOnList()) {
      return (
        <div className="flex items-center rounded border border-red-500 bg-red-400 p-1">
          <img
            src={`https://www.google.com/s2/favicons?domain=${currentSiteHostname}`}
            alt={`${currentSiteHostname} favicon`}
            className="mr-2 h-4 w-4 rounded border border-red-500 bg-white"
          />
          <button
            className="text-sm"
            onClick={() => removeFromList(widgetEnabled)}
          >
            -&nbsp;
            {currentSiteHostname}
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center rounded border border-green-500 bg-green-400 p-1">
          <img
            src={`https://www.google.com/s2/favicons?domain=${currentSiteHostname}`}
            alt={`${currentSiteHostname} favicon`}
            className="mr-2 h-4 w-4 rounded border border-green-500 bg-white"
          />
          <button className="text-sm" onClick={() => addToList(widgetEnabled)}>
            +&nbsp;
            {currentSiteHostname}
          </button>
        </div>
      );
    }
  };

  const openInfoPage = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/pages/textAnalyzer/index.html"),
    });
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
          className="border-2 border-blue-500 p-2 text-lg"
          onClick={toggleWidget}
        >
          {widgetEnabled ? "Disable" : "Enable"} widget
        </button>

        <div className="flex items-center justify-center">
          <hr className="my-4 flex-1 border-gray-800 " />
          <h2 className="mx-2 inline text-lg ">OR</h2>
          <hr className="my-4 flex-1 border-gray-800" />
        </div>

        <h3 className="mb-4 text-center">
          Disable extension for following sites:
        </h3>

        <div className="mb-4 flex justify-between">
          <div className="flex items-center justify-between">
            {renderButton()}
          </div>
          <button onClick={toggleExtesionMode}>
            {mode === "whitelist"
              ? "Whitelist"
              : `Blacklist [${blacklist.length}]`}
          </button>
          <img src={settingsIcon} alt="settings" />
        </div>

        <div>
          {mode === "whitelist"
            ? whitelist.map((site) => (
                <div className="left flex items-center" key={site}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site}`}
                    alt={`${site} favicon`}
                    className="mr-2 h-4 w-4"
                  />
                  <p className="inline">{site}</p>
                  <button
                    className="inline-block rounded-full bg-red-400 px-2"
                    onClick={async () => {
                      const updatedWhitelist =
                        await whitelistStorage.remove(site);
                      if (updatedWhitelist.length === 0) {
                        unregisterScript(updatedWhitelist);
                      } else {
                        updateScript("whitelist", updatedWhitelist);
                      }
                    }}
                  >
                    X
                  </button>
                </div>
              ))
            : blacklist.map((site) => (
                <div className="left flex items-center" key={site}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site}`}
                    alt={`${site} favicon`}
                    className="mr-2 h-4 w-4"
                  />
                  <p className="inline">{site}</p>
                  <button
                    className="inline-block rounded-full bg-red-400 px-2"
                    onClick={async () => {
                      const updatedBlacklist =
                        await blacklistStorage.remove(site);
                      updateScript("blacklist", updatedBlacklist);
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
        </div>

        <button
          className="rounded bg-blue-500 px-4 py-2 pt-2 font-bold text-white hover:bg-blue-700"
          onClick={fetchContentScripts}
        >
          Fetch Content Scripts
        </button>

        {contentScripts.map((script, index) => (
          <div key={index}>
            <h3>{script.id}</h3>
            <p>Matches: {script.matches.join(", ")}</p>
            <p>Exclude Matches: {script.excludeMatches?.join(", ")}</p>
            <p>JS Files: {script.js.join(", ")}</p>
          </div>
        ))}

        <button
          className="rounded bg-blue-500 px-4 py-2 pt-2 font-bold text-white hover:bg-blue-700"
          onClick={openInfoPage}
        >
          Analyzer
        </button>

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
