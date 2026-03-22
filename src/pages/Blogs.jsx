import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Plus, Edit, Trash2, Search, Eye, FileText } from 'lucide-react';
import BlogModal from '../components/BlogModal';

const Blogs = () => {
  const { blogs, deleteBlog } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.paragraph?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlog(id);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  // Collect all unique tags with counts
  const tagCounts = {};
  blogs.forEach(b => {
    (b.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Blog Post
        </button>
      </div>

      {/* Total Count */}
      <div className="card bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-purple-700 font-medium">Total Blog Posts</p>
            <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
          </div>
        </div>
      </div>

      {/* Tags Overview */}
      {sortedTags.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold"
              >
                {tag}
                <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="card hover:shadow-md transition-shadow">
              {/* Blog Image */}
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Blog Info */}
              <div className="space-y-3">
                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{blog.title}</h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 line-clamp-3">{blog.paragraph}</p>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{blog.author?.name || 'Unknown'}</span>
                  <span>-</span>
                  <span>{blog.publishDate || '2025'}</span>
                  {blog.views > 0 && (
                    <>
                      <span>-</span>
                      <span>{blog.views} views</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="flex-1 btn-danger flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            {searchQuery ? (
              'No blog posts found matching your search'
            ) : (
              <div>
                <p className="mb-4">No blog posts yet. Create your first post!</p>
                <button onClick={handleAdd} className="btn-primary">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Blog Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Modal */}
      {isModalOpen && (
        <BlogModal
          blog={editingBlog}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Blogs;
