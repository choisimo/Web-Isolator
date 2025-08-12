'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('확인 중...')
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    // API 상태 확인
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL}/health`)
        if (response.ok) {
          setApiStatus('✅ 연결됨')
          const data = await response.json()
          setApiData(data)
        } else {
          setApiStatus('❌ 연결 실패')
        }
      } catch (error) {
        setApiStatus('❌ API 서버 없음')
      }
    }

    checkApiStatus()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 {{PROJECT_NAME}}
          </h1>
          <p className="text-xl text-gray-600">
            Web Isolator로 생성된 Next.js 프로젝트
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 프로젝트 정보 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📋 프로젝트 정보
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li><strong>프로젝트:</strong> {{PROJECT_NAME}}</li>
              <li><strong>프레임워크:</strong> Next.js 14</li>
              <li><strong>언어:</strong> TypeScript</li>
              <li><strong>스타일링:</strong> Tailwind CSS</li>
              <li><strong>접속 주소:</strong> http://{{PROJECT_NAME}}.local</li>
            </ul>
          </div>

          {/* API 상태 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🔌 API 연결 상태
            </h2>
            <div className="space-y-3">
              <p><strong>상태:</strong> {apiStatus}</p>
              {apiData && (
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>서버 시간:</strong> {apiData.timestamp}</p>
                  <p><strong>버전:</strong> {apiData.version}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                API 주소: {process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL}
              </p>
            </div>
          </div>

          {/* 빠른 시작 가이드 */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🏃‍♂️ 빠른 시작 가이드
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">개발 명령어</h3>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  <div>npm run dev    # 개발 서버 시작</div>
                  <div>npm run build  # 프로덕션 빌드</div>
                  <div>npm run lint   # 코드 검사</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Web Isolator 명령어</h3>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  <div>isolator up     # 모든 서비스 시작</div>
                  <div>isolator stop   # 모든 서비스 중지</div>
                  <div>isolator status # 상태 확인</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 단계 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            💡 다음 단계
          </h2>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>src/app/page.tsx 파일을 편집하여 홈페이지 수정</li>
            <li>src/components/ 폴더에 재사용 가능한 컴포넌트 생성</li>
            <li>API와 연동하여 동적 데이터 표시</li>
            <li>Tailwind CSS를 사용하여 스타일링 커스터마이즈</li>
          </ul>
        </div>
      </div>
    </main>
  )
}