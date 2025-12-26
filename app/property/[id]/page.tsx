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

  return <PropertyDetails property={property} />;
}
