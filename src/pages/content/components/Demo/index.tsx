import { createRoot } from "react-dom/client";
import '../../../../global.css'
import App from "@src/pages/content/components/Demo/app";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content");

const root = document.createElement("div");
root.id = "fictional-fortnight-content-view-root";
root.style.all = "unset";

document.body.append(root);

root.style.zIndex = '9999'
root.style.position = "fixed";
root.style.bottom = "0";
root.style.right = "0";

const rootIntoShadow = document.createElement("div");
rootIntoShadow.id = "shadow-root";
// rootIntoShadow.style.position = "fixed";
// rootIntoShadow.style.bottom = "0";
// rootIntoShadow.style.right = "0";

const shadowRoot = root.attachShadow({ mode: "open" });
shadowRoot.appendChild(rootIntoShadow);

createRoot(rootIntoShadow).render(<App />);
