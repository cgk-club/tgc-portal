import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function AuthPage({ params }: PageProps) {
  const { token } = await params
  redirect(`/api/client/verify/${token}`)
}
