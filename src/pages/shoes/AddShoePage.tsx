// src/pages/shoes/AddShoePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { shoeApi } from '../../api/shoeApi';
import { ShoeFormData } from '../../types';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import ShoeForm from '../../components/shoe/ShoeForm';
import { useAsync } from '../../hooks/useAsync';

const AddShoePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { isLoading, execute } = useAsync();

  const handleSubmit = async (data: ShoeFormData) => {
    try {
      await execute(async () => {
        const newShoe = await shoeApi.createShoe(data);
        success('Shoe created successfully');
        navigate(`/shoes/${newShoe.id}`);
        return newShoe;
      });
    } catch (err: any) {
      error(err.message || 'Failed to create shoe');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Shoe</h1>
      <Card>
        <ShoeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default AddShoePage;
