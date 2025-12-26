"use client";

import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Bath,
  BedDouble,
  Calendar,
  Car,
  Home,
  MapPin,
  Phone,
  Ruler,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import PropertyContact from "./property-contact";
import ImageGallery from "./image-gallery";

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      "for sale": "border-green-500 text-green-700 bg-green-50",
      sold: "border-gray-500 text-gray-700 bg-gray-50",
      draft: "border-yellow-500 text-yellow-700 bg-yellow-50",
      withdrawn: "border-red-500 text-red-700 bg-red-50",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status as keyof typeof statusStyles] || "border-gray-300"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const propertyFeatures = [
    {
      icon: BedDouble,
      label: "Bedrooms",
      value: property.bedrooms,
    },
    {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-600 hover:text-gray-900"
            asChild
          >
            <Link href="/properties">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.address1}
                {property.address2 && (
                  <span className="block text-lg text-gray-600 mt-1">
                    {property.address2}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {property.city}, {property.postCode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(property.price)}
                </div>
                <div className="mt-2">{getStatusBadge(property.status)}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              Save
            </Button>
            <PropertyContact property={property} />
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          <ImageGallery images={property.images || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Description */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Property Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {property.description || "No description available."}
                </p>
              </div>
            </section>

            {/* Features Grid */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Property Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {propertyFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <feature.icon className="w-6 h-6 text-gray-600 mb-2" />
                    <div className="text-sm text-gray-600">{feature.label}</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {feature.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Additional Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Property Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-medium text-gray-900">
                    {property.id}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interested in this property?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact us for more information or to schedule a viewing.
              </p>

              <div className="space-y-4">
                <Button className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Schedule a Call
                </Button>

                <Button variant="outline" className="w-full">
                  Request Information
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Response time: Typically within 24 hours
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Map location</p>
                  <p className="text-sm text-gray-500">
                    {property.address1}, {property.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Status</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {property.status}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    This property is listed as{" "}
                    <span className="font-medium">{property.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
