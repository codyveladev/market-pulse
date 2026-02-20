import { useState } from 'react'
import type { CompanyProfile } from '../../../shared/types'

interface CompanyInfoProps {
  profile: CompanyProfile | null
}

export function CompanyInfo({ profile }: CompanyInfoProps) {
  const [logoFailed, setLogoFailed] = useState(false)

  if (!profile) {
    return (
      <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
        <span className="text-sm font-medium text-gray-400">Company Info</span>
        <p className="text-gray-500 text-sm mt-2">Company information unavailable.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5">
      <span className="text-sm font-medium text-gray-400">Company Info</span>
      <div className="flex items-center gap-3 mt-3">
        {profile.logo && !logoFailed && (
          <img
            src={profile.logo}
            alt={`${profile.name} logo`}
            className="w-10 h-10 rounded"
            onError={() => setLogoFailed(true)}
          />
        )}
        <span className="text-gray-100 font-medium">{profile.name}</span>
      </div>
      <div className="flex flex-col gap-1.5 mt-3 text-sm">
        {profile.industry && (
          <span className="px-2 py-0.5 rounded bg-brand/10 text-brand w-fit">{profile.industry}</span>
        )}
        {profile.country && (
          <span className="text-gray-400">{profile.country}</span>
        )}
        {profile.weburl && (
          <a
            href={profile.weburl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline truncate"
          >
            {profile.weburl.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
    </div>
  )
}
