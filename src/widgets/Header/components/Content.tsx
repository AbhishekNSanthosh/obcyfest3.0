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
                  className="w-[2.7rem] h-[2.7rem] rounded-full"
                  width={300}
                  height={300}
                />
              </div>
            </button>
          </Link>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="bg-yellow-400 rounded-lg px-[1rem] py-2 text-black-950 font-semibold"
          >
            Sign in with Google
          </button>
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
