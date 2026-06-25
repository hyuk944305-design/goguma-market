import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '../DeleteButton'
import LikeButton from '../LikeButton'
import CommentSection, { type Comment } from '../CommentSection'

function formatPrice(price: number) {
  return price === 0 ? '나눔' : `${price.toLocaleString('ko-KR')}원`
}

const STATUS_STYLE: Record<string, string> = {
  판매중: 'bg-orange-100 text-orange-600',
  예약중: 'bg-blue-100 text-blue-600',
  판매완료: 'bg-gray-200 text-gray-500',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  // 좋아요 개수와, 현재 사용자가 눌렀는지 여부
  const { count: likeCount } = await supabase
    .from('product_likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  let likedByMe = false
  if (user) {
    const { data: myLike } = await supabase
      .from('product_likes')
      .select('product_id')
      .eq('product_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    likedByMe = !!myLike
  }

  // 댓글 목록 (오래된 순)
  const { data: comments } = await supabase
    .from('comments')
    .select('id, author_nickname, content, created_at, user_id')
    .eq('product_id', id)
    .order('created_at', { ascending: true })

  const isOwner = user?.id === product.seller_id
  const createdAt = new Date(product.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link
        href="/products"
        className="inline-block text-sm text-gray-400 hover:text-gray-600 mb-6"
      >
        ← 목록으로
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              STATUS_STYLE[product.status] ?? 'bg-gray-100 text-gray-500'
            }`}
          >
            {product.status}
          </span>
          <span className="text-xs text-gray-400">{createdAt}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
        <p className="text-2xl font-bold text-orange-500 mb-6">
          {formatPrice(product.price)}
        </p>

        {/* 상품 사진들 */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {product.images.map((url: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`상품 사진 ${i + 1}`}
                className="w-full aspect-square object-cover rounded-xl border border-gray-100"
              />
            ))}
          </div>
        )}

        {product.description ? (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        ) : (
          <p className="text-gray-400">상품 설명이 없어요.</p>
        )}

        {/* 좋아요 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-50">
          <LikeButton
            productId={product.id}
            initialLiked={likedByMe}
            initialCount={likeCount ?? 0}
            isLoggedIn={!!user}
          />
        </div>
      </div>

      {/* 본인 글일 때만 수정/삭제 버튼 표시 */}
      {isOwner && (
        <div className="flex gap-3 mt-5">
          <Link
            href={`/products/${product.id}/edit`}
            className="flex-1 py-3 text-center border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
          >
            수정
          </Link>
          <DeleteButton id={product.id} />
        </div>
      )}

      {/* 댓글 영역 */}
      <CommentSection
        productId={product.id}
        comments={(comments as Comment[]) ?? []}
        currentUserId={user?.id ?? null}
      />
    </div>
  )
}
