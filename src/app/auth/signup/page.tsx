import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center mb-8">Create an Account</h1>
      <SignUpForm />
    </div>
  )
}
