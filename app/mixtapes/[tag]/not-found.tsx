import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-xl font-semibold">Mixtape Tag Not Found</h2>
      <p className="mb-4 text-gray-600">The mixtape tag you're looking for doesn't exist.</p>
      <Link
        href="/mixtapes"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Back to Mixtapes
      </Link>
    </div>
  )
}
