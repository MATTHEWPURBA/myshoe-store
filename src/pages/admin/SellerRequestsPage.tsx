// src/pages/admin/SellerRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SellerRequest {
  id: number;
  name: string;
  email: string;
  sellerRequestStatus: string;
  sellerRequestDate: string;
  sellerRequestInfo: string;
}

const SellerRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingSellerRequests();
      setRequests(data);
    } catch (err: any) {
      showError(err.message || 'Failed to load seller requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRequest = async (userId: number, status: 'APPROVED' | 'REJECTED', notes: string = '') => {
    try {
      setIsProcessing(userId);
      await adminApi.processSellerRequest(userId, status, notes);
      success(`Seller request ${status.toLowerCase()} successfully`);
      
      // Remove from list
      setRequests(prev => prev.filter(req => req.id !== userId));
    } catch (err: any) {
      showError(err.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setIsProcessing(null);
    }
  };

  const parseRequestInfo = (infoString: string) => {
    try {
      return JSON.parse(infoString);
    } catch (e) {
      return { reason: infoString };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No Pending Requests</h2>
          <p className="text-gray-500">There are currently no pending seller requests.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Seller Requests</h1>
      
      {requests.map((request) => {
        const info = parseRequestInfo(request.sellerRequestInfo);
        
        return (
          <Card key={request.id} className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{request.name}</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {request.sellerRequestStatus}
                </span>
              </div>
              <p className="text-gray-500">{request.email}</p>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Request Reason:</h4>
                <p className="text-gray-700">{info.reason}</p>
              </div>
              
              {info.businessInfo && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Business Information:</h4>
                  <p className="text-gray-700">{info.businessInfo}</p>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Requested on: {new Date(request.sellerRequestDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <Button
                variant="danger"
                onClick={() => handleProcessRequest(request.id, 'REJECTED', 'Not approved at this time')}
                isLoading={isProcessing === request.id}
                disabled={isProcessing !== null}
              >
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => handleProcessRequest(request.id, 'APPROVED')}
                isLoading={isProcessing === request.id}
                disabled={isProcessing !== null}
              >
                Approve
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SellerRequestsPage;