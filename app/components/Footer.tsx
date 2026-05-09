export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border-t border-gray-300 dark:border-white/10 py-3 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between text-xs text-gray-600 dark:text-gray-500">
        <span>© {new Date().getFullYear()} — Personal build</span>
        <span>Bold Editorial Studio</span>
      </div>
    </footer>
  );
}
