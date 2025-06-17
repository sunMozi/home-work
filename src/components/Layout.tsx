import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  title: string;
}

export const Layout = ({ title }: LayoutProps) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};
