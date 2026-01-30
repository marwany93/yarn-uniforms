'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartSummary() {
    const { cart, getCartItemCount } = useCart();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🛒 Cart Summary</h3>
                <div className="text-center py-8">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="text-gray-500 text-sm">No items added yet</p>
                    <p className="text-gray-400 text-xs mt-2">Configure products to see them here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
                <h3 className="text-lg font-bold flex items-center justify-between">
                    <span>🛒 Cart Summary</span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {cart.length} {cart.length === 1 ? 'item' : 'items'}
                    </span>
                </h3>
            </div>

            {/* Item List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                        <div className="flex items-start gap-3">
                            {item.image && (
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.productName}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {item.productName}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                    {item.code}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                        {item.quantity} pcs
                                    </span>
                                    {item.details?.fabric && (
                                        <span className="text-xs text-gray-600 truncate">
                                            {item.details.fabric}
                                        </span>
                                    )}
                                </div>
                                {/* Color indicator */}
                                {item.details?.color && item.details.color !== 'custom' && (
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Color:</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {item.details.color}
                                        </span>
                                    </div>
                                )}
                                {item.details?.customColorName && (
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Custom:</span>
                                        <span className="text-xs font-medium text-gray-700 truncate">
                                            {item.details.customColorName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-gray-700">Total Items:</span>
                    <span className="text-xl font-bold text-primary">{getCartItemCount()}</span>
                </div>

                {/* View Cart Button */}
                <button
                    onClick={() => router.push('/cart')}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                    View Cart & Submit
                </button>

                <p className="text-xs text-center text-gray-500 mt-2">
                    Continue configuring or review your order
                </p>
            </div>
        </div>
    );
}
