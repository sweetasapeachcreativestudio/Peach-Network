export const SERVICE_GUIDE = {
  social_graphic: { label:"Social Media Graphic", min:1, max:1 },
  flyer: { label:"Flyer / Event Graphic", min:1, max:1 },
  business_card: { label:"Business Card", min:1, max:1 },
  banner: { label:"Banner / Signage", min:1, max:2 },
  carousel: { label:"Carousel (3–5 slides)", min:2, max:2 },
  newsletter: { label:"Email / Newsletter Design", min:2, max:2 },
  brochure: { label:"Brochure / Trifold", min:2, max:3 },
  presentation: { label:"Presentation Design", min:2, max:3 },
  small_web_update: { label:"Small Website Update", min:2, max:2 },
  landing_page: { label:"Landing Page Design", min:3, max:4 },
  homepage_refresh: { label:"Homepage Refresh", min:4, max:5 },
  multipage_refresh: { label:"Multi-Page Website Refresh", min:6, max:10 },
  logo_refresh: { label:"Logo Refresh", min:3, max:4 },
  new_logo: { label:"New Logo Design", min:6, max:8 },
  illustration: { label:"Custom Illustration", min:3, max:6 },
  simple_reel: { label:"Simple Reel / Short Edit", min:2, max:3 },
  advanced_video: { label:"Advanced Reel / Video Edit", min:4, max:5 },
  motion_graphic: { label:"Animated Post / Motion Graphic", min:4, max:6 },
  logo_animation: { label:"Logo Animation", min:4, max:6 },
  promo_video: { label:"Promotional Video", min:6, max:10 },
  mini_photo: { label:"Mini Content Session", min:5, max:7 },
  brand_photo: { label:"Brand / Product Session", min:8, max:10 }
} as const;

export function recommendCoins(serviceKey: keyof typeof SERVICE_GUIDE, complexity:"standard"|"expanded"="standard"){
  const item=SERVICE_GUIDE[serviceKey];
  return complexity==="expanded" ? item.max : item.min;
}

export function requiresManualScope(coins:number){ return coins>=12; }
