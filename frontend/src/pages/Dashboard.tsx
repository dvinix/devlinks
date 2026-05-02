import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, BarChart3, LogOut } from 'lucide-react';
import { useLinks } from '../hooks/useLinks';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { CopyButton } from '../components/ui/CopyButton';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import type { LinkResponse } from '../types';
import './Dashboard.css';

interface CreateLinkForm {
  original_url: string;
  custom_slug: string;
  expires_at: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getLinks, createLink, deleteLink, isLoading } = useLinks();
  const { getCurrentUser, logout } = useAuth();
  const { user } = useAuthStore();
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateLinkForm>({
    original_url: '',
    custom_slug: '',
    expires_at: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const userData = await getCurrentUser();
        if (!userData) {
          navigate('/login');
          return;
        }
      }
      loadLinks();
    };
    init();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await getLinks();
      setLinks(data);
    } catch {
      // Error handled by hook
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!form.original_url) errors.original_url = 'URL is required';
    if (!form.original_url.startsWith('http')) {
      errors.original_url = 'URL must start with http:// or https://';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const newLink = await createLink({
        original_url: form.original_url,
        custom_slug: form.custom_slug || undefined,
        expires_at: form.expires_at || undefined,
      });

      setLinks([newLink, ...links]);
      setForm({ original_url: '', custom_slug: '', expires_at: '' });
      setFormErrors({});
      setIsCreateOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteLink = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await deleteLink(slug);
      setLinks(links.filter((link) => link.slug !== slug));
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h1>DevLinks</h1>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-email">{user?.email}</p>
              <Badge variant="success">{user?.plan || 'Free'} Plan</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} icon={<LogOut size={16} />}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2>My Links</h2>
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus size={18} />}>
            Create Link
          </Button>
        </div>

        {links.length === 0 ? (
          <div className="dashboard-empty">
            <p>No links yet</p>
            <p className="empty-subtitle">Create your first short link to get started</p>
            <Button onClick={() => setIsCreateOpen(true)}>Create Your First Link</Button>
          </div>
        ) : (
          <div className="links-grid">
            {links.map((link) => (
              <Card key={link.id} className="link-card">
                <div className="link-header">
                  <p className="link-original" title={link.original_url}>
                    🔗 {link.original_url}
                  </p>
                </div>

                <div className="link-slug">
                  <code>{link.short_url}</code>
                  <CopyButton text={link.short_url} label="📋" />
                </div>

                <div className="link-meta">
                  <span className="meta-item">Created {formatDate(link.created_at)}</span>
                  {link.expires_at && (
                    <span className="meta-item">Expires {formatDate(link.expires_at)}</span>
                  )}
                </div>

                <div className="link-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<BarChart3 size={16} />}
                    onClick={() => navigate(`/analytics/${link.slug}`)}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteLink(link.slug)}
                    className="danger"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setFormErrors({});
        }}
        title="Create Short Link"
        footer={
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLink} isLoading={isLoading}>
              Create Link
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateLink} className="create-form">
          <div className="form-group">
            <label>Original URL</label>
            <input
              type="text"
              placeholder="https://example.com/very/long/url"
              value={form.original_url}
              onChange={(e) => setForm({ ...form, original_url: e.target.value })}
              className={formErrors.original_url ? 'error' : ''}
            />
            {formErrors.original_url && (
              <span className="error-message">{formErrors.original_url}</span>
            )}
          </div>

          <div className="form-group">
            <label>Custom Slug (optional)</label>
            <input
              type="text"
              placeholder="my-custom-slug"
              value={form.custom_slug}
              onChange={(e) => setForm({ ...form, custom_slug: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Expiration Date (optional)</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
