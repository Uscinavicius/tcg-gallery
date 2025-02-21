import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-800 text-white fixed top-0 z-50">
      <Link
        href="/"
        className="text-2xl font-bold hover:text-gray-300 transition-colors"
      >
        Home
      </Link>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          Admin
        </Link>
        <Link
          href="/showcase"
          className="text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          Showcase
        </Link>
      </div>
    </nav>
  );
}
