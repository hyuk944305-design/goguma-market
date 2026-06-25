'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    // 실수로 누르는 걸 막기 위한 확인 창
    const ok = window.confirm('정말 이 판매글을 삭제할까요? 되돌릴 수 없어요.')
    if (!ok) return

    setLoading(true)
    const formData = new FormData()
    formData.set('id', id)
    const result = await deleteProduct(formData)

    if (result?.error) {
      alert('삭제에 실패했어요: ' + result.error)
      setLoading(false)
      return
    }

    router.push('/products')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-3 border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-xl transition-colors font-medium"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}
