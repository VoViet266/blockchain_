import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Create from "./components/Create";
import Update from "./components/Update";
import Product from "./components/Product";

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
