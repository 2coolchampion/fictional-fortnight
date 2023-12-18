import React from "react";
import "@pages/options/Options.css";

const Options: React.FC = () => {
  return (
    <>
      <h1>Extension Options</h1>
      <button>Enable extension on all websites</button>
      <h2>
        Widget acess mode: <button>Whitelist</button> |{" "}
        <button>Blacklist</button>
      </h2>
    </>
  );
};

export default Options;
