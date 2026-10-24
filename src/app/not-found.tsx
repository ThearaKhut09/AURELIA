import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-site flex-col items-center justify-center px-5 text-center">
      <p className="font-serif text-7xl text-sage">404</p>
      <h1 className="mt-4 font-serif text-3xl text-ink">This page has faded away</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-soft">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="btn-solid mt-8">
        Back to home
      </Link>
    </div>
  );
}
