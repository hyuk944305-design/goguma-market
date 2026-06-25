'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from './actions'

type LikeButtonProps = {
  productId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: LikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) {
      alert('좋아요는 로그인 후 누를 수 있어요.')
      router.push('/auth/login')
      return
    }
    if (loading) return

    // 먼저 화면을 바꿔서 빠르게 반응 (낙관적 업데이트)
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => c + (nextLiked ? 1 : -1))
    setLoading(true)

    const result = await toggleLike(productId)

    if (result?.error) {
      // 실패하면 원래대로 되돌림
      setLiked(!nextLiked)
      setCount((c) => c + (nextLiked ? -1 : 1))
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-colors ${
        liked
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
      }`}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span>좋아요 {count}</span>
    </button>
  )
}
