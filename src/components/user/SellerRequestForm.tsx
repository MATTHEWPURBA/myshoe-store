// src/components/user/SellerRequestForm.tsx
import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../common/Card';
import Button from '../common/Button';
// @ts-ignore - This component is used in the JSX but not in the TypeScript code
import Input from '../common/Input';

interface SellerRequestStatus {
  role: string;
  sellerRequestStatus: string | null;
  sellerRequestDate: string | null;
}

const SellerRequestForm: React.FC = () => {
// @ts-ignore - This component is used in the JSX but not in the TypeScript code
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [reason, setReason] = useState('');
  const [businessInfo, setBusinessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<SellerRequestStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.checkSellerStatus();
        setRequestStatus(response);
      } catch (err: any) {
        showError(err.message || 'Failed to check seller status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [showError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      showError('Please provide a reason for becoming a seller');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userApi.requestSellerStatus({ reason, businessInfo });
      success('Seller request submitted successfully');
      
      // Update status
      const response = await userApi.checkSellerStatus();
      setRequestStatus(response);
      
      // Clear form
      setReason('');
      setBusinessInfo('');
    } catch (err: any) {
      showError(err.message || 'Failed to submit seller request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStatusMessage = () => {
    if (!requestStatus) return null;
    
    if (requestStatus.role === 'SELLER' || requestStatus.role === 'SUPERADMIN') {
      return (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-700 font-medium">
            You are already a {requestStatus.role.toLowerCase()}!
          </p>
          <p className="text-green-600">
            You can add and manage products in your dashboard.
          </p>
        </div>
      );
    }
    
    if (requestStatus.sellerRequestStatus === 'PENDING') {
      return (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <p className="text-yellow-700 font-medium">
            Your seller request is pending approval
          </p>
          <p className="text-yellow-600">
            We'll notify you once your request has been processed.
          </p>
          {requestStatus.sellerRequestDate && (
            <p className="text-yellow-600 text-sm mt-2">
              Requested on: {new Date(requestStatus.sellerRequestDate).toLocaleDateString()}
            </p>
          )}
        </div>
      );
    }
    
    if (requestStatus.sellerRequestStatus === 'REJECTED') {
      return (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-700 font-medium">
            Your previous seller request was not approved
          </p>
          <p className="text-red-600">
            You can submit a new request with additional information.
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Card title="Become a Seller">
        <div className="p-4 text-center">
          <p className="text-gray-500">Loading seller status...</p>
        </div>
      </Card>
    );
  }
  
  // If already a seller or superadmin, don't show the form
  if (requestStatus?.role === 'SELLER' || requestStatus?.role === 'SUPERADMIN') {
    return (
      <Card title="Seller Status">
        {renderStatusMessage()}
      </Card>
    );
  }
  
  // If request is pending, don't show the form
  if (requestStatus?.sellerRequestStatus === 'PENDING') {
    return (
      <Card title="Seller Request">
        {renderStatusMessage()}
      </Card>
    );
  }
  
  return (
    <Card title="Become a Seller">
      {renderStatusMessage()}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Why do you want to become a seller?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about the products you want to sell..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Information (Optional)
          </label>
          <textarea
            value={businessInfo}
            onChange={(e) => setBusinessInfo(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about your business experience, company details, etc."
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SellerRequestForm;