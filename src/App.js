import Login from "./components/auth/login";
import Register from "./components/auth/register";
import AddJob from "./components/pages/addJob";
import EditJob from "./components/pages/editJob";
import ErrorPage from "./components/pages/errorPage";
import GuestBanner from "./components/header/guestBanner";

import Header from "./components/header";
import Home from "./components/home";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/addJob",
      element: <AddJob />,
    },
    {
      path: "/editJob/:id",
      element: <EditJob />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    }
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <Header />
      <GuestBanner />
      <div className="w-full h-screen flex flex-col pt-[var(--header-height)]">
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;
