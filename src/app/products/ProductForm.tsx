'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ProductFormProps = {
  mode: 'create' | 'edit'
  // 수정 모드일 때 기존 값
  defaultValues?: {
    title: string
    description: string
    price: number
    status: string
  }
  // 실제 저장을 수행하는 함수 (성공 시 { id } 반환)
  action: (formData: FormData) => Promise<{ error?: string; id?: string; success?: boolean }>
}

const STATUS_OPTIONS = ['판매중', '예약중', '판매완료']

export default function ProductForm({ mode, defaultValues, action }: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // 저장한 글 상세 페이지로 이동
    if (result?.id) {
      router.push(`/products/${result.id}`)
    } else {
      router.push('/products')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues?.title}
          placeholder="예) 거의 새것 같은 자전거 팝니다"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          가격 (원)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          required
          defaultValue={defaultValues?.price ?? 0}
          placeholder="0"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          상품 설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={defaultValues?.description}
          placeholder="상품 상태, 거래 방법 등을 자세히 적어주세요."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400 resize-none"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          상태
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultValues?.status ?? '판매중'}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          href="/products"
          className="flex-1 py-3 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? '저장 중...' : mode === 'create' ? '등록하기' : '수정하기'}
        </button>
      </div>
    </form>
  )
}
