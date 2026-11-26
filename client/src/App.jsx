import { Routes, Route } from "react-router-dom";

function Home() {
  return (
    <main>
      <h1>LifeLine</h1>
      <p>Blood Donation and Emergency Help Network</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
