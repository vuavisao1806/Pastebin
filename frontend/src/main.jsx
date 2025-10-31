import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Error from "./components/Error.jsx";
import Message from "./components/Message.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Landing from "./components/Landing.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <Error />,
  },
  {
    path: "/new",
    element: <App />,
    errorElement: <Error />,
  },
  {
    path: "/message/:id",
    element: <Message />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
