// src/pages/shoes/EditShoePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shoeApi } from '../../api/shoeApi';
import { Shoe, ShoeFormData } from '../../types';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import ShoeForm from '../../components/shoe/ShoeForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAsync } from '../../hooks/useAsync';

const EditShoePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [isLoadingShoe, setIsLoadingShoe] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { isLoading: isSubmitting, execute } = useAsync();

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        setIsLoadingShoe(true);
        setLoadError(null);

        if (!id) throw new Error('No shoe ID provided');

        const data = await shoeApi.getShoeById(parseInt(id));
        setShoe(data);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load shoe');
        showError(err.message || 'Failed to load shoe');
      } finally {
        setIsLoadingShoe(false);
      }
    };

    fetchShoe();
  }, [id, showError]);

  const handleSubmit = async (data: ShoeFormData) => {
    if (!id) return;

    try {
      await execute(async () => {
        const updatedShoe = await shoeApi.updateShoe(parseInt(id), data);
        success('Shoe updated successfully');
        navigate(`/shoes/${updatedShoe.id}`);
        return updatedShoe;
      });
    } catch (err: any) {
      showError(err.message || 'Failed to update shoe');
    }
  };

  if (isLoadingShoe) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError || !shoe) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
        <p>{loadError || 'Shoe not found'}</p>
        <button onClick={() => navigate('/shoes')} className="text-blue-600 hover:underline mt-2">
          Back to Shoes
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Shoe</h1>
      <Card>
        <ShoeForm initialData={shoe} onSubmit={handleSubmit} isLoading={isSubmitting} />
      </Card>
    </div>
  );
};

export default EditShoePage;
