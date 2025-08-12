import React from 'react';
import { useWalletStore } from '../stores/walletStore';

export const UserInfo: React.FC = () => {
    const { user, isConnected } = useWalletStore();

    if (!isConnected || !user) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 z-50">
            <div className="bg-white rounded-lg shadow-md p-4 max-w-xs">
                <h3 className="text-sm font-medium text-gray-900 mb-2">User Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Address:</strong> {user.userAddress}</p>
                    <p><strong>Platform:</strong> {user.platform}</p>
                    <p><strong>Created:</strong> {user.metadata?.createdAt ? new Date(user.metadata.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Game:</strong> {user.metadata?.game || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};
