import { useSelector } from 'react-redux';


export function useAuth() {
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'Admin',
    isVet: user?.role === 'Veterinarian',
    isReceptionist: user?.role === 'Receptionist',
  };
}
