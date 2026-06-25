import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// 가격을 1,000원 형태로 보기 좋게 표시
function formatPrice(price: number) {
  return price === 0 ? '나눔' : `${price.toLocaleString('ko-KR')}원`
}

const STATUS_STYLE: Record<string, string> = {
  판매중: 'bg-orange-100 text-orange-600',
  예약중: 'bg-blue-100 text-blue-600',
  판매완료: 'bg-gray-200 text-gray-500',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">판매 중인 상품</h1>
        {user && (
          <Link
            href="/products/new"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            + 판매글 쓰기
          </Link>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 mb-1">아직 등록된 상품이 없어요.</p>
          {user ? (
            <p className="text-sm text-gray-400">첫 판매글을 올려보세요!</p>
          ) : (
            <p className="text-sm text-gray-400">
              <Link href="/auth/login" className="text-orange-500 hover:underline">
                로그인
              </Link>{' '}
              후 판매글을 올릴 수 있어요.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-800 truncate">{p.title}</h2>
                  <p className="text-orange-500 font-bold mt-1">{formatPrice(p.price)}</p>
                </div>
                <span className="text-gray-300 text-xl ml-4">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
