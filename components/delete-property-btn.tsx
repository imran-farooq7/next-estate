"use client";

import { deletePropertyById } from "@/action/properties.action";
import { useAuth } from "@/context/authContext";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

const DeletePropertyBtn = ({ id }: { id: string }) => {
  const auth = useAuth();
  const [isPending, startTransition] = useTransition();
  const handleDelete = async () => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) return;
    startTransition(async () => {
      const res = await deletePropertyById(token, id);
      if (res?.success) {
        toast.success("Property deleted successfully");
      } else {
        toast.error("Failed to delete property");
      }
    });
  };
  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      variant="destructive"
      size="sm"
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : "Delete"}
    </Button>
  );
};

export default DeletePropertyBtn;
