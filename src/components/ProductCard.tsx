import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Check, MapPin, Store, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenStall?: (stallId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenStall }) => {
  const { cart, addToCart, updateCartQuantity, setSelectedStallId } = useApp();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const savingsPct = Math.round(
    ((product.supermarketPrice - product.price) / product.supermarketPrice) * 100
  );

  return (
    <article className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Product Image */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !product.inStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* Badge: Fresh / Offer */}
        {product.badge && product.inStock && (
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-xs ${
                product.badge === 'Oferta Barrial'
                  ? 'bg-orange-500 text-white'
                  : product.badge === 'Orgánico Local'
                  ? 'bg-teal-700 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Supermarket Comparison Savings Tag */}
        {product.inStock && savingsPct > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-emerald-400 text-[10px] font-bold shadow-xs">
            -{savingsPct}% vs Súper
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 text-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold shadow-md">
              <AlertCircle className="w-3.5 h-3.5" />
              Agotado hoy
            </span>
          </div>
        )}
      </div>

      {/* Stall info tag */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
        <button
          onClick={() => {
            if (onOpenStall) onOpenStall(product.stallId);
            else setSelectedStallId(product.stallId);
          }}
          className="inline-flex items-center gap-1 hover:text-emerald-700 font-semibold truncate max-w-[170px]"
        >
          <Store className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{product.stallName}</span>
        </button>
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5" />
          {product.origin.split('/')[0].trim()}
        </span>
      </div>

      {/* Product Title */}
      <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-2 group-hover:text-emerald-700 transition-colors">
        {product.name}
      </h3>

      {/* Pricing comparison row */}
      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-emerald-700 leading-none">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              /{product.unit}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 line-through">
            Súper: ${product.supermarketPrice.toFixed(2)}
          </div>
        </div>

        {/* Add to Cart / Quantity controls */}
        {product.inStock ? (
          quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90 transition-all flex items-center justify-center shadow-xs"
              title="Añadir a la canasta"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-xs text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                className="w-7 h-7 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sin stock</span>
        )}
      </div>
    </article>
  );
};
