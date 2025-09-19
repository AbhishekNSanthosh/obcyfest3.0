"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

  const navItems = [
    {
      title: "About",
      link: "/#about",
    },
    {
      title: "Events",
      link: "/events",
    },
    {
      title: "FAQs",
      link: "/#faqs",
    },
    {
      title: "Community Partners",
      link: "#community",
    },
    {
      title: "Contact",
      link: "/#contact",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        // Check profile completeness on every login/session restore
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          const data = snap.exists() ? (snap.data() as any) : {};
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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // After login, send to profile to ensure completion
      router.push("/profile");
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      className={`px-[5vw] min-h-[10vh] md:min-h-[13vh] lg:min-h-[13vh] flex w-full fixed top-0 z-20 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg fixed" : "bg-transparent"
      }`}
    >
      <div className="flex flex-1 items-center justify-start">
        <Link href={"/"}>
          <Image
            src={"/logo/obcyLogo.svg"}
            height={500}
            width={500}
            alt=""
            className="cursor-pointer lg:w-[3rem] lg:h-[3rem] md:h-[3rem] h-[2rem] md:w-[3rem] w-[2rem]"
          />
        </Link>
      </div>
      <div className="lg:flex md:flex hidden flex-2 items-center justify-center gap-[4vw]">
        <div className="flex flex-row gap-[2vw] rounded-[50px] p-2 px-4">
          {navItems.map((item, index) => (
            <Link
              href={item?.link}
              key={index}
              className="py-1 relative cursor-pointer text-yellow-400 font-medium after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              <span className="capitalize">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="lg:flex md:flex hidden flex-1 items-center justify-end gap-[1rem]">
        {user ? (
          <Link
            href={"/profile"}
            className="flex items-center text-yellow-400 font-medium justify-center text-xl"
          >
            Hello👋,{" "}
            {user?.displayName && user.displayName.length > 10
              ? user.displayName.slice(0, 10) + "..."
              : user?.displayName}
            <button className=" ml-2 rounded-full p-[2px] text-black-950 font-semibold">
              <div className="border-[2px] rounded-full p-1 border-yellow-400">
                <Image
                  src={user?.photoURL || ""}
                  alt=""
                  className="w-[2rem] h-[2rem] rounded-full"
                  width={300}
                  height={300}
                />
              </div>
            </button>
          </Link>
        ) : (
          <div
            onClick={handleGoogleLogin}
            className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold flex flex-row gap-2"
          >
            <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
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
          </div>
        )}
      </div>
      <div className="flex md:hidden lg:hidden flex-1 items-center justify-end gap-[4vw]">
        <HiMenuAlt2
          className="text-3xl text-yellow-400"
          onClick={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-30 flex flex-col items-center justify-center">
          {/* Close button */}
          <Link
            href={"/profile"}
            className="flex items-center text-yellow-400 font-medium justify-center text-xl absolute top-9 left-6"
          >
            Hello👋,{" "}
            {user?.displayName && user.displayName.length > 30
              ? user.displayName.slice(0, 30) + "..."
              : user?.displayName}
          </Link>
          <div className="absolute top-6 right-6">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-yellow-400/20 transition"
              aria-label="Close menu"
            >
              <IconClose className="w-8 h-8 text-yellow-400" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col items-center gap-10">
            {navItems.map((item, index) => (
              <Link
                href={item?.link}
                key={index}
                onClick={handleLinkClick}
                className="text-2xl font-semibold text-yellow-400 hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            ))}

            {/* Action button */}
            <div className="mt-10">
              {user ? (
                <Link href={"/profile"} onClick={handleLinkClick}>
                  <button className="px-8 flex items-center justify-center py-3 rounded-xl bg-yellow-400 text-black-950 font-bold text-lg shadow-lg hover:bg-yellow-500 transition">
                    <span className="">Profile</span>
                    <div className="border-[2px] rounded-full p-1 border-yellow-400">
                      <Image
                        src={user?.photoURL || ""}
                        alt=""
                        className="w-[2.7rem] h-[2.7rem] rounded-full"
                        width={300}
                        height={300}
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
                  className="px-8 py-3 rounded-xl bg-yellow-400 text-black-950 font-bold text-lg shadow-lg hover:bg-yellow-500 transition"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
          <div className="flex absolute bottom-5 justify-between items-center md:flex-row lg:flex-row flex-col mt-4 text-gray-400 text-sm w-full gap-2">
            <div className="">Made with 💛 by Obcydians.</div>
            <div className="text-sm">
              © {new Date().getFullYear()} {eventName}. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
