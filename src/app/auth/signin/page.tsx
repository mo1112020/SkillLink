import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      <SignInForm />
    </div>
  )
}
