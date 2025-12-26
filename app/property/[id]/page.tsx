import { notFound } from "next/navigation";
import PropertyDetails from "@/components/property/details";
import { getPropertyById } from "@/action/properties.action";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetails property={property} />;
}
