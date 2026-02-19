import { useSystemStatus } from '../hooks/useSystemStatus'
import type { ServiceStatus } from '@shared/types'

const STATUS_CONFIG: Record<ServiceStatus['status'], { dotClass: string; labelClass: string }> = {
  ok: { dotClass: 'bg-positive', labelClass: 'text-positive' },
  down: { dotClass: 'bg-negative', labelClass: 'text-negative' },
  unconfigured: { dotClass: 'bg-yellow-500', labelClass: 'text-yellow-500' },
  unused: { dotClass: 'bg-gray-500', labelClass: 'text-gray-500' },
}

function SkeletonRow() {
  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5 animate-pulse flex items-center gap-4">
      <div className="h-3 w-3 rounded-full bg-surface-overlay" />
      <div className="h-4 w-32 bg-surface-overlay rounded" />
      <div className="ml-auto h-4 w-20 bg-surface-overlay rounded" />
    </div>
  )
}

function StatusCard({ service }: { service: ServiceStatus }) {
  const config = STATUS_CONFIG[service.status]

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/5 flex items-center gap-4">
      <span className={`h-3 w-3 rounded-full ${config.dotClass}`} />
      <span className="text-sm font-medium text-gray-100">{service.name}</span>
      <span className={`ml-auto text-sm ${config.labelClass}`}>{service.message}</span>
    </div>
  )
}

export function SystemStatus() {
  const { services, loading, error } = useSystemStatus()

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-100">Partner System Status</h2>

      {loading && services.length === 0 && (
        <div className="flex flex-col gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {error && (
        <div className="text-negative text-center py-8">
          Failed to load system status: {error}
        </div>
      )}

      {services.length > 0 && (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <StatusCard key={service.name} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
