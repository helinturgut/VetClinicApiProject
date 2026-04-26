import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import Footer from './Footer';

export default function AuthenticatedLayout() {
  return (
    <>
      <AppNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
