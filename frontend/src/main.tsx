import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrivyProviderWrapper } from "./components/PrivyProviderWrapper.tsx";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProviderWrapper>
      <App />
    </PrivyProviderWrapper>
  </StrictMode>
);
