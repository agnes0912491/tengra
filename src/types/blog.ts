export interface BlogCategory {
  name: string
  description: string
}

export interface Blog {
  id: string
  title: string
  date: string
  author: string
  excerpt: string
  content: string
  image: string
  categories: BlogCategory[]
}

