import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const routeChange = () => {
    navigate("/new");
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-nav-color">
      <h1 className="text-4x1 font-bold text-white mb-4">
        Welcome to My pastebin
      </h1>
      <p className="text-lg text-white mb-8">
        Store and share text with others
      </p>
      <button
        onClick={routeChange}
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        Get Started
      </button>
    </div>
  );
}
