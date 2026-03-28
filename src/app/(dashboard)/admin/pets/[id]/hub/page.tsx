"use client";

import { useParams } from "next/navigation";
import { PetHubPage } from "@/components/pet-hub/pet-hub-page";

export default function AdminPetHubPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  return <PetHubPage petId={id} role="admin" />;
}
