export interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export interface SocialMediaPost {
  platform: "Twitter" | "Instagram" | "Linkedin";
  content: string;
}
