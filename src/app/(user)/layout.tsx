import React from "react";
import HeaderView from "@widgets/Header/view";
import FooterView from "@widgets/Footer/view";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HeaderView />
      {children}
      <section id="contact">
        <FooterView />
      </section>
    </div>
  );
}
