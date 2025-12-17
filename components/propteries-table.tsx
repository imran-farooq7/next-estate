"use cache";
import { getAllProperties } from "@/action/properties.action";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Plus } from "lucide-react";

export default async function PropertiesTable() {
  const properties = await getAllProperties();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      "for sale": "bg-green-100 text-green-800 border-green-200",
      withDrawn: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sold: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          statusStyles[status as keyof typeof statusStyles]
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Table */}
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          {/* Table Header */}
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Address
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Listing Price
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {/* Address Column */}
                <td className="p-4 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium">{property.address1}</span>
                    <span className="text-xs text-muted-foreground">
                      ID: {property.id}
                    </span>
                  </div>
                </td>

                {/* Listing Price Column */}
                <td className="p-4 align-middle font-semibold">
                  {formatCurrency(property.price)}
                </td>

                {/* Status Column */}
                <td className="p-4 align-middle">
                  {getStatusBadge(property.status)}
                </td>

                {/* Actions Column */}
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first property.
          </p>
          <Button>Add Property</Button>
        </div>
      )}
    </div>
  );
}
