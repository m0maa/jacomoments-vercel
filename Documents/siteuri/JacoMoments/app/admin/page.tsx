'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon,
  MessageSquare,
  Upload,
  Trash2,
  Edit,
  X,
  Check,
  LogOut,
  Plus,
  Tag as TagIcon,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'

interface Photo {
  id: string
  filename: string
  url: string
  thumbnail?: string
  title?: string
  description?: string
  category: string
  tags: { id: string; name: string }[]
  order: number
  featured: boolean
}

interface Message {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'photos' | 'messages'>('photos')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoTitle, setNewPhotoTitle] = useState('')
  const [newPhotoDescription, setNewPhotoDescription] = useState('')
  const [newPhotoCategory, setNewPhotoCategory] = useState('nunta')
  const [newPhotoFeatured, setNewPhotoFeatured] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos()
      fetchMessages()
    }
  }, [isAuthenticated])

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password }),
      })

      const data = await res.json()

      if (data.success) {
        setIsAuthenticated(true)
        setLoginError('')
      } else {
        setLoginError('Invalid password')
      }
    } catch (error) {
      setLoginError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Add photo by URL handler
  const handleAddPhotoByUrl = async () => {
    if (!newPhotoUrl.trim()) return

    setLoading(true)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPhotoUrl.trim(),
          title: newPhotoTitle.trim() || undefined,
          description: newPhotoDescription.trim() || undefined,
          category: newPhotoCategory,
          featured: newPhotoFeatured,
        }),
      })

      const data = await res.json()

      if (data.success) {
        await fetchPhotos()
        // Reset form
        setNewPhotoUrl('')
        setNewPhotoTitle('')
        setNewPhotoDescription('')
        setNewPhotoCategory('nunta')
        setNewPhotoFeatured(false)
      } else {
        alert('Failed to add photo: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding photo:', error)
      alert('Failed to add photo')
    } finally {
      setLoading(false)
    }
  }

  // Update photo
  const handleUpdatePhoto = async (photo: Photo) => {
    setLoading(true)

    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: photo.title,
          description: photo.description,
          category: photo.category,
          tags: photo.tags.map((t) => t.name),
          featured: photo.featured,
          order: photo.order,
        }),
      })

      if (res.ok) {
        await fetchPhotos()
        setEditingPhoto(null)
      }
    } catch (error) {
      console.error('Error updating photo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Delete photo
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    setLoading(true)

    try {
      await fetch(`/api/photos/${id}`, { method: 'DELETE' })
      await fetchPhotos()
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Bulk delete photos
  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return
    if (!confirm(`Delete ${selectedPhotos.size} photos?`)) return

    setLoading(true)

    try {
      await Promise.all(
        Array.from(selectedPhotos).map((id) =>
          fetch(`/api/photos/${id}`, { method: 'DELETE' })
        )
      )
      setSelectedPhotos(new Set())
      await fetchPhotos()
    } catch (error) {
      console.error('Error bulk deleting photos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark message as read/unread
  const handleToggleMessageRead = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !read }),
      })
      await fetchMessages()
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return

    setLoading(true)

    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      await fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setLoading(false)
    }
  }

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    // Validate new password length
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setPasswordSuccess('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess('')
        }, 2000)
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (error) {
      setPasswordError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-lg p-8 max-w-md w-full shadow-xl"
        >
          <h1 className="text-2xl font-bold text-center mb-6 text-primary">
            Admin Login
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-steel rounded focus:outline-none focus:border-accent bg-white text-primary"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm mb-4">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-primary text-secondary">
      {/* Header */}
      <header className="bg-secondary text-primary py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jaco Moments Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded hover:bg-accent hover:text-white transition-colors"
            >
              <KeyRound size={18} />
              Change Password
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-secondary border-b border-steel">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-4 font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'photos'
                ? 'text-accent border-b-2 border-accent'
                : 'text-primary hover:text-accent'
            }`}
          >
            <ImageIcon size={18} />
            Photos
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-4 font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'messages'
                ? 'text-accent border-b-2 border-accent'
                : 'text-primary hover:text-accent'
            }`}
          >
            <MessageSquare size={18} />
            Messages
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            {/* Upload Section */}
            <div className="bg-secondary rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-primary mb-4">Add Photo by URL</h2>
              <p className="text-sm text-primary mb-4">
                Upload your photos to an image hosting service (Imgur, Cloudinary, etc.) and paste the URL below.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-primary">Image URL *</label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://i.imgur.com/abc123.jpg"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-primary">Title</label>
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="Photo title (optional)"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-primary">Category</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  >
                    <option value="nunta">Nuntă</option>
                    <option value="botez">Botez</option>
                    <option value="majorat">Majorat</option>
                    <option value="sedinta">Sedintă Foto</option>
                    <option value="eveniment">Eveniment</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-primary">Description</label>
                  <textarea
                    value={newPhotoDescription}
                    onChange={(e) => setNewPhotoDescription(e.target.value)}
                    placeholder="Photo description (optional)"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-primary">
                  <input
                    type="checkbox"
                    checked={newPhotoFeatured}
                    onChange={(e) => setNewPhotoFeatured(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">Featured photo</span>
                </label>
              </div>
              <button
                onClick={handleAddPhotoByUrl}
                disabled={loading || !newPhotoUrl.trim()}
                className="bg-accent text-white px-6 py-2 rounded hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} />
                Add Photo
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedPhotos.size > 0 && (
              <div className="bg-red-500 text-white rounded-lg p-4 mb-6 flex justify-between items-center">
                <span>{selectedPhotos.size} photos selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Trash2 size={18} />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Photos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative group bg-secondary rounded-lg overflow-hidden ${
                    selectedPhotos.has(photo.id) ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title || photo.filename}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="bg-white text-primary px-3 py-1 rounded text-sm font-bold hover:bg-accent hover:text-white"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPhotos((prev) => {
                          const next = new Set(prev)
                          if (next.has(photo.id)) next.delete(photo.id)
                          else next.add(photo.id)
                          return next
                        })
                      }
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        selectedPhotos.has(photo.id)
                          ? 'bg-accent text-white'
                          : 'bg-white text-primary'
                      }`}
                    >
                      {selectedPhotos.has(photo.id) ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                  {photo.featured && (
                    <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-secondary rounded-lg">
            {messages.length === 0 ? (
              <p className="text-center py-12 text-primary/60">No messages yet</p>
            ) : (
              <div className="divide-y divide-steel">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-6 ${!msg.read ? 'bg-accent/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-primary">{msg.name}</h3>
                        <p className="text-sm text-primary/70">{msg.email}</p>
                        {msg.phone && (
                          <p className="text-sm text-primary/70">{msg.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMessageRead(msg.id, msg.read)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title={msg.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {msg.read ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-2 hover:bg-red-100 text-red-500 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {msg.subject && (
                      <p className="font-bold text-primary mb-2">{msg.subject}</p>
                    )}
                    <p className="text-primary">{msg.message}</p>
                    <p className="text-sm text-primary/70 mt-2">
                      {new Date(msg.createdAt).toLocaleString('ro-RO')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Photo Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Edit Photo</h2>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <img
                  src={editingPhoto.url}
                  alt={editingPhoto.title || editingPhoto.filename}
                  className="w-full max-h-64 object-contain bg-black rounded"
                />

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Title</label>
                  <input
                    type="text"
                    value={editingPhoto.title || ''}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded bg-white text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Description</label>
                  <textarea
                    value={editingPhoto.description || ''}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded bg-white text-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Category</label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded bg-white text-primary"
                  >
                    <option value="nunta">Nuntă</option>
                    <option value="botez">Botez</option>
                    <option value="sedinta">Sedintă Foto</option>
                    <option value="eveniment">Eveniment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingPhoto.tags.map((t) => t.name).join(', ')}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        tags: e.target.value
                          .split(',')
                          .filter((t) => t.trim())
                          .map((name) => ({ id: name, name })),
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-white text-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingPhoto.featured}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, featured: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="font-bold text-primary">
                    Featured photo
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdatePhoto(editingPhoto)}
                    disabled={loading}
                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Change Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError('')
                    setPasswordSuccess('')
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 text-primary">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-accent bg-white text-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordError('')
                      setPasswordSuccess('')
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
