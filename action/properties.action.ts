"use server";

import { PropertyFormData } from "@/components/new-proptery-form";
import { auth, fireStore } from "@/firebase/server";

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
      } as {
        id: string;
        address: string;
        listingPrice: number;
        status: string;
        bedrooms: number;
        bathrooms: number;
        address1: string;
        address2: string;
        city: string;
        price: number;
        description: string;
        images: string[];
      })
  );
  return properties;
};
export const getPropertyById = async (id: string) => {
  const properySnapShot = await fireStore
    .collection("properties")
    .doc(id)
    .get();
  const property = { id: properySnapShot.id, ...properySnapShot.data() } as {
    id: string;
    address: string;
    listingPrice: number;
    status: string;
    bedrooms: number;
    bathrooms: number;
    address1: string;
    address2: string;
    city: string;
    price: number;
    description: string;
    postCode: string;
    images: string[];
  };
  return property;
};
