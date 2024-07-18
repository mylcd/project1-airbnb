import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import LandingPage from './components/LandingPage/LandingPage';
import SpotDetailPage from './components/SpotDetailPage/SpotDetailPage';
import SpotCreateForm from './components/SpotCreateForm/SpotCreateForm';
import SpotManagePage from './components/SpotManagePage/SpotManagePage';
import SpotUpdateForm from './components/SpotUpdateForm/SpotUpdateForm';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetailPage />
      },
      {
        path: '/spots/new',
        element: <SpotCreateForm />
      },
      {
        path: '/spots/current',
        element: <SpotManagePage />
      },
      {
        path: '/spots/:spotId/edit',
        element: <SpotUpdateForm />
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
