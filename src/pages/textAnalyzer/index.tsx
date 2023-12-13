import { createRoot } from "react-dom/client";
import '../../global.css'
import "@pages/textAnalyzer/index.css";
import TextAnalyzer from "@root/src/pages/textAnalyzer/TextAnalyzer";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("src/pages/textAnalyzer");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  
  const root = createRoot(appContainer);
  root.render(<TextAnalyzer />);
}

init();