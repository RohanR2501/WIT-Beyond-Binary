import { useState } from "react";
import { User } from "../types";

export function useAppStore() {
  const [me, setMe] = useState<User | null>(null);
  return { me, setMe };
}
