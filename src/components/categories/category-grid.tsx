'use client'

import { useTransition } from 'react'
import { Star, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  addUserCategory, 
  removeUserCategory, 
  toggleFavoriteCategory 
} from '@/app/actions/categories'
import type { Category } from '@/types'

interface CategoryWithStatus extends Category {
  is_favorite: boolean
  is_user_category: boolean
}

interface CategoryGridProps {
  categories: CategoryWithStatus[]
  userId: string
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [isPending, startTransition] = useTransition()

  const handleAddCategory = (categoryId: string) => {
    startTransition(async () => {
      const result = await addUserCategory(categoryId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Category added to your collection')
      }
    })
  }

  const handleRemoveCategory = (categoryId: string) => {
    startTransition(async () => {
      const result = await removeUserCategory(categoryId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Category removed from your collection')
      }
    })
  }

  const handleToggleFavorite = (categoryId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleFavoriteCategory(categoryId, currentStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites')
      }
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className={`relative transition-all hover:shadow-md ${
            category.is_user_category ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  {category.color && (
                    <div 
                      className="w-4 h-4 rounded-full mt-1"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
              </div>
              
              {category.is_user_category && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleFavorite(category.id, category.is_favorite)}
                  disabled={isPending}
                >
                  <Star 
                    className={`h-4 w-4 ${
                      category.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {category.is_user_category ? (
                <>
                  <Badge variant="secondary" className="text-xs">
                    In Collection
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 w-8 p-0"
                    onClick={() => handleRemoveCategory(category.id)}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleAddCategory(category.id)}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
