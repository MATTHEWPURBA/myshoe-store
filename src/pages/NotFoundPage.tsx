// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-2xl font-medium text-gray-600 mb-8">Page Not Found</p>
      <p className="text-gray-500 text-center max-w-md mb-8">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;