import { notFound } from "next/navigation";
import { getPropertyById } from "@/action/properties.action";
import PropertyDetails from "@/components/details";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) {
    notFound();
  }
  const plainProperty = {
    id: property.id,
    address: property.address1,
    listingPrice: property.price,
    status: property.status,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    address1: property.address1,
    address2: property.address2,
    city: property.city,
    price: property.price,
    description: property.description,
    postCode: property.postCode,
    images: property.images,
  };

  return <PropertyDetails property={plainProperty} />;
}
