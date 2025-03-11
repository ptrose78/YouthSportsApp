'use client'

import Image from "next/image"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import { Navigation, Autoplay } from "swiper/modules"

const images = [
  "/assets/game01.JPG",
  "/assets/stats01.JPG",
  "/assets/comm01.JPG",
]

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // This effect runs when the user is signed in
  useEffect(() => {
    if (isSignedIn && user) {   
      router.push('/scoreboard');
    }
  }, [isSignedIn, user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-orange-500">
                HoopzTracker
              </Link>
            </div>
            <div>
              {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="mr-4">
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button>Sign Up</button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-orange-500 text-white">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Elevate Your Team&#39;s Performance with HoopzTracker
            </h1>
            <p className="text-xl mb-8">
              Track stats, analyze box scores, and streamline team communications - all in one powerful app.
            </p>
            {!user && (
              <SignUpButton mode="modal">
                <button className="bg-white text-orange-500 hover:bg-gray-100 rounded-md py-2 px-4">
                  Sign Up
                </button>
              </SignUpButton>
            )}
          </div>

          {/* Image Carousel */}
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            autoplay={{ delay: 4000 }}
            loop   
          >
            {images.map((src, index) => (
              <SwiperSlide key={index} className=" flex justify-center items-center">
                <Image 
                  src={src} 
                  alt={`Slide ${index + 1}`} 
                  width={800} 
                  height={600} 
                  className="rounded-lg w-full h-auto"
                />
              </SwiperSlide>
            ))}
          </Swiper>     
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              title="Comprehensive Stats Tracking"
              description="Record and analyze detailed player and team statistics for every game."
              icon="📊"
            />
            <FeatureCard
              title="Interactive Box Scores"
              description="View real-time box scores during games and access historical data with ease."
              icon="🏀"
            />
            <FeatureCard
              title="Team Communication Hub"
              description="Streamline team messaging, schedules, and announcements in one central location."
              icon="💬"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Coaches Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <TestimonialCard
              quote="HoopzTracker has helped us track players' minutes and stats. It keeps us organized."
              author="Coach Paul"
              team="Burlington Youth Basketball League"
            />
            <TestimonialCard
              quote="It's a great all-in-one tool to communicate with parents and track players' stats."
              author="Coach Mark"
              team="Oak Creek Parks and Rec Basketball League"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Take Your Team to the Next Level?</h2>
          {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <>
                  <SignUpButton mode="modal">
                  <button className="bg-white text-orange-500 hover:bg-gray-100 rounded-md py-2 px-4">
                      Sign Up
                  </button>
                  </SignUpButton>
                </>
              )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
                  <Link href="/" className="text-2xl font-bold ">
                    HoopzTracker
                  </Link>
          </div>
          <div className="mt-8 text-center text-sm">
            © {new Date().getFullYear()} HoopzTracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, team }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-gray-600 italic mb-4">&#34;{quote}&#34;</p>
      <div className="font-semibold">{author}</div>
      <div className="text-sm text-gray-500">{team}</div>
    </div>
  )
}

