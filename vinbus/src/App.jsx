import NavBar from "./components/NavBar"
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Deport from "./pages/Deport";
import Destination from "./pages/Destination";
import BusRoute from "./pages/BusRoute";


function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buses" element={<BusRoute />} />
          <Route path="/deport" element={<Deport />} />
          <Route path="/destination" element={<Destination />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
