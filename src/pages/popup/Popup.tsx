import {useState} from "react";
import logo from "@assets/img/logo.svg";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import exampleThemeStorage from "@src/shared/storages/exampleThemeStorage";
import withSuspense from "@src/shared/hoc/withSuspense";

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const [widgetEnabled, setWidgetEnabled] = useState(false)

  return (
    <>
      <header>

        
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