"use client";

import { useState } from "react";
import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare } from "lucide-react";

interface PropertyContactProps {
  property: Property;
}

export default function PropertyContact({ property }: PropertyContactProps) {
  const [showContactForm, setShowContactForm] = useState(false);

  const handlePhoneClick = () => {
    // In a real app, this would initiate a phone call
    alert(`Calling about property: ${property.address1}`);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePhoneClick} className="gap-2">
          <Phone className="w-4 h-4" />
          Call Agent
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowContactForm(true)}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Email Inquiry
        </Button>

        <Button variant="outline" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Message
        </Button>
      </div>
      {/* 
      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        property={property}
      /> */}
    </>
  );
}
