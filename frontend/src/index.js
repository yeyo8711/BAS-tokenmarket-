import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MoralisProvider } from "react-moralis";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MoralisProvider
      serverUrl="https://h7qzkxpavfnk.usemoralis.com:2053/server"
      appId="4UwNSwtkKW0nbmWTVzs1sInUq11yNw0DTWHHHoUB"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>
);
