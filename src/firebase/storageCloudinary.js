export const uploadToCloudinary = async (chatId, file, onProgress) => {
  const url = 'https://api.cloudinary.com/v1_1/dj1uoelnl/auto/upload'; // cloud name الصحيح
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // upload preset الصحيح

  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.open('POST', url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress((event.loaded / event.total) * 100);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, type: file.type });
      } else {
        reject(xhr.responseText);
      }
    };
    xhr.onerror = () => reject(xhr.responseText);
    xhr.send(formData);
  });
};
