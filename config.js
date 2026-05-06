// ============================================
//  CLIENT CONFIG FILE
//  Edit this file only to customize for
//  each new client. Do not touch script.js
// ============================================

const CONFIG = {

  // ============================
  // BUSINESS INFO
  // ============================
  business: {
    name:     'Lavender Glow Beauty Space',
    tagline:  'Where elegance meets care. Your transformation begins here in the heart of Lurambi, Kakamega.',
    location: 'Bamboo, Lurambi, Kakamega County, Kenya',
    phone:    '+254 115 506 649',
    whatsapp: '+254 115 506 649',
    email:    '',
  },

  // ============================
  // OPENING HOURS
  // ============================
  hours: {
    weekdays: { days: 'Monday - Friday',   open: '7:00 AM',  close: '10:00 PM' },
    weekends: { days: 'Saturday & Sunday', open: '10:00 AM', close: '8:00 PM'  },
  },

  // ============================
  // ADMIN ACCOUNT
  // ============================
  admin: {
    email: 'situmawonderful@gmail.com',
    name:  'Wanda',
  },

  // ============================
  // FIREBASE CONFIG
  // (get from Firebase console)
  // ============================
  firebase: {
    apiKey:            'AIzaSyBbbXQVgW5WQsbtnN2SmwtOqP4cd13VfRI',
    authDomain:        'blessin-deaa8.firebaseapp.com',
    projectId:         'blessin-deaa8',
    storageBucket:     'blessin-deaa8.firebasestorage.app',
    messagingSenderId: '349721881752',
    appId:             '1:349721881752:web:0f880c563e2d54088d5ded',
  },

  // ============================
  // GOOGLE MAPS EMBED URL
  // (paste your iframe src here)
  // ============================
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d7979.534898112683!2d34.75351931091751!3d0.28933294882643085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sbamboo%20lurambi!5e0!3m2!1sen!2ske!4v1777966559038!5m2!1sen!2ske',

  // ============================
  // LOGO (Cloudinary URL)
  // ============================
  logo: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664977/lg_logo_rhjea7.png',

  // ============================
  // COLORS
  // ============================
  colors: {
    primary:    '#4a2c82',   // main purple
    secondary:  '#7c3aed',   // lighter purple
    gold:       '#c9a84c',   // gold accent
    background: '#faf7f4',   // page background
  },

  // ============================
  // SERVICES
  // Add or remove services here
  // ============================
  services: [
    {
      name:  'Manicure',
      desc:  'Classic, Gel & acrylic nail treatments',
      price: 1500,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/manicure_b_hrhetr.jpg',
    },
    {
      name:  'Pedicure',
      desc:  'Relaxing foot care and nail grooming',
      price: 1500,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/pedicure_tmimzg.jpg',
    },
    {
      name:  'Wig Installation',
      desc:  'Professional wig fitting and styling',
      price: 2500,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664970/wig_installation_gkokcs.jpg',
    },
    {
      name:  'Hair Dressing',
      desc:  'Styling, braiding, and coloring to keep you looking your best',
      price: 3000,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/hair_dressing_xb68xg.jpg',
    },
    {
      name:  'Barber Shop',
      desc:  'Fresh cuts, Cornrows, Locs installation and braids',
      price: 600,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1777664969/cornrows_hwnvtr.jpg',
    },
    {
      name:  'Full-body Massage',
      desc:  'Relaxing full-body massage to relieve stress and tension',
      price: 3500,
      image: 'https://res.cloudinary.com/dbk47jrff/image/upload/v1778066202/massage_yut61e.jpg',  
    }
    
  ],

};
