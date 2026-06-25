import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct } from '../../actions'
import ProductForm from '../../ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?message=' + encodeURIComponent('로그인이 필요해요.'))
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  // 본인 글이 아니면 상세 페이지로 돌려보냄
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`)
  }

  // 글 id를 미리 넣어둔 수정 함수
  const action = updateProduct.bind(null, id)

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">판매글 수정</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <ProductForm
          mode="edit"
          action={action}
          defaultValues={{
            title: product.title,
            description: product.description,
            price: product.price,
            status: product.status,
            images: product.images ?? [],
          }}
        />
      </div>
    </div>
  )
}
