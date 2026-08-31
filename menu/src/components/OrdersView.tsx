import { useState, useEffect } from 'react';
import { Clock, Check, UtensilsCrossed, Sparkles, RefreshCw, ChefHat } from 'lucide-react';
import { Order, OrderStatusStep } from '../types';

interface OrdersViewProps {
  order: Order | null;
  onOrderMore: () => void;
  onAdvanceStatus?: () => void;
}

export function OrdersView({
  order,
  onOrderMore,
  onAdvanceStatus,
}: OrdersViewProps) {
  if (!order) {
    return (
      <div
        id="adama-no-orders-view"
        className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center pb-24 max-w-md mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-[#1c1813] border border-[#362e22] flex items-center justify-center text-[#e5be52] mb-4">
          <Clock className="w-7 h-7 stroke-[1.6]" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold text-[#f5ebd6]">
          No Active Orders
        </h2>
        <p className="text-xs text-[#a0907c] mt-2 max-w-xs leading-relaxed">
          You haven't placed an order yet. Select from our tasting menu to begin your culinary journey.
        </p>
        <button
          onClick={onOrderMore}
          className="mt-6 px-6 py-3 rounded-full bg-[#e5be52] text-[#0e0d0b] font-semibold text-xs tracking-wider uppercase hover:bg-[#f3cc5e] transition-all shadow-md active:scale-95"
        >
          View Menu
        </button>
      </div>
    );
  }

  // Determine stage active state
  const getStatusHeadline = (status: OrderStatusStep) => {
    switch (status) {
      case 'received':
        return {
          title: 'Order Received',
          desc: 'Your ticket has arrived at our kitchen expeditor.',
        };
      case 'accepted':
        return {
          title: 'Preparing Your Experience',
          desc: 'Your order has been accepted by our Executive Chef.',
        };
      case 'preparing':
        return {
          title: 'Culinary Master in Motion',
          desc: 'Our brigade is searing and plating your courses.',
        };
      case 'ready':
        return {
          title: 'Ready for Service',
          desc: 'Our lead waiter is delivering your dishes to the table.',
        };
      case 'served':
        return {
          title: 'Courses Delivered',
          desc: 'Bon appétit. Please let us know if we may bring anything else.',
        };
      default:
        return {
          title: 'Preparing Your Experience',
          desc: 'Your order has been accepted by our Executive Chef.',
        };
    }
  };

  const headline = getStatusHeadline(order.status);

  return (
    <div
      id="adama-orders-view"
      className="min-h-screen pb-32 pt-4 px-4 max-w-md mx-auto space-y-6"
    >
      {/* Top Status Icon & Heading */}
      <div className="flex flex-col items-center text-center pt-2 space-y-3">
        {/* Glowing Clock Badge */}
        <div className="w-14 h-14 rounded-full bg-[#1e1912] border border-[#4d3d25] flex items-center justify-center text-[#e5be52] shadow-[0_0_20px_rgba(229,190,82,0.15)] animate-pulse">
          <Clock className="w-6 h-6 stroke-[1.8]" />
        </div>

        <div className="space-y-1.5 px-4">
          <h2
            id="order-status-heading"
            className="font-serif-luxury text-3xl font-bold text-[#f7eedc] tracking-tight leading-tight"
          >
            {headline.title}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#a69784] font-sans max-w-xs mx-auto leading-relaxed">
            {headline.desc}
          </p>
        </div>

        {/* Estimated Time Pill */}
        <div className="pt-1">
          <div className="px-5 py-2 rounded-full bg-[#181410] border border-[#524128]/80 text-xs font-medium text-[#e5c365] tracking-wide shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e5be52] animate-ping" />
            <span>Estimated time: {order.estimatedMinutes}</span>
          </div>
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="py-2 px-3">
        <div className="relative pl-6 space-y-7 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#d4af37] before:via-[#d4af37]/60 before:to-[#2b251d]">
          {order.timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isActive = step.active;
            const isPending = !isCompleted && !isActive;

            return (
              <div
                key={step.step}
                className={`relative flex items-start gap-4 transition-all duration-300 ${
                  isPending ? 'opacity-45' : 'opacity-100'
                }`}
              >
                {/* Node Icon on Timeline */}
                <div
                  className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#e5be52] text-[#0e0d0b] shadow-md shadow-[#e5be52]/30'
                      : isActive
                      ? 'bg-[#181410] border-2 border-[#e5be52] text-[#e5be52] ring-4 ring-[#e5be52]/20'
                      : 'bg-[#12100d] border border-[#3b3225] text-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#e5be52] animate-pulse" />
                  ) : null}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between">
                    <h4
                      className={`font-serif-luxury text-lg font-bold leading-tight ${
                        isCompleted || isActive
                          ? 'text-[#f5eedf]'
                          : 'text-[#877866]'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.time && (
                      <span className="text-[11px] text-[#91816e] font-sans font-medium">
                        {step.time}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 font-sans leading-relaxed ${
                      isActive
                        ? 'text-[#d4af37] font-medium'
                        : isCompleted
                        ? 'text-[#9c8d7b]'
                        : 'text-[#6e6151]'
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator helper button if onAdvanceStatus provided */}
      {onAdvanceStatus && (
        <div className="flex justify-center -mt-2">
          <button
            onClick={onAdvanceStatus}
            className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#1c1813] hover:bg-[#252019] text-[#bda890] hover:text-[#f0e2cf] border border-[#332b21] flex items-center gap-1.5 transition-colors"
            title="Fast-forward kitchen simulation for preview"
          >
            <RefreshCw className="w-3 h-3 text-[#e5be52]" />
            <span>Simulate Kitchen Next Stage</span>
          </button>
        </div>
      )}

      {/* Current Order Summary Card */}
      <div
        id="current-order-summary-card"
        className="p-5 rounded-2xl bg-[#161310] border border-[#2b251d] space-y-4 shadow-xl"
      >
        <h3 className="text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase font-sans">
          Current Order Summary
        </h3>

        {/* Dish Lines */}
        <div className="space-y-3 divide-y divide-[#221c15]">
          {order.items.map((item, idx) => (
            <div
              key={item.cartId || idx}
              className={`flex items-center justify-between gap-3 ${
                idx > 0 ? 'pt-3' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-serif-luxury text-base font-bold text-[#f3ecde] truncate">
                  {item.dish.name}
                </h4>
                <p className="text-[11px] text-[#938472] font-sans truncate">
                  {item.selectedCutSize?.name ||
                    item.selectedTemp ||
                    item.dish.tagline ||
                    item.dish.description}
                </p>
              </div>
              <span className="font-serif-luxury text-base font-bold text-[#e5be52] px-2 py-0.5 bg-[#201b16] rounded-md border border-[#362e24]">
                {item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Order More Action Button */}
        <div className="pt-2">
          <button
            id="btn-order-more"
            onClick={onOrderMore}
            className="w-full py-3 rounded-xl bg-[#1d1914] hover:bg-[#27211a] active:scale-[0.99] border border-[#3d3326] text-[#ebdcc6] hover:text-[#fff5e3] hover:border-[#63533c] text-xs font-semibold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#e5be52]" />
            <span>Order More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
