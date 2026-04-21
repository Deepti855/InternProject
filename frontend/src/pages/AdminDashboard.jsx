import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, userAPI, postAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FiUsers, FiFileText, FiActivity, FiShield, FiTrash2, FiUserX, FiCheck } from 'react-icons/fi';
import { Navigate } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ data: null })),
        userAPI.getAll().catch(() => ({ data: [] })),
        adminAPI.getAllPosts().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data || {
        totalUsers: usersRes.data?.length || 0,
        totalPosts: postsRes.data?.length || 0,
      });
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await userAPI.toggleBan(userId);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_banned: !u.is_banned } : u
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await userAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await adminAPI.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-500 font-medium">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
             <FiShield className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">Manage users, posts, and view site statistics</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: FiActivity },
          { id: 'users', label: 'Users', icon: FiUsers },
          { id: 'posts', label: 'Posts', icon: FiFileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => !u.is_banned).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-3 border-none shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
            </div>
            <div className="p-6">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No posts yet</p>
              ) : (
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          by <span className="font-medium">{post.username || 'User'}</span> • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>
          <div className="p-0">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-6 font-medium text-gray-500">User</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-500">Email</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-500">Role</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-6 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold shrink-0">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-500">{u.email}</td>
                        <td className="py-4 px-6">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">Admin</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">User</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {u.is_banned ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">Banned</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">Active</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end space-x-2">
                            {u.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleToggleBan(u.id)}
                                  className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                    u.is_banned
                                      ? 'text-green-600 hover:bg-green-50 focus:ring-green-500'
                                      : 'text-orange-500 hover:bg-orange-50 focus:ring-orange-400'
                                  }`}
                                  title={u.is_banned ? 'Unban user' : 'Ban user'}
                                >
                                  {u.is_banned ? <FiCheck className="w-4 h-4" /> : <FiUserX className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                  title="Delete user"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Post Moderation</h3>
          </div>
          <div className="p-6">
            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No posts found</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                          <span className="font-semibold text-gray-900 leading-tight">{post.title}</span>
                          <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                          <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                            by <span className="font-medium text-gray-700">{post.username || 'User'}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">{post.content}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <FiTrash2 className="w-5 h-5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminDashboard;
