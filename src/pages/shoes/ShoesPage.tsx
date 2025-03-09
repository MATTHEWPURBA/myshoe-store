// src/pages/shoes/ShoesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shoeApi } from '../../api/shoeApi';
import { Shoe, ShoeFilters as ShoeFiltersType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useAsync } from '../../hooks/useAsync';
import ShoeList from '../../components/shoe/ShoeList';
import ShoeFiltersComponent from '../../components/shoe/ShoeFilters';
import Button from '../../components/common/Button';

const ShoesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<ShoeFiltersType>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  const { data: shoes, isLoading, error, execute: fetchShoes } = useAsync<Shoe[]>();

  useEffect(() => {
    fetchShoes(() => shoeApi.getAllShoes(filters));
  }, [filters, fetchShoes]);

  // Extract unique brands and colors for filters
  useEffect(() => {
    if (shoes) {
      const brands = [...new Set(shoes.map((shoe) => shoe.brand))];
      const colors = [...new Set(shoes.map((shoe) => shoe.color))];

      setAvailableBrands(brands);
      setAvailableColors(colors);
    }
  }, [shoes]);

  const handleFilterChange = (newFilters: ShoeFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Shoes</h1>
        {isAuthenticated && (
          <Link to="/shoes/add">
            <Button variant="primary">Add New Shoe</Button>
          </Link>
        )}
      </div>

      <ShoeFiltersComponent initialFilters={filters} onFilterChange={handleFilterChange} availableBrands={availableBrands} availableColors={availableColors} />

      <ShoeList shoes={shoes || []} isLoading={isLoading} error={error} />
    </div>
  );
};

export default ShoesPage;
