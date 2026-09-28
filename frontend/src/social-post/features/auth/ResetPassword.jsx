import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import AuthShell from './AuthShell.jsx'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!token) return setError('This reset link is invalid or incomplete.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setSubmitting(true)
    try {
      const result = await resetPassword(token, password)
      setSuccess(result.message)
      setTimeout(() => navigate('/social-post/login'), 1500)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return <AuthShell><span className="rounded-full border border-stone-300 px-3 py-2 text-xs uppercase tracking-widest text-stone-500">New password</span><h1 className="mt-6 text-4xl font-bold tracking-tight">Secure your account.</h1><p className="mt-2 text-stone-500">Choose a strong password with uppercase, lowercase, and a number.</p><form className="mt-8 grid gap-4" onSubmit={handleSubmit}><label className="grid gap-2 text-sm font-semibold">New password<span className="relative"><input className="w-full rounded-xl border border-stone-200 p-3 pr-11 font-normal outline-none focus:border-stone-900" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label className="grid gap-2 text-sm font-semibold">Confirm password<span className="relative"><input className="w-full rounded-xl border border-stone-200 p-3 pr-11 font-normal outline-none focus:border-stone-900" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required /><button type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{success && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={submitting || Boolean(success)} className="rounded-xl bg-stone-900 py-3 font-semibold text-white disabled:opacity-60">{submitting ? 'Updating...' : 'Update password →'}</button></form><p className="mt-6 text-center text-sm"><Link className="font-semibold text-orange-600" to="/social-post/login">← Back to login</Link></p></AuthShell>
}
