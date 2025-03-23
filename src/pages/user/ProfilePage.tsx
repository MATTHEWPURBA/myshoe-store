// src/pages/user/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SellerRequestForm from '../../components/user/SellerRequestForm';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: showError } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProfile({ name });
      success('Profile updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Loading user profile...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card title="Account Information">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            
            <Input
              label="Email"
              value={email}
              disabled
              fullWidth
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Update Profile
              </Button>
            </div>
          </form>
        </Card>
        
        {user.role === 'CUSTOMER' && (
          <SellerRequestForm />
        )}
        
        <Card title="Account Details">
          <div className="space-y-3">
            <p><span className="font-medium">Account Type:</span> {user.role}</p>
            <p><span className="font-medium">Member Since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            {user.role === 'SELLER' && (
              <p>
                <span className="font-medium">Seller Status:</span> Active
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;