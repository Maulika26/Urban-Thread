import { supabase } from './supabase';

/**
 * Validate a coupon code against cart state
 * @returns {{ valid: boolean, coupon: object|null, error: string|null }}
 */
export async function validateCoupon(code, cartItems, cartTotal, userId) {
  if (!code || !code.trim()) {
    return { valid: false, coupon: null, error: 'Please enter a coupon code' };
  }

  const normalizedCode = code.trim().toUpperCase();

  // Fetch coupon from DB
  const { data: coupon, error: fetchError } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .single();

  if (fetchError || !coupon) {
    return { valid: false, coupon: null, error: 'Invalid coupon code' };
  }

  // Check status
  if (coupon.status !== 'active') {
    return { valid: false, coupon: null, error: 'This coupon is no longer active' };
  }

  // Check expiry
  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return { valid: false, coupon: null, error: 'This coupon has expired' };
  }

  // Check total usage limit
  if (coupon.total_usage_limit && coupon.used_count >= coupon.total_usage_limit) {
    return { valid: false, coupon: null, error: 'This coupon has reached its usage limit' };
  }

  // Check per-user usage limit
  if (userId && coupon.per_user_limit) {
    const { count } = await supabase
      .from('coupon_usage')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId);

    if (count >= coupon.per_user_limit) {
      return { valid: false, coupon: null, error: 'You have already used this coupon' };
    }
  }

  // Check minimum order value
  if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
    return {
      valid: false,
      coupon: null,
      error: `Minimum order of ₹${coupon.min_order_value.toLocaleString('en-IN')} required`
    };
  }

  // Check category restrictions
  if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
    const cartCategories = [...new Set(cartItems.map(item => item.category))];
    const hasMatchingCategory = cartCategories.some(cat =>
      coupon.applicable_categories.includes(cat)
    );
    if (!hasMatchingCategory) {
      return {
        valid: false,
        coupon: null,
        error: `This coupon is only valid for: ${coupon.applicable_categories.join(', ')}`
      };
    }
  }

  return { valid: true, coupon, error: null };
}

/**
 * Calculate discount amount based on coupon type
 * @returns {{ discountAmount: number, finalTotal: number }}
 */
export function calculateDiscount(coupon, cartTotal, cartItems) {
  if (!coupon) return { discountAmount: 0, finalTotal: cartTotal };

  let discountAmount = 0;

  if (coupon.discount_type === 'flat') {
    discountAmount = coupon.discount_value;
  } else if (coupon.discount_type === 'percentage') {
    // If category-restricted, only apply to matching items
    let applicableTotal = cartTotal;
    if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
      applicableTotal = cartItems
        .filter(item => coupon.applicable_categories.includes(item.category))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    discountAmount = (applicableTotal * coupon.discount_value) / 100;

    // Apply max discount cap
    if (coupon.max_discount && discountAmount > coupon.max_discount) {
      discountAmount = coupon.max_discount;
    }
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    discountAmount,
    finalTotal: Math.max(0, cartTotal - discountAmount)
  };
}

/**
 * Fetch available coupons for the user
 */
export async function fetchAvailableCoupons(userId) {
  const now = new Date().toISOString();

  let query = supabase
    .from('coupons')
    .select('*')
    .eq('status', 'active')
    .or(`expiry_date.is.null,expiry_date.gt.${now}`)
    .order('created_at', { ascending: false });

  const { data: coupons, error } = await query;

  if (error || !coupons) return [];

  // Filter out coupons that exceeded total usage limit
  let available = coupons.filter(c =>
    !c.total_usage_limit || c.used_count < c.total_usage_limit
  );

  // Filter out coupons the user has exhausted per-user limit
  if (userId) {
    const { data: usageData } = await supabase
      .from('coupon_usage')
      .select('coupon_id')
      .eq('user_id', userId);

    if (usageData) {
      const usageCounts = {};
      usageData.forEach(u => {
        usageCounts[u.coupon_id] = (usageCounts[u.coupon_id] || 0) + 1;
      });

      available = available.filter(c =>
        !c.per_user_limit || (usageCounts[c.id] || 0) < c.per_user_limit
      );
    }
  }

  return available;
}

/**
 * Record coupon usage after successful order
 */
export async function recordCouponUsage(couponId, userId, orderId) {
  // Insert usage record
  await supabase.from('coupon_usage').insert({
    coupon_id: couponId,
    user_id: userId,
    order_id: orderId
  });

  // Increment used_count on the coupon
  const { data: coupon } = await supabase
    .from('coupons')
    .select('used_count')
    .eq('id', couponId)
    .single();

  if (coupon) {
    await supabase
      .from('coupons')
      .update({ used_count: (coupon.used_count || 0) + 1 })
      .eq('id', couponId);
  }
}

/**
 * Find the best coupon for the current cart
 */
export function findBestCoupon(coupons, cartItems, cartTotal) {
  let bestCoupon = null;
  let bestDiscount = 0;

  for (const coupon of coupons) {
    // Check min order value
    if (coupon.min_order_value && cartTotal < coupon.min_order_value) continue;

    // Check category match
    if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
      const cartCategories = cartItems.map(item => item.category);
      if (!cartCategories.some(cat => coupon.applicable_categories.includes(cat))) continue;
    }

    const { discountAmount } = calculateDiscount(coupon, cartTotal, cartItems);
    if (discountAmount > bestDiscount) {
      bestDiscount = discountAmount;
      bestCoupon = coupon;
    }
  }

  return bestCoupon;
}
