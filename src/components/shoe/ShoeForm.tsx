// src/components/shoe/ShoeForm.tsx
import React, { useState } from 'react';
import { Shoe, ShoeFormData } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface ShoeFormProps {
  initialData?: Partial<Shoe>;
  onSubmit: (data: ShoeFormData) => Promise<void>;
  isLoading: boolean;
}

const ShoeForm: React.FC<ShoeFormProps> = ({ initialData = {}, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<ShoeFormData>>({
    name: initialData.name || '',
    brand: initialData.brand || '',
    price: initialData.price || 0,
    size: initialData.size || 0,
    color: initialData.color || '',
    stock: initialData.stock || 0,
    imageUrl: initialData.imageUrl || '',
    description: initialData.description || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.brand?.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.size || formData.size <= 0) {
      newErrors.size = 'Size is required';
    }

    if (!formData.color?.trim()) {
      newErrors.color = 'Color is required';
    }

    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData as ShoeFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} fullWidth required />

        <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} error={errors.brand} fullWidth required />

        <Input label="Price" type="number" name="price" value={formData.price?.toString()} onChange={handleChange} error={errors.price} min={0} step={0.01} fullWidth required />

        <Input label="Size" type="number" name="size" value={formData.size?.toString()} onChange={handleChange} error={errors.size} min={0} step={0.5} fullWidth required />

        <Input label="Color" name="color" value={formData.color} onChange={handleChange} error={errors.color} fullWidth required />

        <Input label="Stock" type="number" name="stock" value={formData.stock?.toString()} onChange={handleChange} error={errors.stock} min={0} step={1} fullWidth required />

        <Input label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} error={errors.imageUrl} fullWidth />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
          {initialData.id ? 'Update Shoe' : 'Create Shoe'}
        </Button>
      </div>
    </form>
  );
};

export default ShoeForm;
