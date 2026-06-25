import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0]
  const joinedAt = new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">내 프로필</h1>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
            🍠
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{nickname}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-50">
            <span className="text-gray-500">닉네임</span>
            <span className="font-medium text-gray-800">{nickname}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-50">
            <span className="text-gray-500">이메일</span>
            <span className="font-medium text-gray-800">{user.email}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-500">가입일</span>
            <span className="font-medium text-gray-800">{joinedAt}</span>
          </div>
        </div>
      </div>

      {/* 내 거래 통계 (추후 구현 예정) */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '판매 중', value: '0' },
          { label: '거래 완료', value: '0' },
          { label: '관심 목록', value: '0' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 로그아웃 버튼 */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}
