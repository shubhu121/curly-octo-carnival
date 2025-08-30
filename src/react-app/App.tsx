import { BrowserRouter as Router, Routes, Route } from "react-router";
import Terraformer from "@/react-app/pages/Terraformer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Terraformer />} />
      </Routes>
    </Router>
  );
}
