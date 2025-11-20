import { api } from "@/lib/api-client";

export const uploadService = {
  uploadStoreLogo: async (storeId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post<{ store: { logoUrl: string } }>(
      `/stores/${storeId}/logo`,
      formData,
      undefined,
      true // isFormData
    );

    return response.store.logoUrl || "";
  },

  uploadStoreBanner: async (storeId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post<{ store: { bannerUrl: string } }>(
      `/stores/${storeId}/banner`,
      formData,
      undefined,
      true // isFormData
    );

    return response.store.bannerUrl || "";
  },
};
