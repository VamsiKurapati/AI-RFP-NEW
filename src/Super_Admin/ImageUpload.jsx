//Create a dummy page to upload images to the cloud

import React, { useState, useEffect } from 'react';
import cloudImageService from '../utils/cloudImageService';

export default function ImageUpload() {
    const [file, setFile] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([]);

    useEffect(() => {
        const images = cloudImageService.getUploadedImages();
        setUploadedImages(images);
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        cloudImageService.uploadTemplateImage(file).then((res) => {
            console.log(res);
            setUploadedImages([...uploadedImages, res]);
        }).catch((err) => {
            console.log(err);
        });
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold'>Image Upload</h1>
            <input type="file" onChange={handleFileChange} className='border-2 border-gray-300 rounded-md p-2' />
            <button onClick={handleUpload} className='bg-blue-500 text-white p-2 rounded-md mt-4'>Upload</button>
            <div className='flex flex-col items-center justify-center mt-4'>
                {uploadedImages.map((image) => (
                    <img src={image.cloudUrl} alt={image.name} className='w-10 h-10' />
                ))}
            </div>
        </div>
    )
};
