import NavBar from "./components/NavBar"
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Deport from "./pages/Deport";


function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deport" element={<Deport />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
