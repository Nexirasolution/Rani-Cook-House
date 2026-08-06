import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Shop | KMC Iyarkai Creation" };

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || "";
  const search = sp?.search || "";
  const settings = await getSettings();

  return (
    <>
      <Navbar settings={settings} />
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Our Collection</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-maroon md:text-4xl">
            Natural &amp; Handmade Products
          </h1>
        </div>
        <ProductsGrid initialCategory={category} initialSearch={search} />
      </section>
      <Footer />
    </>
  );
}