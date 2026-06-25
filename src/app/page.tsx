import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 히어로 섹션 */}
      <section className="text-center mb-16">
        <div className="text-6xl mb-4">🍠</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          따뜻한 동네 중고거래
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
          우리 동네 이웃과 함께 물건을 사고 팔아요.<br />
          고구마처럼 달콤한 거래를 경험해보세요!
        </p>

        {!user ? (
          <div className="flex gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              지금 시작하기
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-white border border-orange-200 hover:border-orange-400 text-orange-500 font-semibold rounded-xl transition-colors"
            >
              로그인
            </Link>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-medium">
            <span>👋</span>
            <span>
              {user.user_metadata?.nickname || user.email?.split('@')[0]}님, 환영해요!
            </span>
          </div>
        )}
      </section>

      {/* 기능 소개 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: '🏷️',
            title: '중고 판매',
            desc: '필요 없는 물건을 이웃에게 판매하고 새 주인을 찾아주세요.',
            href: '/products',
          },
          {
            icon: '🔍',
            title: '동네 검색',
            desc: '우리 동네 근처의 매물을 쉽고 빠르게 찾아보세요.',
          },
          {
            icon: '💬',
            title: '채팅 거래',
            desc: '판매자와 직접 채팅으로 안전하게 거래해요.',
          },
        ].map((item) => {
          const cardContent = (
            <>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </>
          )

          // href가 있는 카드는 클릭하면 해당 페이지로 이동
          return item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all"
            >
              {cardContent}
            </Link>
          ) : (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {cardContent}
            </div>
          )
        })}
      </section>

      {/* 개발 중 안내 배너 */}
      <section className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
        <p className="text-orange-600 font-medium">🚧 현재 개발 중인 서비스예요</p>
        <p className="text-sm text-gray-500 mt-1">
          회원가입과 로그인 기능이 완성됐어요. 다음 단계로 상품 등록 기능을 만들어 나갈 예정이에요!
        </p>
      </section>
    </div>
  )
}
