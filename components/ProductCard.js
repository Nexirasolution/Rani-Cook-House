import Link from "next/link";
import Image from "next/image";
export default function ProductCard({
  product
}) {
  const img = product.images?.[0]?.url;
  const outOfStock = product.stock <= 0;
  return <Link href={`/products/${product.slug}`} className="group block bg-white/60 border border-stoneline rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square bg-stoneline/50 overflow-hidden">
        {img ? <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-maroon/30 font-display italic text-2xl">
            Abi
          </div>}
        {outOfStock && <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
            Out of stock
          </span>}
      </div>
      <div className="p-4">
        <p className="font-display text-lg text-ink leading-snug line-clamp-2">{product.name}</p>
        {product.weight && <p className="text-xs text-ink/50 mt-1">{product.weight}</p>}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-maroon">₹{product.price}</span>
          {product.compareAtPrice > product.price && <span className="text-xs text-ink/40 line-through">₹{product.compareAtPrice}</span>}
        </div>
      </div>
    </Link>;
}