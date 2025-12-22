import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/partials/header";

function App() {
  return (
    <Router>
      <section className='min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]'>
        <Header />
        <Routes>
          <Route
            path='/'
            element={<h1>Waazaaa</h1>}
          />
        </Routes>
      </section>
    </Router>
  );
}

export default App;
