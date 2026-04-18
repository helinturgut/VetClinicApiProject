import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

export default function AuthenticatedLayout() {
  return (
    <>
      <AppNavbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
