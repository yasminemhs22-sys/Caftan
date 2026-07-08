'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Settings, ContactInfo, SeoGlobal } from '@/types'

const inputClass =
  'w-full border border-noir/20 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-noir/30 focus:border-dore focus:outline-none'
const labelClass = 'mb-1.5 block text-xs uppercase tracking-widest2 text-noir/50'

const TABS = [
  { key: 'identity', label: 'Identité' },
  { key: 'contact', label: 'Contact' },
  { key: 'social', label: 'Réseaux sociaux' },
  { key: 'colors', label: 'Couleurs' },
  { key: 'seo', label: 'SEO' },
  { key: 'analytics', label: 'Analytics' },
] as const
type TabKey = (typeof TABS)[number]['key']

const DAY_KEYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const DAY_LABELS: Record<string, string> = {
  lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi', jeudi: 'Jeudi',
  vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche',
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="bg-noir px-7 py-3 text-xs uppercase tracking-widest2 text-dore transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
    </button>
  )
}

interface Props {
  settings: Settings | null
  contactInfo: ContactInfo | null
  seo: SeoGlobal | null
}

export function SettingsTabs({ settings, contactInfo, seo }: Props) {
  const [tab, setTab] = useState<TabKey>('identity')

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2 border-b border-noir/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-xs uppercase tracking-widest2 ${
              tab === t.key ? 'border-b-2 border-dore text-noir' : 'text-noir/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'identity' && <IdentityTab settings={settings} />}
      {tab === 'contact' && <ContactTab contactInfo={contactInfo} />}
      {tab === 'social' && <SocialTab settings={settings} />}
      {tab === 'colors' && <ColorsTab settings={settings} />}
      {tab === 'seo' && <SeoTab seo={seo} />}
      {tab === 'analytics' && <AnalyticsTab settings={settings} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Identité
// ---------------------------------------------------------------------------
function IdentityTab({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const [siteName, setSiteName] = useState(settings?.site_name || 'La Casa Del Caftan')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [currentLogo, setCurrentLogo] = useState(settings?.logo_url || '/images/logo.jpg')
  const [currentFavicon, setCurrentFavicon] = useState(settings?.favicon_url || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()

    try {
      const updates: Record<string, any> = { site_name: siteName }

      if (logoFile) {
        const path = `logo-${Date.now()}-${logoFile.name}`
        const { error: upErr } = await supabase.storage.from('site-assets').upload(path, logoFile)
        if (upErr) throw new Error(upErr.message)
        updates.logo_url = supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl
      }
      if (faviconFile) {
        const path = `favicon-${Date.now()}-${faviconFile.name}`
        const { error: upErr } = await supabase.storage.from('site-assets').upload(path, faviconFile)
        if (upErr) throw new Error(upErr.message)
        updates.favicon_url = supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl
      }

      const { error: updateError } = await supabase.from('settings').update(updates).eq('id', 1)
      if (updateError) throw new Error(updateError.message)

      if (updates.logo_url) setCurrentLogo(updates.logo_url)
      if (updates.favicon_url) setCurrentFavicon(updates.favicon_url)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label className={labelClass}>Nom du site</label>
        <input className={inputClass} value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>Logo</label>
        <div className="mb-3 flex items-center gap-4">
          <div className="relative h-14 w-40 bg-noir">
            <Image src={currentLogo} alt="Logo actuel" fill className="object-contain" />
          </div>
        </div>
        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" />
      </div>

      <div>
        <label className={labelClass}>Favicon (icône d'onglet du navigateur)</label>
        {currentFavicon && (
          <div className="relative mb-3 h-8 w-8 bg-noir">
            <Image src={currentFavicon} alt="Favicon actuel" fill className="object-contain" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" />
        <p className="mt-1.5 text-xs text-noir/40">Idéalement une image carrée (ex. 512×512 px).</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
function ContactTab({ contactInfo }: { contactInfo: ContactInfo | null }) {
  const router = useRouter()
  const [form, setForm] = useState({
    phone: contactInfo?.phone || '',
    whatsapp_number: contactInfo?.whatsapp_number || '',
    email: contactInfo?.email || '',
    address_fr: contactInfo?.address?.fr || '',
    address_en: contactInfo?.address?.en || '',
    address_ar: contactInfo?.address?.ar || '',
    google_maps_query: contactInfo?.google_maps_query || '',
  })
  const [hours, setHours] = useState<Record<string, string>>(contactInfo?.opening_hours || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('contact_info')
        .update({
          phone: form.phone,
          whatsapp_number: form.whatsapp_number,
          email: form.email,
          address: { fr: form.address_fr, en: form.address_en, ar: form.address_ar },
          google_maps_query: form.google_maps_query,
          opening_hours: hours,
        })
        .eq('id', 1)
      if (updateError) throw new Error(updateError.message)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Téléphone</label>
          <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Numéro WhatsApp (avec indicatif, sans +)</label>
          <input placeholder="213540984852" className={inputClass} value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>E-mail</label>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest2 text-dore">Adresse</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.address_fr} onChange={(e) => update('address_fr', e.target.value)} />
          <input placeholder="English" className={inputClass} value={form.address_en} onChange={(e) => update('address_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.address_ar} onChange={(e) => update('address_ar', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Adresse pour Google Maps (texte de recherche)</label>
        <input className={inputClass} value={form.google_maps_query} onChange={(e) => update('google_maps_query', e.target.value)} />
      </div>

      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest2 text-dore">Horaires d'ouverture</h2>
        <div className="space-y-2">
          {DAY_KEYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-noir/60">{DAY_LABELS[day]}</span>
              <input
                placeholder="9h - 19h (ou laisser vide si fermé)"
                className={inputClass}
                value={hours[day] || ''}
                onChange={(e) => setHours((prev) => ({ ...prev, [day]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// Réseaux sociaux
// ---------------------------------------------------------------------------
function SocialTab({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const [form, setForm] = useState({
    instagram: settings?.social_links?.instagram || '',
    facebook: settings?.social_links?.facebook || '',
    tiktok: settings?.social_links?.tiktok || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()
    try {
      const { error: updateError } = await supabase.from('settings').update({ social_links: form }).eq('id', 1)
      if (updateError) throw new Error(updateError.message)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <p className="mb-2 text-xs text-noir/40">
        Laisse un champ vide pour masquer l'icône correspondante dans le pied de page.
      </p>
      <div>
        <label className={labelClass}>Instagram (lien complet)</label>
        <input placeholder="https://instagram.com/..." className={inputClass} value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
      </div>
      <div>
        <label className={labelClass}>Facebook (lien complet)</label>
        <input placeholder="https://facebook.com/..." className={inputClass} value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
      </div>
      <div>
        <label className={labelClass}>TikTok (lien complet)</label>
        <input placeholder="https://tiktok.com/@..." className={inputClass} value={form.tiktok} onChange={(e) => setForm((f) => ({ ...f, tiktok: e.target.value }))} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// Couleurs
// ---------------------------------------------------------------------------
function ColorsTab({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const [primary, setPrimary] = useState(settings?.primary_color || '#0A0A0A')
  const [secondary, setSecondary] = useState(settings?.secondary_color || '#FAF9F6')
  const [accent, setAccent] = useState(settings?.accent_color || '#D4AF37')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()
    try {
      const { error: updateError } = await supabase
        .from('settings')
        .update({ primary_color: primary, secondary_color: secondary, accent_color: accent })
        .eq('id', 1)
      if (updateError) throw new Error(updateError.message)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const swatches: { label: string; value: string; set: (v: string) => void }[] = [
    { label: 'Couleur principale (noir)', value: primary, set: setPrimary },
    { label: 'Couleur de fond (blanc cassé)', value: secondary, set: setSecondary },
    { label: "Couleur d'accent (doré)", value: accent, set: setAccent },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <p className="text-xs text-noir/40">
        Les nuances claires/foncées utilisées un peu partout sur le site (survols, badges...) sont calculées
        automatiquement à partir de ces 3 couleurs — pas besoin de les régler une par une.
      </p>
      {swatches.map((s) => (
        <div key={s.label}>
          <label className={labelClass}>{s.label}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={s.value}
              onChange={(e) => s.set(e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer border border-noir/20 bg-transparent p-1"
            />
            <input
              type="text"
              value={s.value}
              onChange={(e) => s.set(e.target.value)}
              className={inputClass}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------
function SeoTab({ seo }: { seo: SeoGlobal | null }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title_fr: seo?.meta_title?.fr || '',
    title_en: seo?.meta_title?.en || '',
    title_ar: seo?.meta_title?.ar || '',
    desc_fr: seo?.meta_description?.fr || '',
    desc_en: seo?.meta_description?.en || '',
    desc_ar: seo?.meta_description?.ar || '',
  })
  const [ogFile, setOgFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()
    try {
      let og_image = seo?.og_image
      if (ogFile) {
        const path = `og-image-${Date.now()}-${ogFile.name}`
        const { error: upErr } = await supabase.storage.from('site-assets').upload(path, ogFile)
        if (upErr) throw new Error(upErr.message)
        og_image = supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl
      }

      const { error: upsertError } = await supabase.from('seo').upsert(
        {
          page_slug: 'global',
          meta_title: { fr: form.title_fr, en: form.title_en, ar: form.title_ar },
          meta_description: { fr: form.desc_fr, en: form.desc_en, ar: form.desc_ar },
          og_image,
        },
        { onConflict: 'page_slug' }
      )
      if (upsertError) throw new Error(upsertError.message)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <p className="text-xs text-noir/40">
        Ces réglages s'appliquent par défaut à tout le site (page d'accueil, partage sur les réseaux...).
        Chaque page (produit, collection...) peut avoir ses propres metadata qui prennent le dessus.
      </p>
      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest2 text-dore">Titre du site</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input placeholder="Français" className={inputClass} value={form.title_fr} onChange={(e) => update('title_fr', e.target.value)} />
          <input placeholder="English" className={inputClass} value={form.title_en} onChange={(e) => update('title_en', e.target.value)} />
          <input placeholder="العربية" dir="rtl" className={inputClass} value={form.title_ar} onChange={(e) => update('title_ar', e.target.value)} />
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xs uppercase tracking-widest2 text-dore">Description</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <textarea placeholder="Français" rows={3} className={inputClass} value={form.desc_fr} onChange={(e) => update('desc_fr', e.target.value)} />
          <textarea placeholder="English" rows={3} className={inputClass} value={form.desc_en} onChange={(e) => update('desc_en', e.target.value)} />
          <textarea placeholder="العربية" dir="rtl" rows={3} className={inputClass} value={form.desc_ar} onChange={(e) => update('desc_ar', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Image de partage (Open Graph — visible quand un lien du site est partagé)</label>
        {seo?.og_image && (
          <div className="relative mb-3 h-24 w-40 bg-noir">
            <Image src={seo.og_image} alt="Image de partage actuelle" fill className="object-cover" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => setOgFile(e.target.files?.[0] || null)} className="block w-full text-sm text-noir/70" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
function AnalyticsTab({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const [gaId, setGaId] = useState(settings?.ga_measurement_id || '')
  const [pixelId, setPixelId] = useState(settings?.meta_pixel_id || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()
    try {
      const { error: updateError } = await supabase
        .from('settings')
        .update({ ga_measurement_id: gaId || null, meta_pixel_id: pixelId || null })
        .eq('id', 1)
      if (updateError) throw new Error(updateError.message)
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <p className="text-xs text-noir/40">
        Laisse un champ vide pour ne rien charger — aucun traceur n'est actif tant que ces identifiants ne
        sont pas renseignés.
      </p>
      <div>
        <label className={labelClass}>Google Analytics 4 — Measurement ID</label>
        <input placeholder="G-XXXXXXXXXX" className={inputClass} value={gaId} onChange={(e) => setGaId(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Meta Pixel — ID</label>
        <input placeholder="123456789012345" className={inputClass} value={pixelId} onChange={(e) => setPixelId(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SaveButton saving={saving} saved={saved} />
    </form>
  )
}
