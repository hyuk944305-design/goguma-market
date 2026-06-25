'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// 폼에서 들어온 값을 정리하는 도우미
function parseProductForm(formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() ?? ''
  const priceRaw = (formData.get('price') as string)?.trim()
  const status = (formData.get('status') as string) || '판매중'

  const price = Number(priceRaw)

  return { title, description, price, status }
}

// 판매글 등록(Create)
export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const { title, description, price, status } = parseProductForm(formData)

  if (!title) {
    return { error: '제목을 입력해주세요.' }
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: '가격을 올바르게 입력해주세요.' }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      status,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true, id: data.id as string }
}

// 판매글 수정(Update)
export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const { title, description, price, status } = parseProductForm(formData)

  if (!title) {
    return { error: '제목을 입력해주세요.' }
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: '가격을 올바르게 입력해주세요.' }
  }

  // 본인 글만 수정되도록 seller_id 조건도 함께 검사 (보안 규칙과 이중 안전장치)
  const { error } = await supabase
    .from('products')
    .update({ title, description, price, status })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  return { success: true, id }
}

// 판매글 삭제(Delete)
export async function deleteProduct(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}
