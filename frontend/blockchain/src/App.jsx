import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/ui/Home";
import Create from "./pages/ui/Create";
import Update from "./pages/ui/Update";
import Product from "./pages/ui/Product";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/update" element={<Update />} />
        <Route path="/update/:id" element={<Update />} />
        <Route path="/product/:id" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
