import {useState, useEffect} from "react";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import extensionModeStorage from "@root/src/shared/storages/extensionModeStorage";
import withSuspense from "@src/shared/hoc/withSuspense";
import settingsIcon from "@src/assets/icons/settings.svg";

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const mode = useStorage (extensionModeStorage);
  const [widgetEnabled, setWidgetEnabled] = useState(false)

  useEffect(() => {
    chrome.scripting.getRegisteredContentScripts((contentScripts) => {
      if (contentScripts.length > 0) {
        setWidgetEnabled(true);
      }
    });
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
          <button className="text-sm p-1 border-1 border-yellow-500">+ Current site</button>
          <button
            onClick={toggleExtesionMode}
          >
            {mode === "whitelist" ? "Blacklist" : "Whitelist"}
          </button>
          <img src={settingsIcon} alt="settings"/>
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