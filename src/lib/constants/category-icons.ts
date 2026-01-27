import {
  Camera,
  Footprints,
  Gamepad,
  Glasses,
  Headphones,
  Home,
  Laptop,
  type LucideIcon,
  Shirt,
  Smartphone,
  Watch,
} from "lucide-react";

export interface CategoryIcon {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  smartphone: { value: "smartphone", label: "Smartphone", icon: Smartphone },
  laptop: { value: "laptop", label: "Laptop", icon: Laptop },
  shirt: { value: "shirt", label: "Clothing", icon: Shirt },
  home: { value: "home", label: "Home", icon: Home },
  footprints: { value: "footprints", label: "Shoes", icon: Footprints },
  watch: { value: "watch", label: "Accessories", icon: Watch },
  camera: { value: "camera", label: "Camera", icon: Camera },
  headphones: { value: "headphones", label: "Audio", icon: Headphones },
  gamepad: { value: "gamepad", label: "Gaming", icon: Gamepad },
  glasses: { value: "glasses", label: "Eyewear", icon: Glasses },
};

export const CATEGORY_ICON_OPTIONS = Object.values(CATEGORY_ICONS);
