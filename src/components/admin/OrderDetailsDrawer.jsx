'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function OrderDetailsDrawer({ order, isOpen, onClose }) {
    const [newStatus, setNewStatus] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [updating, setUpdating] = useState(false);

    // Initialize status and date when drawer opens
    useEffect(() => {
        if (order && isOpen) {
            setNewStatus(order.status || 'Order Received');
            // Format date if exists
            if (order.expectedCompletionDate) {
                // Handle both date string and Firestore timestamp
                const dateStr = typeof order.expectedCompletionDate === 'string'
                    ? order.expectedCompletionDate
                    : order.expectedCompletionDate?.toDate?.()?.toISOString()?.split('T')[0] || '';
                setTargetDate(dateStr);
            } else {
                setTargetDate('');
            }
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const STATUS_STAGES = [
        'Order Received',
        'Contacting',
        'Quotation Sent',
        'Sample Production',
        'Manufacturing',
        'Delivered',
        'Cancelled'
    ];

    const statusColors = {
        'Order Received': 'bg-yellow-100 text-yellow-800',
        'Contacting': 'bg-blue-100 text-blue-800',
        'Quotation Sent': 'bg-indigo-100 text-indigo-800',
        'Sample Production': 'bg-purple-100 text-purple-800',
        'Manufacturing': 'bg-orange-100 text-orange-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        // Legacy statuses
        'Processing': 'bg-blue-100 text-blue-800',
        'In Production': 'bg-purple-100 text-purple-800',
        'Ready for Delivery': 'bg-green-100 text-green-800'
    };

    const handleUpdateOrder = async () => {
        if (!order?.id) {
            alert('Error: Order ID not found');
            return;
        }

        setUpdating(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: newStatus,
                expectedCompletionDate: targetDate || null,
                lastUpdated: new Date()
            });
            alert('✅ Order updated successfully!');
            // Optionally close drawer or refresh
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Update failed:', error);
            alert('❌ Failed to update order: ' + error.message);
        } finally {
            setUpdating(false);
        }
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
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex gap-3 mb-3">
                                            {/* Product Image */}
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.productName || item.name || 'Product'}
                                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300 flex-shrink-0"
                                                />
                                            )}

                                            {/* Product Name & Code */}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-base">
                                                    {item.productName || item.name || item.title || 'Product'}
                                                </h4>
                                                {item.code && (
                                                    <p className="text-xs text-gray-500 mt-1">Code: {item.code}</p>
                                                )}
                                                <div className="mt-2">
                                                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                                        Total Qty: {item.quantity || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specifications */}
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {item.details?.material && (
                                                <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded">
                                                    🧶 {item.details.material}
                                                </span>
                                            )}
                                            {item.details?.stage && (
                                                <span className="text-xs bg-white border border-gray-300 px-2 py-1 rounded">
                                                    🏫 {item.details.stage}
                                                </span>
                                            )}
                                            {item.details?.logo && (
                                                <span className="text-xs bg-green-50 border border-green-300 text-green-700 px-2 py-1 rounded font-medium">
                                                    🏷️ Logo: {item.details.logo}
                                                </span>
                                            )}
                                        </div>

                                        {/* SIZE BREAKDOWN - THE CRITICAL PART */}
                                        {item.details?.sizes && Object.keys(item.details.sizes).length > 0 ? (
                                            <div className="bg-white p-3 rounded border-2 border-blue-100">
                                                <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">📏 Size Breakdown</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(item.details.sizes).map(([size, qty]) => (
                                                        qty > 0 && (
                                                            <div key={size} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-200 font-medium">
                                                                <span className="text-gray-600">Size </span>
                                                                <span className="font-bold text-blue-900">{size}</span>
                                                                <span className="text-gray-600">: </span>
                                                                <span className="font-bold text-blue-900">{qty}</span>
                                                                <span className="text-xs text-gray-500"> pcs</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 p-2 rounded border border-red-200">
                                                <p className="text-xs text-red-600">⚠️ No size data found for this item</p>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {item.details?.notes && (
                                            <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <span className="font-semibold">📝 Notes: </span>
                                                {item.details.notes}
                                            </div>
                                        )}
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
