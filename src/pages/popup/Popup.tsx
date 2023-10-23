import {useState, useEffect} from "react";
import logo from "@assets/img/logo.svg";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import withSuspense from "@src/shared/hoc/withSuspense";

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
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

  return (
    <>
      <header>
        <button
          onClick={toggleWidget}
        >
          {widgetEnabled ? "Disable" : "Enable"} widget
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