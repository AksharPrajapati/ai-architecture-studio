export interface Project {
  id: string;
  name: string;
  slug: string;
}

export interface SharedProject extends Project {
  ownerName: string;
}
