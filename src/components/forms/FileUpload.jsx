'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useLanguage } from '@/hooks/useLanguage';

const FileUpload = ({
    id,
    accept = 'image/*,.pdf',
    label,
    description,
    required = false,
    onChange,
    currentValue = null
}) => {
    const { t } = useLanguage();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileName, setFileName] = useState(currentValue?.name || '');
    const [fileUrl, setFileUrl] = useState(currentValue?.url || '');
    const [error, setError] = useState('');

    const translations = {
        chooseFile: { en: 'Choose File', ar: 'اختر ملف' },
        uploading: { en: 'Uploading...', ar: 'جاري الرفع...' },
        uploaded: { en: 'Uploaded', ar: 'تم الرفع' },
        changeFile: { en: 'Change File', ar: 'تغيير الملف' },
        maxSize: { en: 'Max file size: 10MB', ar: 'الحد الأقصى للملف: ١٠ ميجابايت' },
        uploadError: { en: 'Upload failed. Please try again.', ar: 'فشل الرفع. الرجاء المحاولة مرة أخرى.' },
        fileTooLarge: { en: 'File is too large. Maximum size is 10MB.', ar: 'الملف كبير جداً. الحد الأقصى ١٠ ميجابايت.' },
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError(t(translations.fileTooLarge));
            return;
        }

        setError('');
        setUploading(true);
        setUploadProgress(0);
        setFileName(file.name);

        try {
            // Create a unique file path
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `uploads/${timestamp}_${sanitizedFileName}`;

            // Create storage reference
            const storageRef = ref(storage, filePath);

            // Upload file with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error) => {
                    // Handle upload error
                    console.error('Upload error:', error);
                    setError(t(translations.uploadError));
                    setUploading(false);
                    setUploadProgress(0);
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        setFileUrl(downloadUrl);
                        setUploading(false);

                        // Notify parent component
                        if (onChange) {
                            onChange({
                                name: file.name,
                                url: downloadUrl,
                                path: filePath,
                                size: file.size,
                                type: file.type
                            });
                        }
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        setError(t(translations.uploadError));
                        setUploading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Upload error:', error);
            setError(t(translations.uploadError));
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {t(label)}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {description && (
                <p className="text-sm text-gray-500">{t(description)}</p>
            )}

            <div className="mt-1">
                {!fileUrl ? (
                    // Show file input when no file is uploaded
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <label
                            htmlFor={id}
                            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {uploading ? t(translations.uploading) : t(translations.chooseFile)}
                        </label>
                        <input
                            id={id}
                            type="file"
                            accept={accept}
                            required={required}
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="sr-only"
                        />
                        {fileName && (
                            <span className="text-sm text-gray-600 truncate max-w-xs">
                                {fileName}
                            </span>
                        )}
                    </div>
                ) : (
                    // Show uploaded file with change option
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-900">{t(translations.uploaded)}</p>
                                <p className="text-xs text-green-700 truncate max-w-xs">{fileName}</p>
                            </div>
                        </div>
                        <label
                            htmlFor={id}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                        >
                            {t(translations.changeFile)}
                            <input
                                id={id}
                                type="file"
                                accept={accept}
                                onChange={handleFileSelect}
                                className="sr-only"
                            />
                        </label>
                    </div>
                )}

                {/* Upload Progress Bar */}
                {uploading && (
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            {uploadProgress}%
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-2 text-sm text-red-600 flex items-center space-x-1 rtl:space-x-reverse">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* File size hint */}
                <p className="text-xs text-gray-400 mt-1">{t(translations.maxSize)}</p>
            </div>
        </div>
    );
};

export default FileUpload;
