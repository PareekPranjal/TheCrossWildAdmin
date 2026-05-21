import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  FileText,
  LogOut,
  X,
  Search,
  MapPin,
  PenLine,
  Settings as SettingsIcon,
  MessageSquare,
  Award,
  Tag,
  Menu as MenuIcon,
  ScrollText,
  Image as ImageIcon,
  ShoppingCart,
  Layers,
  Home as HomeIcon,
  Sparkles,
  HelpCircle,
  Inbox,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { icon: Package, label: 'Products', path: '/products' },
      { icon: Layers, label: 'Product Types', path: '/product-types' },
      { icon: FolderOpen, label: 'Categories', path: '/categories' },
    ],
  },
  {
    label: 'Pages',
    items: [
      { icon: HomeIcon, label: 'Home Content', path: '/home-content' },
      { icon: Sparkles, label: 'Services Page', path: '/services-page' },
      { icon: HelpCircle, label: 'Why Choose Us', path: '/why-choose-us-page' },
      { icon: ScrollText, label: 'Policy Pages', path: '/policy-pages' },
      { icon: PenLine, label: 'Page Content', path: '/page-content' },
      { icon: MapPin, label: 'Locations', path: '/locations' },
    ],
  },
  {
    label: 'Site',
    items: [
      { icon: SettingsIcon, label: 'Site Settings', path: '/site-settings' },
      { icon: MenuIcon, label: 'Menus', path: '/menus' },
      { icon: MessageSquare, label: 'Testimonials', path: '/testimonials' },
      { icon: Award, label: 'Brands', path: '/brands' },
      { icon: Tag, label: 'Deals', path: '/deals' },
      { icon: ImageIcon, label: 'Gallery', path: '/gallery' },
      { icon: Search, label: 'SEO', path: '/seo' },
    ],
  },
  {
    label: 'Activity',
    items: [
      { icon: ShoppingCart, label: 'Orders', path: '/orders' },
      { icon: Inbox, label: 'Submissions', path: '/submissions' },
      { icon: FileText, label: 'Blogs', path: '/blogs' },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, logout } = useAdmin();
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white border-r border-gray-200 lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TC</span>
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-800">The CrossWild</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-4">
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? 'bg-primary text-white font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
