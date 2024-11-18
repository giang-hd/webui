import React, { useState, useEffect,useCallback } from 'react';
import { Library, Users, Camera, Menu, LogOut } from 'lucide-react';
import authService from '../services/authService';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    authors: [],
    books: [],
    images: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (section) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      switch (section) {
        case 'home':
          const [authorsRes, booksRes, imagesRes] = await Promise.all([
            authService.axiosInstance.get('/author', {
              headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            }),
            authService.axiosInstance.get('/book', {
              headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            }),
            authService.axiosInstance.get('/image', {
              headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            })
          ]);
          setStats({
            authors: authorsRes.data,
            books: booksRes.data,
            images: imagesRes.data
          });
          break;
        case 'authors':
          data = await authService.axiosInstance.get('/author', {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
          });
          setStats(prev => ({ ...prev, authors: data.data }));
          break;
        case 'books':
          data = await authService.axiosInstance.get('/book', {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
          });
          setStats(prev => ({ ...prev, books: data.data }));
          break;
        case 'images':
          data = await authService.axiosInstance.get('/image', {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
          });
          setStats(prev => ({ ...prev, images: data.data }));
          break;
        default:
          // Handle unexpected section values
          console.error(`Unexpected section: ${section}`);
          break;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleLogout = () => {
    authService.logout();
  };

  const navigations = [
    { name: 'Dashboard', icon: Menu, route: 'home' },
    { name: 'Authors', icon: Users, route: 'authors' },
    { name: 'Books', icon: Library, route: 'books' },
    { name: 'Images', icon: Camera, route: 'images' }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>Dashboard</h1>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="mt-4 flex-1">
          {navigations.map((item) => (
            <button
              key={item.route}
              onClick={() => setActiveTab(item.route)}
              className={`
                flex items-center w-full p-4 hover:bg-gray-100
                ${activeTab === item.route ? 'bg-blue-50 text-blue-600' : ''}
              `}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="ml-4">{item.name}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center p-4 text-red-600 hover:bg-red-50 border-t w-full"
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-4">Logout</span>}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'home' && <HomePanel stats={stats} />}
              {activeTab === 'authors' && <AuthorsPanel authors={stats.authors} />}
              {activeTab === 'books' && <BooksPanel books={stats.books} />}
              {activeTab === 'images' && <ImagesPanel images={stats.images} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const HomePanel = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Authors</h3>
        <p className="text-3xl font-bold">{stats.authors.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Books</h3>
        <p className="text-3xl font-bold">{stats.books.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Images</h3>
        <p className="text-3xl font-bold">{stats.images.length}</p>
      </div>
    </div>
  );
};

const AuthorsPanel = ({ authors }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Authors Management</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Author
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Books</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {authors.map((author) => (
              <tr key={author.id}>
                <td className="px-6 py-4 whitespace-nowrap">{author._id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{author.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{author.books?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BooksPanel = ({ books }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Books Management</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Book
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NAME BOOK</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">{book._id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{book.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{book.author?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ImagesPanel = ({ images }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Images Management</h3>
      {/* Render images here */}
    </div>
  );
};

export default Dashboard;
