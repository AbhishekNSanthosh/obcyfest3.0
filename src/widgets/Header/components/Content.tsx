"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { auth, db } from "@lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import IconClose from "../../../common/icons/IconClose";
import { eventName } from "@utils/constants";

export default function HeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<null | {
    displayName: string | null;
    photoURL: string | null;
  }>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { title: "About", link: "/#about" },
    { title: "Events", link: "/events" },
    { title: "FAQs", link: "/#faqs" },
    { title: "Community Partners", link: "#community" },
    { title: "Contact", link: "/#contact" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle body overflow
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  // Handle auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : {};
          const incomplete =
            !data.rollNumber ||
            !data.semester ||
            !data.phone ||
            String(data.phone).trim().length < 10;
          if (incomplete && location !== "/profile") {
            router.push("/profile");
          }
        } catch (e) {
          console.error("Profile check failed", e);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [location, router]);

  // Handle clicks outside drawer
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileMenuOpen]);

const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // Check Firestore for extra details
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // Assume "extraDetailsCompleted" flag in user document
      if (userData.rollNumber && userData.semester && userData.phone) {
        console.log("User already completed details ✅");
        // Stay on current page (no redirect)
        return;
      }
    }

    // Redirect if details not filled
    router.push("/profile");
  } catch (error) {
    console.error("Google sign-in failed", error);
  }
};

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`px-[5vw] min-h-[10vh] md:min-h-[13vh] flex w-full fixed top-0 z-20 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg bg-black/50" : "bg-transparent"
      }`}
    >
      <div className="flex flex-1 items-center justify-start">
        <Link href="/" aria-label="Home">
          <Image
            src="/logo/obcyLogo.svg"
            height={48}
            width={48}
            alt="Obcydians Logo"
            className="cursor-pointer lg:w-12 lg:h-12 md:h-12 h-8 md:w-12 w-8"
            priority
          />
        </Link>
      </div>

      <nav className="hidden md:flex flex-2 items-center justify-center gap-[4vw]">
        <div className="flex flex-row gap-[2vw] rounded-[50px] p-2 px-4">
          {navItems.map((item, index) => (
            <Link
              href={item.link}
              key={index}
              className="py-1 relative cursor-pointer text-yellow-400 font-medium hover:text-yellow-300 transition-colors after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full"
              aria-current={location === item.link ? "page" : undefined}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      <div className="hidden md:flex flex-1 items-center justify-end gap-4">
        {user ? (
          <Link
            href="/profile"
            className="flex items-center text-yellow-400 font-medium text-xl gap-2 hover:text-yellow-300 transition-colors"
            aria-label={`Profile of ${user.displayName || "User"}`}
          >
            <Link
              href="/profile"
              className="flex items-center text-yellow-400 font-medium text-lg"
              onClick={handleLinkClick}
            >
              Hello👋,
              {user?.displayName ? (
                user.displayName.length > 12 ? (
                  /* marquee container: uses CSS classes above */
                  <span className="ml-2 marquee-container">
                    <span className="marquee">{user.displayName}</span>
                  </span>
                ) : (
                  <span className="ml-2">{user.displayName}</span>
                )
              ) : (
                <span className="ml-2">User</span>
              )}
            </Link>

            <div className="border-[2px] rounded-full p-1 border-yellow-400">
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
                priority
              />
            </div>
          </Link>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="bg-yellow-400 rounded-lg px-4 py-2 text-black-950 font-semibold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
            aria-label="Sign in with Google"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6.1 8-11.3 8a12 12 0 010-24c3 0 5.6 1.1 7.7 2.9l5.7-5.7C34.4 6.6 29.5 4 24 4a20 20 0 100 40c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.6 19 13 24 13c3 0 5.6 1.1 7.7 2.9l5.7-5.7C34.4 6.6 29.5 4 24 4c-7.3 0-13.7 3.9-17.2 9.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-2.2 14-5.8l-6.4-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C10.3 40.2 16.7 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.1-2.3 4-4.3 5.2l.1.1 6.4 5.5c-.4.4.1-.1.9-1 2.5-2.6 5.1-6.8 5.1-13.3 0-1.3-.1-2.6-.4-3.5z"
              />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>

      <div className="md:hidden flex flex-1 items-center justify-end">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-3xl text-yellow-400"
          aria-label="Open mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <HiMenuAlt2 />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={drawerRef}
          className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-black-950 shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            top: `${isScrolled ? 0 : 0}px`, // Adjust based on header height if needed
            height: "100vh", // Ensure full viewport height
          }}
        >
          <div className="relative h-full">
            {/* Header offset to prevent overlap with fixed header */}
            <div className="h-[10vh] md:h-[13vh]"></div>{" "}
            {/* Match header height */}
            <div className="absolute top-0 left-0 w-full">
              <div className="absolute top-6 left-6">
                {user && (
                  <Link
                    href="/profile"
                    className="flex items-center text-yellow-400 font-medium text-lg"
                    onClick={handleLinkClick}
                  >
                    Hello👋,
                    {user?.displayName ? (
                      user.displayName.length > 12 ? (
                        /* marquee container: uses CSS classes above */
                        <span className="ml-2 marquee-container">
                          <span className="marquee">{user.displayName}</span>
                        </span>
                      ) : (
                        <span className="ml-2">{user.displayName}</span>
                      )
                    ) : (
                      <span className="ml-2">User</span>
                    )}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-6 p-2 rounded-full hover:bg-yellow-400/20 transition"
                aria-label="Close mobile menu"
              >
                <IconClose className="w-8 h-8 text-yellow-400" />
              </button>
            </div>
            <nav className="flex flex-col items-center gap-8 mt-1k0 px-4">
              {navItems.map((item, index) => (
                <Link
                  href={item.link}
                  key={index}
                  onClick={handleLinkClick}
                  className="text-2xl font-semibold text-yellow-400 hover:text-yellow-300 transition-colors w-full text-center py-2"
                  aria-current={location === item.link ? "page" : undefined}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="mt-5 px-4">
              {user ? (
                <Link href="/profile" onClick={handleLinkClick}>
                  <button
                    className="w-full flex items-center justify-center py-3 rounded-xl bg-yellow-400 text-black-950 font-bold text-lg shadow-lg hover:bg-yellow-500 transition"
                    aria-label="View Profile"
                  >
                    <span>Profile</span>
                    <div className="border-[2px] rounded-full p-1 border-black ml-2">
                      <Image
                        src={user.photoURL || "/default-avatar.png"}
                        alt="Profile"
                        className="w-11 h-11 rounded-full"
                        width={44}
                        height={44}
                        priority
                      />
                    </div>
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleGoogleLogin();
                    handleLinkClick();
                  }}
                  className="w-full py-3 rounded-xl bg-yellow-400 text-black-950 font-bold text-lg shadow-lg hover:bg-yellow-500 transition"
                  aria-label="Sign in with Google"
                >
                  Sign in with Google
                </button>
              )}
            </div>
            <footer className="absolute bottom-5 w-full px-4 text-gray-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div>Made with 💛 by Obcydians.</div>
                <div>
                  © {new Date().getFullYear()} {eventName}. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </header>
  );
}
