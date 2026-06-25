'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addComment, deleteComment } from './actions'

export type Comment = {
  id: string
  author_nickname: string
  content: string
  created_at: string
  user_id: string
}

type CommentSectionProps = {
  productId: string
  comments: Comment[]
  currentUserId: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CommentSection({
  productId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.set('content', content)
    const result = await addComment(productId, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setContent('')
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(commentId: string) {
    const ok = window.confirm('이 댓글을 삭제할까요?')
    if (!ok) return

    const result = await deleteComment(commentId, productId)
    if (result?.error) {
      alert('삭제에 실패했어요: ' + result.error)
      return
    }
    router.refresh()
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        댓글 <span className="text-orange-500">{comments.length}</span>
      </h2>

      {/* 댓글 작성 폼 */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          {error && (
            <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="댓글을 남겨보세요."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition text-gray-800 placeholder-gray-400 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {loading ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
          <Link href="/auth/login" className="text-orange-500 hover:underline font-medium">
            로그인
          </Link>{' '}
          후 댓글을 남길 수 있어요.
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">
                    {c.author_nickname}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                </div>
                {currentUserId === c.user_id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
