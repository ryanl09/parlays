'use client';

import { getSession } from "@/lib/auth"
import { createCoins } from "@/app/actions/coins/create-coins";
import { useState, useTransition } from "react";

export default function RyanPage() {
    const [username, setUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState<{ success: boolean; coins?: number; userId?: string; error?: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim() || !amount.trim()) {
            setResult({ success: false, error: "Please fill in all fields" });
            return;
        }

        const numAmount = parseInt(amount);
        if (isNaN(numAmount)) {
            setResult({ success: false, error: "Amount must be a valid number" });
            return;
        }

        startTransition(async () => {
            try {
                const response = await createCoins({ 
                    username: username.trim(), 
                    amount: numAmount 
                });
                setResult(response);
                setUsername('');
                setAmount('');
            } catch (error) {
                setResult({ 
                    success: false, 
                    error: error instanceof Error ? error.message : "An error occurred" 
                });
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-4xl font-bold mb-8">Ryan Admin - Create Coins</h1>

            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter username"
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter coin amount"
                            disabled={isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        {isPending ? 'Creating...' : 'Create Coins'}
                    </button>
                </form>

                {result && (
                    <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {result.success ? (
                            <div className="text-green-800">
                                <p className="font-medium">✅ Success!</p>
                                <p className="text-sm mt-1">
                                    User coins updated. New balance: <span className="font-bold">{result.coins}</span>
                                </p>
                                <p className="text-xs mt-1 text-green-600">
                                    User ID: {result.userId}
                                </p>
                            </div>
                        ) : (
                            <div className="text-red-800">
                                <p className="font-medium">❌ Error</p>
                                <p className="text-sm mt-1">{result.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}