import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

function Navbar({
  onNavigateToHost,
  onNavigateToAdmin,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToMyBookings,
  onNavigateToMyProfile,
  onNavigateToSettings,
  onNavigateToHowItWorks,
  onNavigateToContact,
  onNavigateToHome
}) {
  const { user } = useAuth()

  const [navVisible, setNavVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const hideTimer = useRef(null)


  // ================= NAVBAR AUTO HIDE / SHOW =================
  useEffect(() => {
    const resetHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }

      // If we are at the top, navbar should always stay visible
      if (window.scrollY <= 20) {
        setNavVisible(true)
        return
      }

      // When down the page, show navbar first
      setNavVisible(true)

      // Then hide after 3 seconds if not being used
      hideTimer.current = setTimeout(() => {
        if (!mobileMenuOpen && window.scrollY > 20) {
          setNavVisible(false)
        }
      }, 3000)
    }


    const handleScroll = () => {
      // Always visible at the top
      if (window.scrollY <= 20) {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current)
        }

        setNavVisible(true)
        return
      }

      resetHideTimer()
    }


    const handleMouseMove = () => {
      if (window.scrollY > 20) {
        resetHideTimer()
      }
    }


    const handleTouch = () => {
      if (window.scrollY > 20) {
        resetHideTimer()
      }
    }


    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouch)

    // Initial state
    handleScroll()


    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouch)

      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [mobileMenuOpen])


  // ================= NAVIGATION =================
  const handleBrowse = () => {
    setMobileMenuOpen(false)

    if (onNavigateToHome) {
      onNavigateToHome()
    }

    setTimeout(() => {
      document.getElementById('rooms')?.scrollIntoView({
        behavior: 'smooth'
      })
    }, 150)
  }


  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-500 ${
          navVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
        }`}
      >

        <nav
          className="
            max-w-7xl
            mx-auto
            rounded-2xl
            bg-white/75
            backdrop-blur-xl
            border
            border-white/50
            shadow-xl
            shadow-black/10
          "
        >

          <div className="h-16 px-4 sm:px-5 flex items-center justify-between">


            {/* ================= LOGO ================= */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)

                if (onNavigateToHome) {
                  onNavigateToHome()
                }
              }}
              className="flex items-center gap-2 cursor-pointer"
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-gradient-to-br
                  from-violet-500
                  to-indigo-600
                  flex
                  items-center
                  justify-center
                  shadow-sm
                "
              >

                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 11.5L12 4l9 7.5M5 10v10h5v-6h4v6h5V10"
                  />
                </svg>

              </div>


              <span className="text-xl font-bold text-indigo-500">
                Roomie
              </span>

            </button>



            {/* ================= DESKTOP NAVIGATION ================= */}
            <div className="hidden md:flex items-center gap-7">


              {/* Browse */}
              <button
                type="button"
                onClick={handleBrowse}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Browse
              </button>


              {/* How it Works */}
              <button
                type="button"
                onClick={onNavigateToHowItWorks}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                How it Works
              </button>


              {/* Contact */}
              <button
                type="button"
                onClick={onNavigateToContact}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Contact
              </button>



              {/* ================= NOT LOGGED IN ================= */}
              {!user && (
                <>

                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Sign In
                  </button>


                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="
                      px-5
                      py-2.5
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      rounded-lg
                      text-sm
                      font-semibold
                      shadow-sm
                      transition-all
                      duration-200
                    "
                  >
                    Sign Up
                  </button>

                </>
              )}



              {/* ================= LOGGED IN ================= */}
              {user && (
                <>

                  <button
                    type="button"
                    onClick={onNavigateToMyBookings}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    My Bookings
                  </button>


                  <button
                    type="button"
                    onClick={onNavigateToMyProfile}
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-indigo-100
                      text-indigo-600
                      flex
                      items-center
                      justify-center
                      font-bold
                      hover:bg-indigo-200
                      transition-colors
                    "
                  >
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : 'U'}
                  </button>

                </>
              )}

            </div>



            {/* ================= MOBILE MENU BUTTON ================= */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                setNavVisible(true)
              }}
              className="
                md:hidden
                w-10
                h-10
                rounded-lg
                flex
                items-center
                justify-center
                text-gray-700
                hover:bg-white/60
                transition
              "
            >

              {mobileMenuOpen ? (

                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>

              ) : (

                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>

              )}

            </button>

          </div>



          {/* ================= MOBILE MENU ================= */}
          {mobileMenuOpen && (

            <div
              className="
                md:hidden
                px-4
                pb-4
                border-t
                border-white/50
              "
            >

              <div className="flex flex-col pt-3 gap-1">


                {/* Browse */}
                <button
                  type="button"
                  onClick={handleBrowse}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                >
                  Browse
                </button>


                {/* How it Works */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onNavigateToHowItWorks?.()
                  }}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                >
                  How it Works
                </button>


                {/* Contact */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onNavigateToContact?.()
                  }}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                >
                  Contact
                </button>



                {/* ================= NOT LOGGED IN ================= */}
                {!user ? (
                  <>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigateToLogin?.()
                      }}
                      className="text-left px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white/60"
                    >
                      Sign In
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigateToRegister?.()
                      }}
                      className="mt-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                    >
                      Sign Up
                    </button>

                  </>
                ) : (

                  <>

                    {/* My Bookings */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigateToMyBookings?.()
                      }}
                      className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                    >
                      My Bookings
                    </button>


                    {/* My Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigateToMyProfile?.()
                      }}
                      className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                    >
                      My Profile
                    </button>


                    {/* Settings */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onNavigateToSettings?.()
                      }}
                      className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                    >
                      Settings
                    </button>


                    {/* Host Dashboard */}
                    {user.role === 'host' && (

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onNavigateToHost?.()
                        }}
                        className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                      >
                        Host Dashboard
                      </button>

                    )}


                    {/* Admin Dashboard */}
                    {user.role === 'admin' && (

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          onNavigateToAdmin?.()
                        }}
                        className="text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                      >
                        Admin Dashboard
                      </button>

                    )}

                  </>

                )}

              </div>

            </div>

          )}

        </nav>

      </header>
    </>
  )
}

export default Navbar