import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    adminLogin, 
    register, 
    logout, 
    updateProfile, 
    clearError 
  } = useAuthStore();

  // Derive these properties from the user's role
  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isRecruiter = user?.role === 'recruiter' || isAdmin;

  // Get user's full name from firstName and lastName, or from name
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || 'User';
  };

  // Get user's first name
  const getFirstName = () => {
    return user?.firstName || user?.name?.split(' ')[0] || 'User';
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    clearError,
    isSuperadmin,
    isAdmin,
    isRecruiter,
    getFullName,
    getFirstName
  };
}