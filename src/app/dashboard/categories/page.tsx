import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryGrid } from '@/components/categories/category-grid'
import { Tag } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get user's favorite categories (M:N relationship)
  const { data: userCategories } = await supabase
    .from('user_categories')
    .select('category_id, is_favorite')
    .eq('user_id', user?.id)

  // Merge the data
  const categoriesWithFavorites = categories?.map(category => ({
    ...category,
    is_favorite: userCategories?.find(uc => uc.category_id === category.id)?.is_favorite || false,
    is_user_category: userCategories?.some(uc => uc.category_id === category.id) || false
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage your spending categories and mark favorites
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCategories?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Favorites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCategories?.filter(uc => uc.is_favorite).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            Click to add categories to your collection, star your favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesWithFavorites.length > 0 ? (
            <CategoryGrid 
              categories={categoriesWithFavorites}
              userId={user?.id || ''}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories available</h3>
              <p className="text-sm text-muted-foreground">
                Categories will appear here once they are created
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
