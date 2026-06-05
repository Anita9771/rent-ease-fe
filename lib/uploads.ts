import { api } from './api';

type UploadAvatarResponse = {
  url: string;
  path: string;
  size: number;
};

export async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadAvatarResponse>('/uploads/avatar', formData);
}

export async function uploadPropertyImage(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadAvatarResponse>('/uploads/property-image', formData);
}

