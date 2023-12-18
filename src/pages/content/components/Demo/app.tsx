import { useEffect } from "react";
import Styles from "@src/global.css";

export default function App() {
  useEffect(() => {
    console.log("content view loaded");
  }, []);

  return (
    <>
      <style>{Styles}</style>
      <div
        className="w-screen bg-red-400 p-4 font-sans text-lime-400" // Need to set the font family because otherwise it would inherit from website.
      >
        content view
        <button
          className="pl-2 text-red-800"
          onClick={() => {
            document
              .getElementById("fictional-fortnight-content-view-root")
              ?.remove();
          }}
        >
          close
        </button>
      </div>
    </>
  );
}
