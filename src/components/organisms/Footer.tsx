export function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-gray-400 text-sm mt-16">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 py-6 flex flex-col items-center gap-1">
        <p className="font-bold text-white">DAYO.GG</p>
        <p>이 사이트는 이터널 리턴의 공식 서비스가 아닙니다.</p>
        <p>이터널 리턴의 API를 활용해 제작되었으며,{' '}
        <a
          href="https://support.playeternalreturn.com/hc/ko/articles/49090866623257-API-%EC%9D%B4%EC%9A%A9-%EC%95%BD%EA%B4%80-2025-07-22"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white transition-colors"
        >
          API 이용약관
        </a>
        을 준수하고 있습니다.</p>
      </div>
    </footer>
  )
}
