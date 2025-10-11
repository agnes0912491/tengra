export interface Blog {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  categories: string[];
}

export const mockBlogs: Blog[] = [
  {
    id: "forging-worlds",
    title: "Forging Worlds: The Birth of Tengra",
    date: "2025-10-10",
    author: "Selim Arda",
    excerpt:
      "How divine inspiration and experimental design merged into our first creation cycle.",
    content: `
      <p>Tengra was born from the idea of uniting the divine and the technological.</p>
      <blockquote>"Creation is not about control, but harmony between will and matter."</blockquote>
      <p>We believe design and code are spiritual acts of creation.</p>
    `,
    image: "/images/blog-1.jpg",
    categories: ["Philosophy", "Development"],
  },
  {
    id: "harmony-in-code",
    title: "Harmony in Code",
    date: "2025-09-02",
    author: "Eren Kağan",
    excerpt:
      "Exploring balance between human emotion and artificial logic in next-gen systems.",
    content: `
      <p>Technology should expand humanity, not oppose it.</p>
      <p>Balance is achieved when logic and emotion coexist within design.</p>
    `,
    image: "/images/blog-2.jpg",
    categories: ["Design", "Philosophy"],
  },
  {
    id: "expanding-beyond",
    title: "Expanding Beyond the Horizon",
    date: "2025-08-15",
    author: "Mira Aydan",
    excerpt:
      "A reflection on exploration, simulation, and the spirit of technological transcendence.",
    content: `
      <p>Exploration drives creation. Each frontier expands our vision.</p>
      <p>Tengra’s network is our bridge to that horizon.</p>
    `,
    image: "/images/blog-3.jpg",
    categories: ["Expansion", "Technology"],
  },
];
