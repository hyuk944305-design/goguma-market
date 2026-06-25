import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🍠</span>
          <span className="text-xl font-bold text-orange-500 group-hover:text-orange-600 transition-colors">
            고구마마켓
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
          >
            판매글
          </Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.user_metadata?.nickname || user.email?.split('@')[0]}님 👋
              </span>
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                내 프로필
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors font-medium"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
