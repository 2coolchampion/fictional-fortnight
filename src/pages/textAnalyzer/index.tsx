import React from "react";
import { createRoot } from "react-dom/client";
import "@pages/textAnalyzer/index.css";
import TextAnalyzer from "@root/src/pages/textAnalyzer/TextAnalyzer";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { attachTwindStyle } from "@src/shared/style/twind";

refreshOnUpdate("src/pages/textAnalyzer");

function init() {
  const appContainer = document.querySelector("#app-container");
  attachTwindStyle(appContainer, document);
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(<TextAnalyzer />);
}

init();