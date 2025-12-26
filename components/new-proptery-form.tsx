"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Upload, X } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { saveProperty, savePropertyImage } from "@/action/properties.action";
import toast from "react-hot-toast";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";

export interface PropertyFormData {
  address1: string;
  address2: string;
  city: string;
  postCode: string;
  price: number;
  description: string;
  bedrooms: number;
  bathrooms: number;
  status: "withdrawn" | "draft" | "for sale" | "sold";
}

// Add this interface for image data
export interface UploadedImage {
  url: string;
  path: string;
  name: string;
}

export default function NewPropertyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const auth = useAuth();

  const [formData, setFormData] = useState<{
    address1: string;
    address2: string;
    city: string;
    postCode: string;
    price: number;
    description: string;
    bedrooms: number;
    bathrooms: number;
    status: "withdrawn" | "draft" | "for sale" | "sold";
    images: File[];
  }>({
    address1: "",
    address2: "",
    city: "",
    postCode: "",
    price: 0,
    description: "",
    bedrooms: 1,
    bathrooms: 1,
    status: "draft",
    images: [],
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // NEW FUNCTION: Upload single image and get URL
  const uploadImageAndGetUrl = async (
    file: File,
    propertyId: string
  ): Promise<UploadedImage> => {
    // Create unique filename to avoid collisions
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `image_${timestamp}.${fileExtension}`;
    const path = `properties/${propertyId}/${fileName}`;

    const storageRef = ref(storage, path);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null, // You can add progress tracking here if needed
        (error) => {
          console.error("Upload error:", error);
          reject(new Error(`Failed to upload image: ${error.message}`));
        },
        async () => {
          try {
            // Get download URL after successful upload
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Image uploaded, URL:", downloadURL);

            resolve({
              url: downloadURL,
              path: path,
              name: file.name,
            });
          } catch (error: any) {
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    });
  };

  // NEW FUNCTION: Upload all images and get URLs
  const uploadAllImages = async (
    files: File[],
    propertyId: string
  ): Promise<UploadedImage[]> => {
    const uploadPromises = files.map((file) =>
      uploadImageAndGetUrl(file, propertyId)
    );

    // Use Promise.all to upload all images in parallel
    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = await auth.currentUser?.getIdToken();
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { images, ...otherData } = formData;

      // 1. First save the property to get the property ID
      const res = await saveProperty({
        propertyData: otherData,
        token: token!,
      });

      if (res.success && res.propertyId) {
        toast.success("Property created successfully! Now uploading images...");

        // 2. Upload images and get their URLs
        if (images.length > 0) {
          try {
            const uploadedImages = await uploadAllImages(
              images,
              res.propertyId
            );
            toast.success(
              `${uploadedImages.length} images uploaded successfully!`
            );

            // 3. Save image URLs to your database
            const saveImageResult = await savePropertyImage(
              {
                propertyId: res.propertyId,
                images: uploadedImages, // This now contains URLs, paths, and names
              },
              token!
            );

            if (saveImageResult?.success) {
              toast.success("Property and images saved successfully!");
            } else {
              toast.error("Failed to save image URLs to database");
            }
          } catch (uploadError: any) {
            console.error("Error uploading images:", uploadError);
            toast.error(`Image upload failed: ${uploadError.message}`);
            // Still proceed since property was created
          }
        } else {
          toast.success("Property created without images");
        }

        router.push("/admin-dashboard");
      } else {
        throw new Error("Failed to create property");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(
        error.message || "Failed to create property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details below to list a new property
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl">
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
          <h2 className="text-xl font-semibold mb-6">Property Images</h2>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="images" className="cursor-pointer">
                <div className="space-y-2">
                  <p className="font-medium">
                    Drop images here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 12 images (JPEG, PNG, WebP). Max 5MB each.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.images.length} image(s) selected
                  </p>
                </div>
              </Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div>
                <p className="font-medium mb-4">
                  Uploaded Images ({previewImages.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={preview}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                        {formData.images[index]?.name || `Image ${index + 1}`}
                        <br />
                        <span className="text-[10px]">
                          {formData.images[index] &&
                            `${(
                              formData.images[index].size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? "Creating Property..." : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}
