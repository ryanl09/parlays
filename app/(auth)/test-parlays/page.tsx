'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveParlays } from '@/app/actions/parlays/resolve-parlays';
import { testResolveParlays } from '@/app/actions/parlays/test-resolve-parlays';

export default function TestParlaysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestResolution = async () => {
    setIsLoading(true);
    try {
      const testResult = await testResolveParlays();
      setResult({ type: 'test', data: testResult });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    setIsLoading(true);
    try {
      const resolveResult = await resolveParlays();
      setResult({ type: 'resolve', data: resolveResult });
    } catch (error) {
      setResult({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test Parlay Resolution</h1>
      
      <div className="flex gap-4">
        <Button 
          onClick={handleTestResolution}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Testing...' : 'Test Resolution (Debug Info)'}
        </Button>
        
        <Button 
          onClick={handleResolve}
          disabled={isLoading}
        >
          {isLoading ? 'Resolving...' : 'Actually Resolve Parlays'}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.type === 'test' && 'Debug Information'}
              {result.type === 'resolve' && 'Resolution Result'}
              {result.type === 'error' && 'Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 