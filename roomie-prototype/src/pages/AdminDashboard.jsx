import { useEffect, useMemo, useState } from 'react'
import { getAllBookings } from '../data/bookings'
import { getAllReviews } from '../data/reviews'

function StatCard({ title, value, description, icon, iconStyle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </h3>
          <p className="text-xs text-gray-500 mt-2">
            {description}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyle}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalRenters: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0
  })

  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    let allUsers = []

    try {
      const usersJson = localStorage.getItem('registeredUsers')
      allUsers = usersJson ? JSON.parse(usersJson) : []
    } catch {
      allUsers = []
    }

    const allBookings = getAllBookings() || []
    const allReviews = getAllReviews() || []

    const hosts = allUsers.filter(user => user.role === 'host')
    const renters = allUsers.filter(user => user.role === 'renter')

    const pending = allBookings.filter(
      booking => booking.status === 'pending'
    )

    const approved = allBookings.filter(
      booking =>
        booking.status === 'approved' ||
        booking.status === 'completed'
    )

    const totalRevenue = approved.reduce(
      (total, booking) =>
        total + (Number(booking.totalPrice) || 0),
      0
    )

    const averageRating =
      allReviews.length > 0
        ? (
            allReviews.reduce(
              (total, review) =>
                total + (Number(review.rating) || 0),
              0
            ) / allReviews.length
          ).toFixed(1)
        : 0

    setStats({
      totalUsers: allUsers.length,
      totalHosts: hosts.length,
      totalRenters: renters.length,
      totalBookings: allBookings.length,
      pendingBookings: pending.length,
      approvedBookings: approved.length,
      totalRevenue,
      totalReviews: allReviews.length,
      averageRating
    })

    setUsers(allUsers)
    setBookings(allBookings)
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(Number(amount) || 0)
  }

  const formatDate = date => {
    if (!date) return 'N/A'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A'
    }

    return parsedDate.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'

      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'

      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200'

      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'

      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRoleBadgeColor = role => {
    switch (role) {
      case 'admin':
        return 'bg-violet-50 text-violet-700 border-violet-200'

      case 'host':
        return 'bg-blue-50 text-blue-700 border-blue-200'

      case 'renter':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'

      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.toLowerCase()

    return users.filter(user => {
      return (
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword)
      )
    })
  }, [users, searchTerm])

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.toLowerCase()

    return bookings.filter(booking => {
      const matchesSearch =
        booking.roomName?.toLowerCase().includes(keyword) ||
        booking.renterName?.toLowerCase().includes(keyword) ||
        String(booking.id).toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === 'all' ||
        booking.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [bookings, searchTerm, statusFilter])

  const exportBookings = () => {
    if (bookings.length === 0) return

    const headers = [
      'Booking ID',
      'Room',
      'Guest',
      'Check-in',
      'Check-out',
      'Status',
      'Total'
    ]

    const rows = bookings.map(booking => [
      booking.id,
      booking.roomName,
      booking.renterName,
      formatDate(booking.checkIn),
      formatDate(booking.checkOut),
      booking.status,
      booking.totalPrice
    ])

    const csv = [headers, ...rows]
      .map(row =>
        row
          .map(value => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = 'booking-report.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  const currentDate = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>

                  <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    Administrator
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Manage users, bookings, reviews and platform activity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right mr-2">
                <p className="text-xs text-gray-400">
                  Today
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {currentDate}
                </p>
              </div>

              <button
                onClick={loadDashboardData}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8 8 0 004.582 9M4 9h5m11 11v-5h-.581m0 0a8 8 0 01-15.357-2M20 15h-5"
                  />
                </svg>

                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description={`${stats.totalHosts} hosts · ${stats.totalRenters} renters`}
            iconStyle="bg-violet-50 text-violet-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H3v-2a4 4 0 014-4h2a4 4 0 014 4v2zm-5-8a4 4 0 100-8 4 4 0 000 8zm9-2a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            }
          />

          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            description={`${stats.pendingBookings} pending · ${stats.approvedBookings} approved`}
            iconStyle="bg-blue-50 text-blue-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            }
          />

          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            description="Revenue from confirmed bookings"
            iconStyle="bg-emerald-50 text-emerald-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 6v12m3-9.5C14.2 7.6 13.2 7 12 7c-1.7 0-3 1-3 2.2 0 1.4 1.3 2 3 2.3s3 .9 3 2.3C15 15 13.7 16 12 16c-1.2 0-2.3-.5-3-1.5"
                />
              </svg>
            }
          />

          <StatCard
            title="Guest Reviews"
            value={stats.totalReviews}
            description={`Average rating: ${stats.averageRating} / 5`}
            iconStyle="bg-amber-50 text-amber-600"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3z"
                />
              </svg>
            }
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 p-1.5">
          <div className="flex flex-col sm:flex-row gap-1">

            {[
              ['overview', 'Overview'],
              ['users', `Users (${stats.totalUsers})`],
              ['bookings', `Bookings (${stats.totalBookings})`]
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setSearchTerm('')
                }}
                className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm">

              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Platform Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Current activity across the booking platform.
                </p>
              </div>

              <div className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">

                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <p className="text-sm font-medium text-gray-500">
                        Pending
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingBookings}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Awaiting booking approval
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <p className="text-sm font-medium text-gray-500">
                        Registered
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalUsers}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Users on the platform
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <p className="text-sm font-medium text-gray-500">
                        Reviews
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalReviews}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Guest feedback received
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Management Summary
                  </h3>

                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl">

                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">
                        Host accounts
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {stats.totalHosts}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">
                        Renter accounts
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {stats.totalRenters}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">
                        Confirmed bookings
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {stats.approvedBookings}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">
                        Average guest rating
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {stats.averageRating} / 5
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Quick Actions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Common administration tasks.
                </p>
              </div>

              <div className="p-5 space-y-3">

                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Manage Users
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      View registered accounts
                    </p>
                  </div>

                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      View Bookings
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Review booking records
                    </p>
                  </div>

                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={exportBookings}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Export Report
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Download booking data as CSV
                    </p>
                  </div>

                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                    />
                  </svg>
                </button>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  User Management
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  View all registered users and account roles.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>

                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>

                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>

                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredUsers.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/70 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm text-white font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.name || 'Unknown User'}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {user.id || 'N/A'}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email || 'N/A'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No users found
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Try using a different search term.
                </p>
              </div>
            )}

          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

            <div className="px-6 py-5 border-b border-gray-100">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Booking Management
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Monitor reservations and booking status.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">

                  <div className="relative">
                    <svg
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={event =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Search bookings..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={event =>
                      setStatusFilter(event.target.value)
                    }
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                  >
                    <option value="all">
                      All Status
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="approved">
                      Approved
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="declined">
                      Declined
                    </option>
                  </select>

                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">

              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-gray-50/60 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3 mb-5">

                        <h3 className="text-lg font-bold text-gray-900">
                          {booking.roomName || 'Room Booking'}
                        </h3>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status || 'unknown'}
                        </span>

                      </div>

                      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Guest
                          </p>

                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {booking.renterName || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Check-in
                          </p>

                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {formatDate(booking.checkIn)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Check-out
                          </p>

                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Booking Total
                          </p>

                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-xs text-gray-400">
                        Booking ID
                      </p>

                      <p className="text-sm font-mono font-medium text-gray-600 mt-1">
                        #{booking.id}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>

            {filteredBookings.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">

                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>

                </div>

                <p className="text-sm font-semibold text-gray-700">
                  No bookings found
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  No booking records match your current filters.
                </p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}

export default AdminDashboard