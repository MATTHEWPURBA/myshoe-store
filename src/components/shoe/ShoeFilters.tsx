// src/components/shoe/ShoeFilters.tsx
import React, { useState, useEffect } from 'react';
import { ShoeFilters as FilterType } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface ShoeFiltersProps {
  initialFilters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  availableBrands: string[];
  availableColors: string[];
}

const ShoeFilters: React.FC<ShoeFiltersProps> = ({ initialFilters, onFilterChange, availableBrands, availableColors }) => {
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterType = {};
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button className="text-blue-600 text-sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select name="brand" value={filters.brand || ''} onChange={handleChange} className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Brands</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select name="color" value={filters.color || ''} onChange={handleChange} className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Colors</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select name="size" value={filters.size?.toString() || ''} onChange={handleChange} className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Sizes</option>
                {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12].map((size) => (
                  <option key={size} value={size.toString()}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <Input type="number" name="minPrice" value={filters.minPrice?.toString() || ''} onChange={handleChange} placeholder="Min Price" min={0} step={10} fullWidth />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <Input type="number" name="maxPrice" value={filters.maxPrice?.toString() || ''} onChange={handleChange} placeholder="Max Price" min={0} step={10} fullWidth />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" variant="primary">
              Apply Filters
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShoeFilters;
