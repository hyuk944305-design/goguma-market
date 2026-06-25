'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'product-images'
const MAX_IMAGES = 5

// 폼에서 들어온 글 내용을 정리하는 도우미
function parseProductForm(formData: FormData) {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() ?? ''
  const priceRaw = (formData.get('price') as string)?.trim()
  const status = (formData.get('status') as string) || '판매중'

  const price = Number(priceRaw)

  return { title, description, price, status }
}

// 사진 파일들을 창고에 올리고, 볼 수 있는 주소(URL) 목록을 돌려줌
async function uploadImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[]
): Promise<{ urls?: string[]; error?: string }> {
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || 'image/jpeg' })

    if (error) {
      return { error: '사진 업로드에 실패했어요: ' + error.message }
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return { urls }
}

// 공개 주소(URL)에서 창고 안 파일 경로만 뽑아냄 (삭제할 때 사용)
function urlToStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

// 폼에서 넘어온 사진 파일 목록만 추려냄 (빈 파일 제외, 최대 5장)
function getImageFiles(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((v): v is File => v instanceof File && v.size > 0)
    .slice(0, MAX_IMAGES)
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

  // 사진 업로드
  const files = getImageFiles(formData)
  let images: string[] = []
  if (files.length > 0) {
    const result = await uploadImages(supabase, user.id, files)
    if (result.error) return { error: result.error }
    images = result.urls ?? []
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      status,
      images,
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

  // 현재 글의 사진 목록을 가져옴 (본인 글인지도 함께 확인)
  const { data: current, error: fetchErr } = await supabase
    .from('products')
    .select('images, seller_id')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    return { error: '판매글을 찾을 수 없어요.' }
  }
  if (current.seller_id !== user.id) {
    return { error: '본인 글만 수정할 수 있어요.' }
  }

  // 사용자가 "그대로 두기로 한" 기존 사진들
  const keepImages = formData.getAll('keepImages').filter((v): v is string => typeof v === 'string')

  // 새로 추가한 사진 업로드 (남길 사진 + 새 사진 합쳐서 최대 5장)
  const room = Math.max(0, MAX_IMAGES - keepImages.length)
  const files = getImageFiles(formData).slice(0, room)
  let newUrls: string[] = []
  if (files.length > 0) {
    const result = await uploadImages(supabase, user.id, files)
    if (result.error) return { error: result.error }
    newUrls = result.urls ?? []
  }

  const images = [...keepImages, ...newUrls]

  // 제거된 사진은 창고에서도 삭제 (남은 용량 정리)
  const removed = (current.images as string[]).filter((url) => !keepImages.includes(url))
  if (removed.length > 0) {
    const paths = removed.map(urlToStoragePath).filter((p): p is string => p !== null)
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths)
    }
  }

  const { error } = await supabase
    .from('products')
    .update({ title, description, price, status, images })
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

  // 글에 달린 사진들도 창고에서 함께 삭제
  const { data: current } = await supabase
    .from('products')
    .select('images, seller_id')
    .eq('id', id)
    .single()

  if (current && current.seller_id === user.id) {
    const paths = (current.images as string[])
      .map(urlToStoragePath)
      .filter((p): p is string => p !== null)
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths)
    }
  }

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

// 좋아요 누르기/취소 (이미 눌렀으면 취소, 아니면 추가)
export async function toggleLike(productId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  // 이미 눌렀는지 확인
  const { data: existing } = await supabase
    .from('product_likes')
    .select('product_id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // 취소
    const { error } = await supabase
      .from('product_likes')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath(`/products/${productId}`)
    return { liked: false }
  }

  // 추가
  const { error } = await supabase
    .from('product_likes')
    .insert({ product_id: productId, user_id: user.id })
  if (error) return { error: error.message }
  revalidatePath(`/products/${productId}`)
  return { liked: true }
}

// 댓글 작성
export async function addComment(productId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const content = (formData.get('content') as string)?.trim()
  if (!content) {
    return { error: '댓글 내용을 입력해주세요.' }
  }
  if (content.length > 1000) {
    return { error: '댓글은 1000자까지 쓸 수 있어요.' }
  }

  // 작성자 닉네임을 댓글에 함께 저장 (회원정보가 바뀌어도 작성 당시 이름 유지)
  const nickname =
    (user.user_metadata?.nickname as string) || user.email?.split('@')[0] || '익명'

  const { error } = await supabase.from('comments').insert({
    product_id: productId,
    user_id: user.id,
    author_nickname: nickname,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

// 댓글 삭제 (본인 댓글만)
export async function deleteComment(commentId: string, productId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}
