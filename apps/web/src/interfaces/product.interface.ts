export interface Product {
  id: number
  name: string
  description: string
  price: string
  brand: string
  stock: number
  slug: string
  category: {
    active: boolean
    created_at: string
    description: string
    id: number
    name: string
    slug: string
    updated_at: string
  }
  image_url: string
  keywords: string[]
}
