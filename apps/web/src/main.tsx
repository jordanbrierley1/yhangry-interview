import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { BrowseChefs } from "./pages/BrowseChefs";
import { ChefDetail } from "./pages/ChefDetail";
import { MyBookings } from "./pages/MyBookings";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<BrowseChefs />} />
          <Route path="/chefs/:id" element={<ChefDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
