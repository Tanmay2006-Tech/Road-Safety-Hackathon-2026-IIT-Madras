import { MessageCircle, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function TrustedContactsPanel({ contacts, onAddContact, onDeleteContact, summaryText }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const sanitized = useMemo(() => phone.replace(/[^0-9+]/g, ''), [phone])

  function addContact() {
    if (!name.trim() || !sanitized.trim()) return
    onAddContact({ name: name.trim(), phone: sanitized.trim() })
    setName('')
    setPhone('')
  }

  function buildWhatsAppLink(number) {
    return `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(summaryText)}`
  }

  function buildSmsLink(number) {
    return `sms:${number}?body=${encodeURIComponent(summaryText)}`
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
        <Users size={14} /> Trusted Contacts
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-300"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone (+91...)"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-300"
        />
      </div>

      <button onClick={addContact} className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200">
        <Plus size={13} /> Add contact
      </button>

      <div className="mt-3 space-y-2">
        {!contacts.length && <p className="text-sm text-slate-500">No trusted contacts added yet.</p>}
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{contact.name}</p>
                <p className="text-xs text-slate-400">{contact.phone}</p>
              </div>
              <button onClick={() => onDeleteContact(contact.id)} className="text-slate-400 hover:text-rose-300">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <a href={buildWhatsAppLink(contact.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/60 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
                <MessageCircle size={12} /> WhatsApp
              </a>
              <a href={buildSmsLink(contact.phone)} className="inline-flex items-center gap-1 rounded-lg border border-sky-300/60 bg-sky-400/10 px-2 py-1 text-xs text-sky-200">
                <MessageCircle size={12} /> SMS
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
