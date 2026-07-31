import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ID } from "appwrite";

import { databases, APPWRITE_DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { uploadPhotoFile, type Photo } from "@/lib/portfolio";

export function usePhotoAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["photos"] });

  const replacePhotoImage = async (photo: Photo, file: File): Promise<void> => {
    try {
      const path = await uploadPhotoFile(file);
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, photo.id, {
        url: path,
      });
      invalidate();
      toast.success("Photo updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const updatePhotoField = async (
    photo: Photo,
    field: "caption" | "credit",
    value: string,
  ): Promise<void> => {
    try {
      const patch = field === "caption" ? { caption: value } : { credit: value };
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, photo.id, patch);
      invalidate();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const deletePhoto = async (photo: Photo): Promise<void> => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, photo.id);
      invalidate();
      toast.success("Photo removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const togglePhotoHome = async (photo: Photo, showOnHome: boolean): Promise<void> => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, photo.id, {
        show_on_home: showOnHome,
      });
      invalidate();
      toast.success(showOnHome ? "Added to home screen" : "Removed from home screen");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const addPhotos = async (files: FileList | null, startOrder: number): Promise<void> => {
    if (!files?.length) return;
    try {
      let order = startOrder;
      for (const file of Array.from(files)) {
        const path = await uploadPhotoFile(file);
        await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, ID.unique(), {
          url: path,
          section: "editorial",
          sort_order: order++,
          is_visible: true,
          show_on_home: false,
        });
      }
      invalidate();
      toast.success("Added to gallery");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return { replacePhotoImage, updatePhotoField, deletePhoto, addPhotos, togglePhotoHome };
}
