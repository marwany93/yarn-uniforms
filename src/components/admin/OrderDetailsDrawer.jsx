'use client';

import { useState } from 'react';

export default function OrderDetailsDrawer({ order, isOpen, onClose }) {
    const [newStatus, setNewStatus] = useState(order?.status || 'Order Received');

    if (!isOpen || !order) return null;

    const statusOptions = [
        'Order Received',
        'Processing',
        'In Production',
        'Ready for Delivery',
        'Delivered',
        'Cancelled'
    ];

    const statusColors = {
        'Order Received': 'bg-yellow-100 text-yellow-800',
        'Processing': 'bg-blue-100 text-blue-800',
        'In Production': 'bg-purple-100 text-purple-800',
        'Ready for Delivery': 'bg-green-100 text-green-800',
        'Delivered': 'bg-gray-100 text-gray-800',
        'Cancelled': 'bg-red-100 text-red-800'
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 xl:w-1/3 bg-white shadow-2xl z-50 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-primary-600 font-semibold mt-1">{order.orderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Customer Information</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">School:</span>
                                <span className="text-sm font-medium text-gray-900">{order.customer?.schoolName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-medium text-gray-900">{order.customer?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Phone:</span>
                                <span className="text-sm font-medium text-gray-900">{order.customer?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Governorate:</span>
                                <span className="text-sm font-medium text-gray-900">{order.customer?.governorate || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Control */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Order Status</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Current Status</label>
                                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {order.status || 'Order Received'}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Update Status (Coming Soon)</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Status updates will be enabled in a future version</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            Order Items ({order.totalItems || order.items?.length || 0} total)
                        </h3>
                        <div className="space-y-4">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex gap-3">
                                            {/* Product Image */}
                                            {item.product?.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                            )}

                                            {/* Product Details */}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{item.product?.name || 'Product'}</h4>
                                                <div className="mt-2 space-y-1 text-sm">
                                                    {item.details?.material && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">Material:</span>
                                                            <span className="text-gray-900">{item.details.material}</span>
                                                        </div>
                                                    )}
                                                    {item.details?.stage && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">Stage:</span>
                                                            <span className="text-gray-900">{item.details.stage}</span>
                                                        </div>
                                                    )}
                                                    {item.details?.logo && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">Logo:</span>
                                                            <span className="text-green-600 font-medium">Included</span>
                                                        </div>
                                                    )}
                                                    {item.details?.notes && (
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-gray-600">Notes:</span>
                                                            <span className="text-gray-900 text-xs">{item.details.notes}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Size Breakdown */}
                                                {item.sizes && Object.keys(item.sizes).length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Size Breakdown:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(item.sizes).map(([size, qty]) => (
                                                                qty > 0 && (
                                                                    <span key={size} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded">
                                                                        {size}: {qty}
                                                                    </span>
                                                                )
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Total: <span className="font-semibold">{item.quantity || 0} items</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No items found in this order.</p>
                            )}
                        </div>
                    </div>

                    {/* Order Metadata */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Order Metadata</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sector:</span>
                                <span className="text-gray-900 font-medium">{order.sector || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="text-gray-900 font-medium">
                                    {order.createdAt?.toDate?.()
                                        ? order.createdAt.toDate().toLocaleString()
                                        : (order.createdAt?.seconds
                                            ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                                            : 'N/A')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Items:</span>
                                <span className="text-gray-900 font-medium">{order.totalItems || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
}
