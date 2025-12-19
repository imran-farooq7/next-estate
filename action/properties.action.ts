"use server";

import { PropertyFormData } from "@/components/new-proptery-form";
import { auth, fireStore } from "@/firebase/server";
import { Property } from "@/lib/types";

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
  const properySnapShot = await fireStore
    .collection("properties")
    .doc(id)
    .get();
  const property = {
    id: properySnapShot.id,
    ...properySnapShot.data(),
  } as Property;
  return property;
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
  const propertySnapShot = await fireStore
    .collection("properties")
    .doc(id)
    .update({ ...propData, updated: new Date() });
};
