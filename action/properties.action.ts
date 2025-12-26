"use server";

import {
  PropertyFormData,
  UploadedImage,
} from "@/components/new-proptery-form";
import { auth, fireStore } from "@/firebase/server";
import { Property } from "@/lib/types";
import {
  refresh,
  revalidatePath,
  revalidateTag,
  unstable_cache,
} from "next/cache";

export const saveProperty = async ({
  propertyData,
  token,
}: {
  propertyData: PropertyFormData;
  token: string;
}) => {
  const verifyIdToken = await auth.verifyIdToken(token);
  if (!verifyIdToken.admin) {
    return {
      success: false,
      message: "unauthorized",
    };
  }
  const property = await fireStore
    .collection("properties")
    .add({ ...propertyData, createdAt: new Date(), updatedAt: new Date() });
  return {
    success: true,
    propertyId: property.id,
  };
};

export const getAllProperties = async () => {
  const snapshot = await fireStore.collection("properties").get();
  const properties = snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Property)
  );
  return properties;
};

export const getPropertyById = async (id: string) => {
  const doc = await fireStore.collection("properties").doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Property;
};

export const updateProperty = async ({
  property,
  token,
}: {
  property: Property;
  token: string;
}) => {
  const { id, ...propData } = property;
  const verifyIdToken = await auth.verifyIdToken(token);
  if (!verifyIdToken.admin) {
    return {
      success: false,
      message: "unauthorized",
    };
  }
  await fireStore
    .collection("properties")
    .doc(id)
    .update({ ...propData, updated: new Date() });
  // revalidateTag("properties", { expire: 36000 });

  // // Also revalidate the page
  // revalidatePath(`/admin-dashboard`);
  // revalidatePath(`/admin-dashboard/edit/${id}`);
  // // Clear ALL relevant caches
  // revalidateTag("properties", { expire: 360 }); // For the dashboard listing
  // revalidateTag("property-details", { expire: 360 }); // For individual property pages

  // revalidatePath("/admin-dashboard"); // Dashboard page
  // revalidatePath(`/admin-dashboard/edit/${property.id}`); // Current edit page

  // // 4. Optional: Revalidate all edit pages (if you have navigation between them)
  // revalidatePath("/admin-dashboard/edit/[id]", "page");
};
export const deletePropertyById = async (token: string, id: string) => {
  const verifyIdToken = await auth.verifyIdToken(token);
  if (!verifyIdToken.admin) {
    return {
      success: false,
      message: "unauthorized",
    };
  }
  const propertyDel = await fireStore.collection("properties").doc(id).delete();
  if (propertyDel) {
    refresh();
    return { success: true };
  }
};
export const savePropertyImage = async (
  {
    propertyId,
    images,
  }: {
    propertyId: string;
    images: UploadedImage[];
  },
  token: string
) => {
  const verifyIdToken = await auth.verifyIdToken(token);
  if (!verifyIdToken.admin) {
    return {
      success: false,
      message: "unauthorized",
    };
  }
  await fireStore.collection("properties").doc(propertyId).update({ images });
  8;
  // Also revalidate the page
  // revalidatePath("/admin-dashboard");
};
