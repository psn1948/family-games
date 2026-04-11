import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { newId } from '../utils/id'
import MemberForm from '../components/MemberForm'

export default function MembersPage() {
  const { members, addMember, updateMember, deleteMember } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)

  function handleAdd(data) {
    addMember({ id: newId(), ...data })
    setShowAdd(false)
  }

  function handleUpdate(id, data) {
    updateMember(id, data)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Familiemedlemmer</h1>
        {!showAdd && (
          <button className="btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Tilføj spiller
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Ny spiller</h2>
          <MemberForm
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {members.length === 0 && !showAdd ? (
        <div className="card p-8 text-center text-gray-400">
          <p className="text-lg mb-2">Ingen familiemedlemmer endnu.</p>
          <p className="text-sm">Tilføj dit første familiemedlem for at komme i gang.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map(member => (
            <div key={member.id} className="card p-4">
              {editingId === member.id ? (
                <MemberForm
                  initial={member}
                  onSave={data => handleUpdate(member.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 shadow"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="font-semibold text-gray-800 flex-1">{member.name}</span>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setEditingId(member.id)}
                  >
                    Rediger
                  </button>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(`Fjern ${member.name}?`)) deleteMember(member.id)
                    }}
                  >
                    Slet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
