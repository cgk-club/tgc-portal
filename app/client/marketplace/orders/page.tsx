"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

interface OrderListing {
  id: string;
  title: string;
  slug: string;
  hero_image_url: string | null;
}

interface MarketplaceOrder {
  id: string;
  listing_id: string;
  total_amount: number | null;
  currency: string;
  payment_status: string;
  fulfilment_status: string;
  tracking_number: string | null;
  points_redeemed: number | null;
  points_earned: number | null;
  gift_to: string | null;
  notes: string | null;
  created_at: string;
  listing: OrderListing | null;
}

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-red-50 text-red-600",
  partial: "bg-orange-50 text-orange-700",
};

const FULFILMENT_STYLES: Record<string, string> = {
  pending: "bg-gray-50 text-gray-600",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-teal-50 text-teal-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function MarketplaceOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) {
        router.push("/client/login");
        return;
      }

      const res = await fetch("/api/client/marketplace/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="marketplace" />
        <div className="flex items-center justify-center py-32">
          <p className="text-gray-400 font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/client/marketplace"
            className="text-xs text-green/60 hover:text-green font-body"
          >
            &#8592; Back to Marketplace
          </Link>
        </div>

        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-2">
          My Orders
        </h1>
        <p className="text-sm text-gray-500 font-body mb-8">
          Track your marketplace purchases.
        </p>

        {orders.length === 0 ? (
          <div className="bg-white border border-green/10 rounded-lg p-10 text-center">
            <p className="text-sm text-gray-400 font-body mb-3">
              No orders yet. Browse the marketplace to find something special.
            </p>
            <Link
              href="/client/marketplace"
              className="inline-block text-sm text-green hover:underline font-body"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-green/10 rounded-lg overflow-hidden"
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Listing image */}
                  <div className="flex-none w-20 h-20 rounded overflow-hidden bg-green-muted">
                    {order.listing?.hero_image_url ? (
                      <img
                        src={order.listing.hero_image_url}
                        alt={order.listing.title || "Order item"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-green/15 text-[9px] font-body">Item</span>
                      </div>
                    )}
                  </div>

                  {/* Order details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {order.listing ? (
                          <Link
                            href={`/client/marketplace/${order.listing.slug}`}
                            className="font-heading text-sm font-semibold text-gray-800 hover:text-green transition-colors line-clamp-1"
                          >
                            {order.listing.title}
                          </Link>
                        ) : (
                          <p className="font-heading text-sm font-semibold text-gray-800">
                            Order #{order.id.slice(0, 8)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 font-body mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {order.total_amount !== null && (
                        <p className="text-sm font-heading font-semibold text-green whitespace-nowrap">
                          {new Intl.NumberFormat("en-GB", {
                            style: "currency",
                            currency: order.currency || "EUR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(order.total_amount)}
                        </p>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-body ${
                          PAYMENT_STYLES[order.payment_status] || "bg-gray-50 text-gray-600"
                        }`}
                      >
                        Payment: {order.payment_status}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-body ${
                          FULFILMENT_STYLES[order.fulfilment_status] || "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {order.fulfilment_status}
                      </span>
                    </div>

                    {/* Tracking */}
                    {order.tracking_number && (
                      <p className="text-xs text-gray-500 font-body mt-2">
                        Tracking: <span className="font-medium">{order.tracking_number}</span>
                      </p>
                    )}

                    {/* Gift */}
                    {order.gift_to && (
                      <p className="text-xs text-gold font-body mt-1">
                        Gift to: {order.gift_to}
                      </p>
                    )}

                    {/* Points */}
                    {(order.points_earned || order.points_redeemed) && (
                      <div className="flex gap-3 mt-2">
                        {order.points_earned ? (
                          <span className="text-[10px] text-gold font-body">
                            +{order.points_earned} points earned
                          </span>
                        ) : null}
                        {order.points_redeemed ? (
                          <span className="text-[10px] text-green font-body">
                            -{order.points_redeemed} points redeemed
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
