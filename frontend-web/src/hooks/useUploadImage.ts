import { useState } from 'react';
import config from '@/config/config'; // Import cấu hình Public đã tạo

// Lấy Cloudinary Public Config từ file config.ts
const { CLOUD_NAME, UPLOAD_PRESET } = config.CLOUDINARY_PUBLIC;

interface UploadOptions {
    file: File;
    onSuccess?: (imageUrl: string) => void;
    onError?: (error: string) => void;
}

/**
 * Hook tùy chỉnh để xử lý Unsigned Upload (Client-Side) lên Cloudinary.
 * Nó gửi file trực tiếp đến API của Cloudinary, sử dụng Upload Preset.
 */
export const useUploadImage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const uploadImage = async ({ file, onSuccess, onError }: UploadOptions) => {
        // Kiểm tra cấu hình cần thiết
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            const msg = "Cloudinary public config (CLOUD_NAME or UPLOAD_PRESET) is missing. Check .env and config.ts.";
            setError(msg);
            onError?.(msg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Chuẩn bị FormData
            const formData = new FormData();
            formData.append('file', file);
            // Sử dụng Upload Preset đã được thiết lập là Unsigned: 'yenthao'
            formData.append('upload_preset', UPLOAD_PRESET);

            // 2. Tạo URL upload động và gọi API Cloudinary
            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

            const cloudinaryRes = await fetch(
                uploadUrl,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await cloudinaryRes.json();

            // 3. Xử lý phản hồi từ Cloudinary
            if (data.error) {
                // Cloudinary trả về lỗi trong trường 'error'
                throw new Error(`Upload failed: ${data.error.message || 'Unknown Cloudinary error'}`);
            }
            if (!data.secure_url) {
                throw new Error('Upload thất bại: Không nhận được URL ảnh.');
            }

            const finalImageUrl = data.secure_url;
            setImageUrl(finalImageUrl);
            onSuccess?.(finalImageUrl);
        } catch (err: any) {
            const message = err.message || 'Lỗi không xác định trong quá trình upload.';
            setError(message);
            onError?.(message);
        } finally {
            setLoading(false);
        }
    };

    return { uploadImage, imageUrl, loading, error };
};