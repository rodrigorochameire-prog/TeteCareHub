"use client";

import { use } from "react";
import { PetHubPage } from "@/components/pet-hub/pet-hub-page";

interface TutorPetPageProps {
  params: Promise<{ id: string }>;
}

export default function TutorPetDetailPage({ params }: TutorPetPageProps) {
  const { id } = use(params);
  return <PetHubPage petId={parseInt(id)} role="tutor" />;
}
