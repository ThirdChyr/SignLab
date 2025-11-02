'use client'

import { usePathname } from 'next/navigation';

export const useNavigation = () => {
  const pathname = usePathname();

  const homePages = ['/lessons', '/profile', '/vocabulary', '/ranking'];
  const authPages = ['/login', '/register', '/forgot', '/otp'];

  const isAtHome = homePages.includes(pathname);
  const isAuthPage = authPages.includes(pathname);

  return {
    pathname,
    isAtHome,
    isAuthPage,
  };
};