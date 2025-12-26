"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { savePropertyImage, updateProperty } from "@/action/properties.action";
import { Property } from "@/lib/types";
import { useAuth } from "@/context/authContext";
import toast from "react-hot-toast";
import { UploadedImage } from "./new-proptery-form";
import { deleteObject, ref, UploadTask } from "firebase/storage";
import { storage } from "@/firebase/client";
import { uploadAllImages } from "@/lib/utils";

interface PropertyFormData {
  address1: string;
  address2: string;
  city: string;
  postCode: string;
  price: number;
  description: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
  images: UploadedImage[];
  newImages: File[];
  removedImages: string[];
}

export default function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  const auth = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    address1: property.address1,
    address2: property.address2,
    city: property.city,
    postCode: property.postCode,
    price: property.price,
    description: property.description,
    bedrooms: property.bathrooms,
    bathrooms: property.bathrooms,
    status: property.status,
    images: property.images,
    newImages: [],
    removedImages: [],
  });
  useEffect(() => {
    setFormData({
      address1: property.address1,
      address2: property.address2,
      city: property.city,
      postCode: property.postCode,
      price: property.price,
      description: property.description,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      status: property.status,
      images: property.images || [],
      newImages: [],
      removedImages: [],
    });
    setNewImagePreviews([]);
  }, [property]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "bedrooms" || name === "bathrooms"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...newFiles],
    }));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.url !== imageUrl),
      removedImages: [...prev.removedImages, imageUrl],
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const restoreImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      removedImages: prev.removedImages.filter((img) => img !== imageUrl),
      images: [
        ...prev.images,
        property.images.find((img) => img.url === imageUrl)!,
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = await auth.currentUser?.getIdToken();
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        submitData.append(
          key,
          formData[key as keyof PropertyFormData] as string
        );
      });

      submitData.append("id", property.id);

      // // Here you would typically make an API call
      // console.log("Updating property data:", {
      //   ...formData,
      //   id: property.id,
      // });'
      const { newImages, removedImages, ...data } = formData;
      const res = await updateProperty({
        property: {
          id: property.id,
          address: data.address1,
          ...data,
        },
        token: token!,
      });
      if (res?.success!) {
        toast.error("failed to update property");
        return;
      }
      const storageTasks: (UploadTask | Promise<void>)[] = [];
      const imagesToDeletePaths = formData.removedImages;
      imagesToDeletePaths.forEach((path) => {
        // Delete image from storage
        storageTasks.push(deleteObject(ref(storage, path)));
      });
      const uploadedImages = await uploadAllImages(
        formData.newImages,
        property.id
      );
      const response = await savePropertyImage(
        { propertyId: property.id, images: uploadedImages },
        token!
      );

      // Simulate API call

      // Redirect back to admin dashboard

      router.refresh();

      // Show success
      toast.success("Property updated successfully");

      // Navigate after a short delay to ensure cache is cleared
      setTimeout(() => {
        router.push("/admin-dashboard");
      }, 100);

      // Optionally show success toast
    } catch (error) {
      console.error("Error updating property:", error);
      // Handle error (show error toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <Loader2 className="w-8 h-8 animate-spin text-primary" />
  //         <span className="ml-2">Loading property data...</span>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8 mx flex justify-center">
        <Button
          variant="ghost"
          className="mb-4 gap-2 "
          onClick={() => router.push("/admin-dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        {/* Property Details Card */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">Property Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="address1">Address Line 1 *</Label>
              <Input
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="Apt 4B"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="San Francisco"
                required
              />
            </div>

            {/* Post Code */}
            <div className="space-y-2">
              <Label htmlFor="postCode">Post Code *</Label>
              <Input
                id="postCode"
                name="postCode"
                value={formData.postCode}
                onChange={handleInputChange}
                placeholder="94110"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing & Status Card */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">Pricing & Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Listing Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1250000"
                  className="pl-8"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="for sale">For Sale</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Property Specifications Card */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bedrooms */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Select
                value={formData.bedrooms.toString()}
                onValueChange={(value) => handleSelectChange("bedrooms", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "bedroom" : "bedrooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Select
                value={formData.bathrooms.toString()}
                onValueChange={(value) =>
                  handleSelectChange("bathrooms", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "bathroom" : "bathrooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">Description</h2>

          <div className="space-y-2">
            <Label htmlFor="description">Property Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the property features, amenities, and highlights..."
              rows={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              Write a compelling description to attract potential buyers
            </p>
          </div>
        </div>

        {/* Images Upload Card */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Property Images</h2>
            <span className="text-sm text-muted-foreground">
              {/* {formData.existingImages.length + formData.newImages.length}{" "} */}
              images total
            </span>
          </div>

          <div className="space-y-8">
            {/* Existing Images */}
            {formData.images?.length > 0 && (
              <div>
                <h3 className="font-medium mb-4">Existing Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={img.url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-6 h-6"
                        onClick={() => removeExistingImage(img.url)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Images (if any) */}
            {formData.removedImages.length > 0 && (
              <div className="p-4 border border-dashed rounded-lg">
                <h3 className="font-medium mb-2 text-destructive">
                  Removed Images ({formData.removedImages.length})
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  These images will be deleted when you save changes
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.removedImages.map((imageUrl, index) => (
                    <Button
                      key={`removed-${index}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => restoreImage(imageUrl)}
                      className="text-xs"
                    >
                      Restore Image {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload Area */}
            <div>
              <h3 className="font-medium mb-4">Add New Images</h3>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label
                  htmlFor="newImages"
                  className="cursor-pointer justify-center"
                >
                  <div className="space-y-2">
                    <p className="font-medium">
                      Drop images here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload additional images (JPEG, PNG, WebP). Max 5MB each.
                    </p>
                  </div>
                </Label>
                <Input
                  id="newImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <h3 className="font-medium mb-4">
                  New Images ({newImagePreviews.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={preview}
                          alt={`New image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-6 h-6"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs p-1 text-center">
                        New Image
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving Changes..." : "Update Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}
