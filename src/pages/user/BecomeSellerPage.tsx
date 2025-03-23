// src/pages/user/BecomeSellerPage.tsx
import React from 'react';
import SellerRequestForm from '../../components/user/SellerRequestForm';

const BecomeSellerPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Become a Seller</h1>
      <p className="text-gray-600 mb-6">
        Join our marketplace as a seller and start offering your shoes to customers around the world.
        Complete the form below to apply for seller status.
      </p>
      <SellerRequestForm />
    </div>
  );
};

export default BecomeSellerPage;