// import PropertiesTable from "@/components/admin/properties-table";
import { getAllProperties } from "@/action/properties.action";
import PropertiesTable from "@/components/propteries-table";
import TableSkeleton from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Mock data - replace with your actual data source
const mockProperties = [
  {
    id: "1",
    address: "123 Main St, San Francisco, CA 94110",
    listingPrice: 1250000,
    status: "Active",
  },
  {
    id: "2",
    address: "456 Oak Ave, San Mateo, CA 94401",
    listingPrice: 899000,
    status: "Pending",
  },
  {
    id: "3",
    address: "789 Pine Rd, Palo Alto, CA 94301",
    listingPrice: 2350000,
    status: "Active",
  },
];

export default async function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex items-center justify-between pt-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Property Management
          </h1>
          <p className="text-muted-foreground">
            Manage your real estate properties
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href={"/admin-dashboard/new"}>
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <Suspense fallback={<TableSkeleton />}>
          <PropertiesTable />
        </Suspense>
      </main>
    </div>
  );
}
