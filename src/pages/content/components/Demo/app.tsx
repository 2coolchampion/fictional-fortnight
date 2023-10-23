import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log("content view loaded");
  }, []);

  return (
    <>
      <div 
        className="text-lime-400 p-4 w-screen bg-red-400"
      >
        content view
        <button
        className="pl-2 text-red-800"
        onClick={() => {
          document.getElementById("fictional-fortnight-content-view-root")?.remove();
        }}
        >
          close</button>
      </div>
    </>
  )
}
