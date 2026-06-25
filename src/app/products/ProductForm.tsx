'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MAX_IMAGES = 5

type ProductFormProps = {
  mode: 'create' | 'edit'
  // 수정 모드일 때 기존 값
  defaultValues?: {
    title: string
    description: string
    price: number
    status: string
    images: string[]
  }
  // 실제 저장을 수행하는 함수 (성공 시 { id } 반환)
  action: (formData: FormData) => Promise<{ error?: string; id?: string; success?: boolean }>
}

const STATUS_OPTIONS = ['판매중', '예약중', '판매완료']

type NewImage = { file: File; preview: string }

export default function ProductForm({ mode, defaultValues, action }: ProductFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 그대로 둘 기존 사진들 (수정 모드)
  const [keepImages, setKeepImages] = useState<string[]>(defaultValues?.images ?? [])
  // 새로 추가한 사진들
  const [newImages, setNewImages] = useState<NewImage[]>([])

  const totalCount = keepImages.length + newImages.length

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const room = MAX_IMAGES - totalCount
    if (room <= 0) {
      e.target.value = ''
      return
    }
    const picked = files.slice(0, room).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...picked])
    // 같은 파일을 다시 고를 수 있도록 입력값 초기화
    e.target.value = ''
  }

  function removeExisting(url: string) {
    setKeepImages((prev) => prev.filter((u) => u !== url))
  }

  function removeNew(preview: string) {
    setNewImages((prev) => {
      const target = prev.find((img) => img.preview === preview)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.preview !== preview)
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 글 내용은 폼에서 가져오고, 사진은 직접 관리한 목록으로 채워 넣음
    const formData = new FormData(e.currentTarget)
    formData.delete('images')
    newImages.forEach((img) => formData.append('images', img.file))
    formData.delete('keepImages')
    keepImages.forEach((url) => formData.append('keepImages', url))

    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

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

      {/* 사진 영역 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사진 <span className="text-gray-400">({totalCount}/{MAX_IMAGES})</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {/* 기존 사진 (수정 모드) */}
          {keepImages.map((url) => (
            <div key={url} className="relative w-24 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="상품 사진" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}

          {/* 새로 추가한 사진 */}
          {newImages.map((img) => (
            <div key={img.preview} className="relative w-24 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="새 상품 사진" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => removeNew(img.preview)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}

          {/* 사진 추가 버튼 (최대 장수 미만일 때만) */}
          {totalCount < MAX_IMAGES && (
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors">
              <span className="text-2xl">＋</span>
              <span className="text-xs">사진 추가</span>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

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
