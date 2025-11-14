export default function IntroFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 text-center md:text-left">
          &copy; {new Date().getFullYear()} KaKaON. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <a href="#" className="hover:underline">이용약관</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:underline">개인정보처리방침</a>
        </div>
      </div>
    </footer>
  );
}
