import { getPropertyById } from "@/action/properties.action";
import EditPropertyForm from "@/components/edit-property-form";
import Spinner from "@/components/spinner";
import { Suspense } from "react";

const PropertyEditPAge = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const property = await getPropertyById(id);
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
  return (
    <div>
      <h1 className="text-3xl text-center font-bold tracking-tight pt-10">
        Edit Property
      </h1>
      <Suspense fallback={<Spinner fullScreen />}>
        <EditPropertyForm property={plainProperty} />;
      </Suspense>
    </div>
  );
};

export default PropertyEditPAge;
