// src/pages/admin/ExchangeRatesPage.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}

const ExchangeRatesPage: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const { success, error: showError } = useToast();

  // Load currencies on mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCurrencyRates();
      setCurrencies(response.currencies);
      setLastUpdated(new Date(response.lastUpdated));
      setBaseCurrency(response.baseCurrency);
    } catch (err: any) {
      showError(err.message || 'Failed to load exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (code: string, value: string) => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) return;

    setCurrencies(prev => 
      prev.map(currency => 
        currency.code === code ? { ...currency, rate } : currency
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      // Convert currencies to rates object
      const rates: Record<string, number> = {};
      currencies.forEach(currency => {
        rates[currency.code] = currency.rate;
      });
      
      await adminApi.updateCurrencyRates(rates);
      success('Exchange rates updated successfully');
      fetchCurrencies(); // Refresh data
    } catch (err: any) {
      showError(err.message || 'Failed to update exchange rates');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Exchange Rates Management</h1>
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <p>
            Base Currency: <span className="font-bold">{baseCurrency}</span>
          </p>
          
          {lastUpdated && (
            <p className="text-gray-500 text-sm">
              Last Updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (1 {baseCurrency} =)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currencies.map((currency) => (
                  <tr key={currency.code}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currency.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currency.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={currency.rate}
                        onChange={(e) => handleRateChange(currency.code, e.target.value)}
                        disabled={currency.code === baseCurrency}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={fetchCurrencies}
              disabled={isLoading || isSaving}
            >
              Refresh
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              disabled={isLoading || isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExchangeRatesPage;