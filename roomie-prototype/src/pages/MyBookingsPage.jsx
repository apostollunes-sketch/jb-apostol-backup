import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllBookings } from '../data/bookings'
import { getRoomById } from '../data/rooms'

function MyBookingsPage({ onBack, onViewRoom }) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')

  const loadBookings = () => {
    const allBookings = getAllBookings()

    const userBookings = allBookings.filter(
      booking => booking.renterEmail === user?.email
    )

    setBookings(userBookings)
  }

  useEffect(() => {
    loadBookings()

    const handleRefresh = () => {
      loadBookings()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadBookings()
      }
    }

    window.addEventListener('focus', handleRefresh)
    window.addEventListener('storage', handleRefresh)
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    return () => {
      window.removeEventListener('focus', handleRefresh)
      window.removeEventListener('storage', handleRefresh)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }, [user])

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0]

    switch (filter) {
      case 'upcoming':
        return bookings.filter(
          booking =>
            booking.checkIn >= today &&
            (
              booking.status === 'approved' ||
              booking.status === 'pending'
            )
        )

      case 'past':
        return bookings.filter(
          booking =>
            booking.checkOut < today ||
            booking.status === 'completed'
        )

      case 'pending':
        return bookings.filter(
          booking => booking.status === 'pending'
        )

      default:
        return bookings
    }
  }

  const filteredBookings = getFilteredBookings()

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'

      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'

      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200'

      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200'

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const today = new Date().toISOString().split('T')[0]

  const tabs = [
    {
      id: 'all',
      label: 'All Bookings',
      count: bookings.length
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      count: bookings.filter(
        booking =>
          booking.checkIn >= today &&
          (
            booking.status === 'approved' ||
            booking.status === 'pending'
          )
      ).length
    },
    {
      id: 'pending',
      label: 'Pending',
      count: bookings.filter(
        booking => booking.status === 'pending'
      ).length
    },
    {
      id: 'past',
      label: 'Past',
      count: bookings.filter(
        booking =>
          booking.checkOut < today ||
          booking.status === 'completed'
      ).length
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-7"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Back
          </button>

          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Reservations
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              My Bookings
            </h1>

            <p className="text-gray-500 mt-2">
              View and manage your room reservations.
            </p>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* Filter Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm mb-8 overflow-x-auto">

          <div className="flex min-w-max sm:min-w-0 gap-1">

            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}

                <span
                  className={`min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full text-xs ${
                    filter === tab.id
                      ? 'bg-white/15 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}

          </div>
        </div>

        {/* No Bookings */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm py-16 px-6 text-center">

            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">

              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>

            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>

            <p className="text-sm text-gray-500 max-w-md mx-auto mb-7">
              {filter === 'all'
                ? "You haven't made any bookings yet. Start exploring rooms!"
                : `No ${filter} bookings at this time.`}
            </p>

            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-semibold"
            >
              Browse Rooms

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
                  d="M5 12h14m-6-6l6 6-6 6"
                />
              </svg>
            </button>

          </div>
        ) : (

          /* Booking List */
          <div className="space-y-6">

            {filteredBookings.map(booking => {
              const room = getRoomById(booking.roomId)

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >

                  <div className="flex flex-col lg:flex-row">

                    {/* Room Image */}
                    <div className="lg:w-72 xl:w-80 h-56 lg:h-auto relative flex-shrink-0">

                      <img
                        src={
                          room?.images?.[0] ||
                          '/placeholder.jpg'
                        }
                        alt={booking.roomName}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden"></div>

                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-5 sm:p-6 lg:p-7">

                      {/* Top */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">

                        <div>

                          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                            {booking.roomName}
                          </h3>

                          <div className="flex items-center gap-2 mt-2">

                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                              />
                            </svg>

                            <p className="text-sm text-gray-500">
                              Booking ID: #{booking.id}
                            </p>

                          </div>
                        </div>

                        {/* Status */}
                        <span
                          className={`self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold capitalize ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              booking.status === 'approved'
                                ? 'bg-emerald-500'
                                : booking.status === 'pending'
                                ? 'bg-amber-500'
                                : booking.status === 'declined'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                            }`}
                          ></span>

                          {booking.status}
                        </span>

                      </div>

                      {/* Approved Message */}
                      {booking.status === 'approved' && (
                        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">

                          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">

                            <svg
                              className="w-5 h-5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>

                          </div>

                          <div>
                            <p className="text-sm font-bold text-emerald-900">
                              Booking Approved
                            </p>

                            <p className="text-sm text-emerald-700 mt-0.5">
                              Your reservation has been approved by the host.
                            </p>
                          </div>

                        </div>
                      )}

                      {/* Booking Information */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                        {/* Check-in */}
                        <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/60">

                          <div className="flex items-center gap-2 text-gray-400 mb-1.5">

                            <svg
                              className="w-4 h-4"
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

                            <p className="text-xs uppercase tracking-wide font-medium">
                              Check-in
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(booking.checkIn)}
                          </p>

                        </div>

                        {/* Check-out */}
                        <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/60">

                          <div className="flex items-center gap-2 text-gray-400 mb-1.5">

                            <svg
                              className="w-4 h-4"
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

                            <p className="text-xs uppercase tracking-wide font-medium">
                              Check-out
                            </p>

                          </div>

                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(booking.checkOut)}
                          </p>

                        </div>

                        {/* Guests */}
                        <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/60">

                          <div className="flex items-center gap-2 text-gray-400 mb-1.5">

                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H3v-2a4 4 0 014-4h2m7-6a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>

                            <p className="text-xs uppercase tracking-wide font-medium">
                              Guests
                            </p>

                          </div>

                          <p className="text-sm font-semibold text-gray-900">
                            {booking.guests}
                          </p>

                        </div>

                        {/* Total */}
                        <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/60">

                          <div className="flex items-center gap-2 text-gray-400 mb-1.5">

                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2"
                              />
                            </svg>

                            <p className="text-xs uppercase tracking-wide font-medium">
                              Total
                            </p>

                          </div>

                          <p className="text-sm font-bold text-blue-600">
                            ${booking.totalPrice.toFixed(2)}
                          </p>

                        </div>

                      </div>

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 mb-6">

                          <div className="flex items-start gap-3">

                            <svg
                              className="w-4 h-4 text-gray-400 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.6 10.6 0 01-4-.75L3 20l1.4-3.5A7.18 7.18 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                                Special Requests
                              </p>

                              <p className="text-sm text-gray-700 italic">
                                "{booking.specialRequests}"
                              </p>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-1">

                        <button
                          onClick={() =>
                            onViewRoom(booking.roomId)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold"
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
                              strokeWidth={1.8}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>

                          View Room
                        </button>

                        {booking.status === 'approved' && (
                          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-semibold">

                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.6 10.6 0 01-4-.75L3 20l1.4-3.5A7.18 7.18 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>

                            Contact Host
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                </div>
              )
            })}

          </div>
        )}
      </main>
    </div>
  )
}

export default MyBookingsPage