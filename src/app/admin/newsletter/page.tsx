import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function AdminNewsletterPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  const subscribers = data || []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-noir">Newsletter</h1>
        <p className="text-sm text-noir/50">{subscribers.length} abonné(e)s</p>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-sm text-noir/50">Aucun abonné pour le moment.</p>
      ) : (
        <div className="overflow-x-auto border border-noir/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-noir/10 text-start text-xs uppercase tracking-widest2 text-noir/40">
                <th className="p-4 text-start">E-mail</th>
                <th className="p-4 text-start">Inscrit(e) le</th>
                <th className="p-4 text-start">Statut</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-noir/5 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5 text-noir">
                      <Mail size={14} strokeWidth={1.5} className="text-dore" />
                      {sub.email}
                    </div>
                  </td>
                  <td className="p-4 text-noir/60">{formatDate(sub.subscribed_at, 'fr')}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs uppercase tracking-widest2 ${
                        sub.is_active ? 'bg-dore/10 text-dore-dark' : 'bg-noir/5 text-noir/40'
                      }`}
                    >
                      {sub.is_active ? 'Actif' : 'Désinscrit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-noir/40">
        Export CSV et envoi de campagnes non inclus dans cette livraison — utilise « Exporter » depuis le Table
        Editor de Supabase en attendant, ou dis-moi si tu veux que je construise cet export.
      </p>
    </div>
  )
}
