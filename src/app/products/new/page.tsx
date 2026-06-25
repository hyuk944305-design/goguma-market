import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProduct } from '../actions'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인하지 않았으면 로그인 페이지로
  if (!user) {
    redirect('/auth/login?message=' + encodeURIComponent('판매글을 쓰려면 로그인해주세요.'))
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">판매글 쓰기</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <ProductForm mode="create" action={createProduct} />
      </div>
    </div>
  )
}
