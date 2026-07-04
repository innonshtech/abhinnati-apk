export interface Area {
  id: string;
  name_mr: string;
  name_en: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  locality?: string;
  city?: string;
}

export interface Category {
  id: string;
  slug: string;
  name_mr: string;
  name_en: string;
  iconName: string;
}

export interface Service {
  id: string;
  name_mr: string;
  name_en: string;
  price: number;
  duration_mins: number;
  description_mr: string;
  description_en: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  reply?: string;
  date?: string;
  createdAt?: string | Date;
}

export interface Vendor {
  id: string;
  userId: string;
  businessNameMr: string;
  businessNameEn: string;
  categorySlug: string;
  categoryNameMr: string;
  categoryNameEn: string;
  descriptionMr: string;
  descriptionEn: string;
  latitude: number;
  longitude: number;
  areaId: string;
  kycStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'PENDING_REVIEW';
  kycDocsUrl: string;
  isFullyBooked: boolean;
  ratingAvg: number;
  reviewsCount: number;
  services: Service[];
  reviews: Review[];
  imageUrl?: string;
  distance: string;
  createdAt?: string;
  firstApprovedLogin?: boolean;
  formattedAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  placeId?: string;
  coverPhotoUrl?: string;
  logoUrl?: string;
  galleryUrls?: string;
  prevOrdersPhotosUrls?: string;
  prevOrdersVideosUrls?: string;
  weeklyHours?: string;
  vacationMode?: boolean;
  vacationStart?: string;
  vacationEnd?: string;
  vacationReason?: string;
  blockedDates?: string;
  blockedSlots?: string;
  serviceRadius?: string;
  emergencyStatus?: string;
  whatsappNumber?: string;
  email?: string;
  phone?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  areaId: string;
  tag: 'community' | 'local_issue' | 'spotlight';
  title_mr: string;
  title_en: string;
  content_mr: string;
  content_en: string;
  imageUrl?: string;
  likes: number;
  likedBy: string[]; // array of userIds
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  vendorId: string;
  vendorName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'upi' | 'card' | 'cod';
  transactionId?: string;
  createdAt: string;
  cancelUntil?: string;
  trackingStatus: 'ordered' | 'en_route' | 'in_progress' | 'completed';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title_mr: string;
  title_en: string;
  message_mr: string;
  message_en: string;
  type: 'booking' | 'community' | 'spotlight' | 'system';
  read: boolean;
  createdAt: string;
}

// 1. Seed Areas
export const mockAreas: Area[] = [
  { id: 'area-bandra', name_mr: 'वांद्रे पश्चिम', name_en: 'Bandra West', latitude: 19.0596, longitude: 72.8295, radius_km: 3.0, locality: 'Bandra West', city: 'Mumbai' },
  { id: 'area-bandra-east', name_mr: 'वांद्रे पूर्व', name_en: 'Bandra East', latitude: 19.0620, longitude: 72.8464, radius_km: 3.0, locality: 'Bandra East', city: 'Mumbai' },
  { id: 'area-khar', name_mr: 'खार', name_en: 'Khar', latitude: 19.0700, longitude: 72.8350, radius_km: 3.0, locality: 'Khar', city: 'Mumbai' },
  { id: 'area-santacruz', name_mr: 'सांताक्रूझ', name_en: 'Santacruz', latitude: 19.0800, longitude: 72.8400, radius_km: 3.0, locality: 'Santacruz', city: 'Mumbai' },
  { id: 'area-kothrud', name_mr: 'कोथरूड (पुणे)', name_en: 'Kothrud (Pune)', latitude: 18.5074, longitude: 73.8077, radius_km: 5.0, locality: 'Kothrud', city: 'Pune' },
  { id: 'area-deccan', name_mr: 'डेक्कन जिमखाना (पुणे)', name_en: 'Deccan Gymkhana (Pune)', latitude: 18.5186, longitude: 73.8417, radius_km: 4.0, locality: 'Deccan Gymkhana', city: 'Pune' },
  { id: 'area-dadar', name_mr: 'दादर (मुंबई)', name_en: 'Dadar (Mumbai)', latitude: 19.0178, longitude: 72.8478, radius_km: 5.0, locality: 'Dadar', city: 'Mumbai' },
  { id: 'area-girgaon', name_mr: 'गिरगाव (मुंबई)', name_en: 'Girgaon (Mumbai)', latitude: 18.9585, longitude: 72.8202, radius_km: 3.5, locality: 'Girgaon', city: 'Mumbai' },
  { id: 'area-panchavati', name_mr: 'पंचवटी (नाशिक)', name_en: 'Panchavati (Nashik)', latitude: 20.0076, longitude: 73.7997, radius_km: 6.0, locality: 'Panchavati', city: 'Nashik' },
  { id: 'area-pcmc', name_mr: 'पिंपरी-चिंचवड (पुणे)', name_en: 'PCMC (Pune)', latitude: 18.6298, longitude: 73.7997, radius_km: 6.0, locality: 'PCMC', city: 'Pune' },
  { id: 'area-baner', name_mr: 'बाणेर (पुणे)', name_en: 'Baner (Pune)', latitude: 18.5590, longitude: 73.7868, radius_km: 4.0, locality: 'Baner', city: 'Pune' },
  { id: 'area-wakad', name_mr: 'वाकड (पुणे)', name_en: 'Wakad (Pune)', latitude: 18.5987, longitude: 73.7652, radius_km: 4.0, locality: 'Wakad', city: 'Pune' },
  { id: 'area-hinjewadi', name_mr: 'हिंजवडी (पुणे)', name_en: 'Hinjewadi (Pune)', latitude: 18.5913, longitude: 73.7389, radius_km: 5.0, locality: 'Hinjewadi', city: 'Pune' },
  { id: 'area-hadapsar', name_mr: 'हडपसर (पुणे)', name_en: 'Hadapsar (Pune)', latitude: 18.5089, longitude: 73.9259, radius_km: 5.0, locality: 'Hadapsar', city: 'Pune' },
  { id: 'area-ravet', name_mr: 'रावेत (पुणे)', name_en: 'Ravet (Pune)', latitude: 18.6606, longitude: 73.7322, radius_km: 4.0, locality: 'Ravet', city: 'Pune' },
];

// 2. Seed Categories
export const mockCategories: Category[] = [
  { id: 'cat-plumbing', slug: 'plumbing', name_mr: 'प्लंबर आणि गवंडी', name_en: 'Plumbing & Masonry', iconName: 'Wrench' },
  { id: 'cat-legal', slug: 'legal', name_mr: 'कायदेशीर सल्ला', name_en: 'Legal Advice', iconName: 'Scale' },
  { id: 'cat-cleaning', slug: 'cleaning', name_mr: 'घर स्वच्छता', name_en: 'Home Cleaning', iconName: 'Sparkles' },
  { id: 'cat-electric', slug: 'electric', name_mr: 'इलेक्ट्रिक कामे', name_en: 'Electrical Works', iconName: 'Zap' },
  { id: 'cat-food', slug: 'food', name_mr: 'घरगुती जेवण tiffin', name_en: 'Home Cooked Tiffin', iconName: 'Utensils' },
];

// 3. Seed Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-patil',
    userId: 'user-patil-owner',
    businessNameMr: 'पाटील प्लंबिंग सर्व्हिसेस',
    businessNameEn: 'Patil Plumbing Services',
    categorySlug: 'plumbing',
    categoryNameMr: 'प्लंबर आणि गवंडी',
    categoryNameEn: 'Plumbing & Masonry',
    descriptionMr: 'आम्ही नळ दुरुस्ती, पाईपलाईन जोडणी आणि वॉटरप्रूफिंगची सर्व कामे वेळेवर आणि वाजवी दरात करतो. गेल्या १० वर्षांचा अनुभव.',
    descriptionEn: 'We provide pipeline fittings, leakage repairs, and waterproofing. 10 years of trusted experience in Kothrud.',
    latitude: 18.5080,
    longitude: 73.8085,
    areaId: 'area-kothrud',
    kycStatus: 'approved',
    kycDocsUrl: 'https://abhinnati.com/kyc/patil_gst.pdf',
    isFullyBooked: false,
    ratingAvg: 4.8,
    reviewsCount: 3,
    distance: '०.४ किमी',
    services: [
      {
        id: 'srv-patil-1',
        name_mr: 'सामान्य पाईप दुरुस्ती',
        name_en: 'General Pipe Repair & Service',
        price: 250,
        duration_mins: 60,
        description_mr: 'नळ गळती बंद करणे किंवा पाईपची जोडणी बदलणे (साहित्य वेगळे)',
        description_en: 'Fix leaks and replace pipeline connectors (Materials extra)',
      },
      {
        id: 'srv-patil-2',
        name_mr: 'वॉटर टँक क्लिनिंग आणि लीकेज तपासणी',
        name_en: 'Water Tank Inspection & Cleaning',
        price: 600,
        duration_mins: 120,
        description_mr: 'टाकी पूर्णपणे स्वच्छ करणे आणि गळतीची जागा शोधून दुरुस्त करणे',
        description_en: 'Complete cleaning and waterproofing leak repair for tanks',
      },
    ],
    reviews: [
      {
        id: 'rev-patil-1',
        userName: 'अमित देशपांडे',
        rating: 5,
        text: 'खूपच वेळेवर आले आणि काम व्यवस्थित करून दिले. बोलणे नम्र होते.',
        reply: 'धन्यवाद अमित जी, सेवा देण्यास आनंद झाला!',
        date: '10 जून 2026',
      },
      {
        id: 'rev-patil-2',
        userName: 'स्नेहल पाटील',
        rating: 4,
        text: 'काम चांगले केले, थोडे शुल्क जास्त वाटले पण काम पक्के आहे.',
        date: '5 जून 2026',
      },
    ],
  },
  {
    id: 'vendor-sathe',
    userId: 'user-sathe-owner',
    businessNameMr: 'साठे आणि असोसिएट्स',
    businessNameEn: 'Sathe & Associates Legal Services',
    categorySlug: 'legal',
    categoryNameMr: 'कायदेशीर सल्ला',
    categoryNameEn: 'Legal Advice',
    descriptionMr: 'जमीन खरेदी-विक्री दस्तांचे कायदेशीर परीक्षण, प्रतिज्ञापत्रे, आणि सर्व प्रकारच्या करारांची कायदेशीर तपासणी करण्यासाठी संपर्क करा.',
    descriptionEn: 'Property registry search, affidavit draftings, and absolute legal consultations for corporate or family contracts.',
    latitude: 18.5065,
    longitude: 73.8050,
    areaId: 'area-kothrud',
    kycStatus: 'approved',
    kycDocsUrl: 'https://abhinnati.com/kyc/sathe_bar.pdf',
    isFullyBooked: false,
    ratingAvg: 4.9,
    reviewsCount: 2,
    distance: '१.२ किमी',
    services: [
      {
        id: 'srv-sathe-1',
        name_mr: 'भाडेकरार मसुदा लेखन (Rent Agreement)',
        name_en: 'Rent Agreement Drafting',
        price: 800,
        duration_mins: 45,
        description_mr: 'कायदेशीर नियमावलीनुसार अचूक भाडेकरार मसुदा तयार करून मिळणे.',
        description_en: 'Accurate and customized drafting of standard rental agreements.',
      },
      {
        id: 'srv-sathe-2',
        name_mr: 'प्राथमिक कायदेशीर सल्ला सत्र',
        name_en: 'Initial Legal Consultation',
        price: 500,
        duration_mins: 30,
        description_mr: 'जमीन किंवा मालमत्तेच्या वादांबाबत प्राथमिक सल्ला आणि मार्गदर्शन.',
        description_en: 'Property, civil, or corporate initial legal counseling session.',
      },
    ],
    reviews: [
      {
        id: 'rev-sathe-1',
        userName: 'राजू मोरे',
        rating: 5,
        text: 'खूप मोलाचे मार्गदर्शन मिळाले. जमीन व्यवहारातील गुंतागुंत सोपी करून सांगितली.',
        reply: 'धन्यवाद राजू जी!',
        date: '12 जून 2026',
      },
    ],
  },
  {
    id: 'vendor-tambe',
    userId: 'user-tambe-owner',
    businessNameMr: 'तांबे स्वच्छता एजन्सी',
    businessNameEn: 'Tambe Cleaning Agency',
    categorySlug: 'cleaning',
    categoryNameMr: 'घर स्वच्छता',
    categoryNameEn: 'Home Cleaning',
    descriptionMr: 'दादर मधील सर्वात जुने आणि विश्वासाचे क्लीनिंग युनिट. १ BHK, २ BHK खोल्या आणि कार्यालयांची डीप क्लीनिंग सेवा उपलब्ध.',
    descriptionEn: 'Home deep cleaning, sofa cleaning, and vacuum services in Dadar area since 2018.',
    latitude: 19.0190,
    longitude: 72.8465,
    areaId: 'area-dadar',
    kycStatus: 'approved',
    kycDocsUrl: 'https://abhinnati.com/kyc/tambe_lic.pdf',
    isFullyBooked: false,
    ratingAvg: 4.5,
    reviewsCount: 1,
    distance: '०.७ किमी',
    services: [
      {
        id: 'srv-tambe-1',
        name_mr: 'सोफा आणि कार्पेट व्हॅक्यूम क्लीनिंग',
        name_en: 'Sofa & Carpet Vacuuming',
        price: 400,
        duration_mins: 90,
        description_mr: '५ सीटर सोफा आणि १ मोठा कार्पेट हायजीन व्हॅक्यूम व डाग काढणे.',
        description_en: 'Eco-friendly vacuuming and stain removal for 5-seater sofa.',
      },
    ],
    reviews: [
      {
        id: 'rev-tambe-1',
        userName: 'प्रियंका सरनाईक',
        rating: 4,
        text: 'मशीन्स चांगल्या होत्या, काम वेळेत पूर्ण केले.',
        date: '14 जून 2026',
      },
    ],
  },
  {
    id: 'vendor-sai-cycles',
    userId: 'user-sai-owner',
    businessNameMr: 'साई सायकल्स',
    businessNameEn: 'Sai Cycles',
    categorySlug: 'plumbing',
    categoryNameMr: 'दुरुस्ती',
    categoryNameEn: 'Repair',
    descriptionMr: 'सायकल दुरुस्ती आणि सर्व्हिसिंगसाठी संपर्क साधा.',
    descriptionEn: 'Expert bicycle repair and servicing in Bandra West.',
    latitude: 19.0600,
    longitude: 72.8300,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.6,
    reviewsCount: 1,
    distance: '1.2 km',
    services: [
      {
        id: 'srv-sai-1',
        name_mr: 'सायकल सर्व्हिसिंग',
        name_en: 'Bicycle Servicing',
        price: 150,
        duration_mins: 30,
        description_mr: 'चैन ऑइलिंग, ब्रेक ट्यूनिंग आणि स्वच्छता',
        description_en: 'Chain oiling, brake tuning and cleaning',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-reshma-tiffin',
    userId: 'user-reshma-owner',
    businessNameMr: 'रेश्मा टिफिन',
    businessNameEn: 'Reshma Tiffin',
    categorySlug: 'food',
    categoryNameMr: 'घरगुती जेवण',
    categoryNameEn: 'Food',
    descriptionMr: 'घरगुती आणि सकस डबा सेवा. रोज नवीन बेत.',
    descriptionEn: 'Healthy home-cooked tiffin service delivered straight to your door.',
    latitude: 19.0610,
    longitude: 72.8280,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.8,
    reviewsCount: 3,
    distance: '1.8 km',
    services: [
      {
        id: 'srv-reshma-1',
        name_mr: 'व्हेज थाळी डबा',
        name_en: 'Veg Thali Tiffin',
        price: 90,
        duration_mins: 45,
        description_mr: '२ चपाती, भाजी, डाळ, भात आणि कोशिंबीर',
        description_en: '2 chapatis, subji, dal, rice and salad',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-nova-electric',
    userId: 'user-nova-owner',
    businessNameMr: 'नोव्हा इलेक्ट्रिकल',
    businessNameEn: 'Nova Electricals',
    categorySlug: 'electric',
    categoryNameMr: 'इलेक्ट्रिक कामे',
    categoryNameEn: 'Electricals',
    descriptionMr: 'सर्व प्रकारची घरगुती वायरिंग आणि उपकरण दुरुस्ती.',
    descriptionEn: 'All kinds of domestic electrical wiring and appliance repairs.',
    latitude: 19.0590,
    longitude: 72.8290,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.7,
    reviewsCount: 2,
    distance: '100 m',
    services: [
      {
        id: 'srv-nova-1',
        name_mr: 'फॅन दुरुस्ती',
        name_en: 'Ceiling Fan Repair',
        price: 200,
        duration_mins: 30,
        description_mr: 'फॅन दुरुस्ती',
        description_en: 'Ceiling Fan Repair',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-water-supplier',
    userId: 'user-water-owner',
    businessNameMr: 'वॉटर सप्लायर',
    businessNameEn: 'Water Supplier',
    categorySlug: 'plumbing',
    categoryNameMr: 'पाणी पुरवठा',
    categoryNameEn: 'General',
    descriptionMr: '२० लिटर पाण्याच्या जारचा वेळेत पुरवठा.',
    descriptionEn: 'Timely supply of 20L pure drinking water jars.',
    latitude: 19.0620,
    longitude: 72.8310,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.5,
    reviewsCount: 5,
    distance: '1.2 km',
    services: [
      {
        id: 'srv-water-1',
        name_mr: '२० ली वॉटर जार',
        name_en: '20L Drinking Water Jar',
        price: 50,
        duration_mins: 15,
        description_mr: 'शुद्ध पिण्याचे पाणी थेट घरपोच',
        description_en: 'Purified drinking water jar delivered to your flat',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-raju-electricals',
    userId: 'user-raju-owner',
    businessNameMr: 'राजू इलेक्ट्रिकल्स',
    businessNameEn: 'Raju Electricals',
    categorySlug: 'electric',
    categoryNameMr: 'इलेक्ट्रिक कामे',
    categoryNameEn: 'Electrical Works',
    descriptionMr: 'घरगुती वायरिंग आणि रिपेअरिंग कामांसाठी त्वरित संपर्क साधा.',
    descriptionEn: 'Contact for fast home wiring and electric repairs.',
    latitude: 19.0592,
    longitude: 72.8298,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.6,
    reviewsCount: 38,
    distance: '400 m',
    services: [
      {
        id: 'srv-raju-1',
        name_mr: 'शॉर्ट सर्किट दुरुस्ती',
        name_en: 'Short Circuit Repair',
        price: 300,
        duration_mins: 45,
        description_mr: 'घरगुती शॉर्ट सर्किट समस्या तपासणे आणि दुरुस्त करणे',
        description_en: 'Identify and repair domestic short circuits',
      },
      {
        id: 'srv-raju-2',
        name_mr: 'फॅन दुरुस्ती',
        name_en: 'Fan repair',
        price: 200,
        duration_mins: 30,
        description_mr: 'फॅन दुरुस्ती आणि सर्व्हिसिंग',
        description_en: 'Ceiling or wall fan repair and servicing',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-tai-tiffin',
    userId: 'user-tai-owner',
    businessNameMr: 'ताई टिफिन सर्व्हिसेस',
    businessNameEn: 'Tai Tiffin Service',
    categorySlug: 'food',
    categoryNameMr: 'घरगुती जेवण tiffin',
    categoryNameEn: 'Home Cooked Tiffin',
    descriptionMr: 'शुद्ध आणि चवदार घरगुती पद्धतीचे डबे.',
    descriptionEn: 'Pure and tasty home-style tiffin service in Bandra.',
    latitude: 19.0600,
    longitude: 72.8315,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.6,
    reviewsCount: 38,
    distance: '700 m',
    services: [
      {
        id: 'srv-tai-1',
        name_mr: 'मराठमोळा डबा',
        name_en: 'Maharashtrian Tiffin Box',
        price: 100,
        duration_mins: 30,
        description_mr: '३ चपाती, १ सुकी भाजी, रस्सा भाजी आणि वरण भात',
        description_en: '3 chapatis, 1 dry subji, gravy curry, dal and rice',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-anil-plumbing',
    userId: 'user-anil-owner',
    businessNameMr: 'अनिल प्लंबिंग',
    businessNameEn: 'Anil Plumbing',
    categorySlug: 'plumbing',
    categoryNameMr: 'प्लंबर आणि गवंडी',
    categoryNameEn: 'Plumbing & Masonry',
    descriptionMr: 'नळ आणि नळजोडणी दुरुस्तीची सर्व कामे.',
    descriptionEn: 'All kinds of pipe fitting and leakage repairs.',
    latitude: 19.0602,
    longitude: 72.8290,
    areaId: 'area-bandra',
    kycStatus: 'approved', // verified checkmark
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.6,
    reviewsCount: 38,
    distance: '1.6 km',
    services: [
      {
        id: 'srv-anil-1',
        name_mr: 'गळती दुरुस्ती',
        name_en: 'Leakage Repair',
        price: 200,
        duration_mins: 30,
        description_mr: 'नळ किंवा पाईप मधील गळती बंद करणे',
        description_en: 'Fix leaks in taps or pipes',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-sai-plumber',
    userId: 'user-sai-plumber-owner',
    businessNameMr: 'साई प्लंबर',
    businessNameEn: 'Sai Plumber',
    categorySlug: 'plumbing',
    categoryNameMr: 'प्लंबर आणि गवंडी',
    categoryNameEn: 'Plumbing & Masonry',
    descriptionMr: 'घरगुती प्लंबिंग सेवा.',
    descriptionEn: 'Household plumbing services.',
    latitude: 19.0610,
    longitude: 72.8295,
    areaId: 'area-bandra',
    kycStatus: 'approved', // verified checkmark
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.3,
    reviewsCount: 78,
    distance: '2.3 km',
    services: [],
    reviews: [],
  },
  {
    id: 'vendor-mahesh-repairs',
    userId: 'user-mahesh-owner',
    businessNameMr: 'महेश रिपेअर्स',
    businessNameEn: 'Mahesh Repairs',
    categorySlug: 'plumbing',
    categoryNameMr: 'प्लंबर आणि गवंडी',
    categoryNameEn: 'Plumbing & Masonry',
    descriptionMr: 'प्लंबिंग आणि इतर घरगुती दुरुस्ती.',
    descriptionEn: 'Plumbing and home repair services.',
    latitude: 19.0595,
    longitude: 72.8305,
    areaId: 'area-bandra',
    kycStatus: 'pending', // no verified checkmark
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.0,
    reviewsCount: 12,
    distance: '2.4 km',
    services: [],
    reviews: [],
  },
  {
    id: 'vendor-quick-fix-plumbers',
    userId: 'user-quick-fix-owner',
    businessNameMr: 'क्विक फिक्स प्लंबर्स',
    businessNameEn: 'Quick Fix Plumbers',
    categorySlug: 'plumbing',
    categoryNameMr: 'प्लंबर आणि गवंडी',
    categoryNameEn: 'Plumbing & Masonry',
    descriptionMr: 'त्वरित प्लंबिंग सेवा.',
    descriptionEn: 'Emergency plumbing services.',
    latitude: 19.0585,
    longitude: 72.8320,
    areaId: 'area-bandra',
    kycStatus: 'pending', // no verified checkmark
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.9,
    reviewsCount: 38,
    distance: '3 km',
    services: [],
    reviews: [],
  },
  {
    id: 'vendor-joshi-cleaning',
    userId: 'user-joshi-owner',
    businessNameMr: 'जोशी होम क्लीनिंग सर्व्हिसेस',
    businessNameEn: 'Joshi Home Cleaning Services',
    categorySlug: 'cleaning',
    categoryNameMr: 'घर स्वच्छता',
    categoryNameEn: 'Home Cleaning',
    descriptionMr: 'आम्ही घर, ऑफिस आणि सोफा क्लीनिंगची उत्तम सेवा देतो.',
    descriptionEn: 'Professional deep home cleaning, office sanitization, and sofa vacuuming.',
    latitude: 18.5085,
    longitude: 73.8090,
    areaId: 'area-kothrud',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.7,
    reviewsCount: 4,
    distance: '१.४ किमी',
    services: [
      {
        id: 'srv-joshi-1',
        name_mr: '१ BHK डीप क्लीनिंग',
        name_en: '1 BHK Deep Cleaning',
        price: 1800,
        duration_mins: 240,
        description_mr: 'खोली, किचन आणि बाथरूमची संपूर्ण स्वच्छता',
        description_en: 'Complete chemical cleaning of rooms, kitchen, and bathroom',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-khanna-food',
    userId: 'user-khanna-owner',
    businessNameMr: 'खन्ना टिफिन सर्व्हिसेस',
    businessNameEn: 'Khanna Tiffin Services',
    categorySlug: 'food',
    categoryNameMr: 'घरगुती जेवण tiffin',
    categoryNameEn: 'Home Cooked Tiffin',
    descriptionMr: 'घरगुती आणि पौष्टिक दुपारचे व रात्रीचे जेवण डबा सेवा.',
    descriptionEn: 'Healthy, home-style lunch and dinner tiffin delivered warm.',
    latitude: 18.5060,
    longitude: 73.8070,
    areaId: 'area-kothrud',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.8,
    reviewsCount: 8,
    distance: '८०० मी',
    services: [
      {
        id: 'srv-khanna-1',
        name_mr: 'स्पेशल व्हेज थाळी',
        name_en: 'Special Veg Thali Tiffin',
        price: 110,
        duration_mins: 30,
        description_mr: 'रोटी, भाजी, भात, डाळ आणि लोणचे',
        description_en: '3 rotis, seasonal subji, dal, rice, and pickle',
      }
    ],
    reviews: [],
  },
  {
    id: 'vendor-aai',
    userId: 'user-aai-owner',
    businessNameMr: 'आयझ बेकरी',
    businessNameEn: 'Aai’s Bakery',
    categorySlug: 'food',
    categoryNameMr: 'बेकरी',
    categoryNameEn: 'Bakery',
    descriptionMr: 'वांद्रे येथील ताज्या आणि चवदार कस्टमाइज्ड केक आणि पाव.',
    descriptionEn: "Aai's Bakery is a home-based bakery in Bandra West, known for its eggless custom cakes, freshly baked bread, and festive sweets. For the past five years, Aai has personally run the business, ensuring that every order is freshly prepared with care and attention to quality.",
    latitude: 19.0605,
    longitude: 72.8290,
    areaId: 'area-bandra',
    kycStatus: 'approved',
    kycDocsUrl: '',
    isFullyBooked: false,
    ratingAvg: 4.6,
    reviewsCount: 38,
    distance: '0.4 km',
    services: [
      {
        id: 'srv-aai-1',
        name_mr: 'कस्टम केक ऑर्डर',
        name_en: 'Custom cake order',
        price: 600,
        duration_mins: 120,
        description_mr: 'वाढदिवस, लग्न किंवा इतर कोणत्याही खास प्रसंगासाठी कस्टमाइज्ड केक.',
        description_en: 'Order customized cakes for birthdays, weddings, or any special occasions.',
      },
      {
        id: 'srv-aai-2',
        name_mr: 'ताजा पाव (Daily Bread)',
        name_en: 'Daily fresh bread',
        price: 40,
        duration_mins: 15,
        description_mr: 'दररोज ताजे भाजलेले सँडविच ब्रेड, पाव आणि रोल्स.',
        description_en: 'Freshly baked everyday sandwich bread, pav, and dinner rolls.',
      },
      {
        id: 'srv-aai-3',
        name_mr: 'सणांचा गोड बॉक्स',
        name_en: 'Festive sweets box',
        price: 350,
        duration_mins: 180,
        description_mr: 'सणांसाठी केक, पेस्ट्री आणि स्नॅक्सचा कॉम्बो पॅक.',
        description_en: 'Festive sweets box with cakes, pastries and snacks.',
      }
    ],
    reviews: [
      {
        id: 'rev-aai-1',
        userName: 'Sneha P.',
        rating: 5,
        text: 'Best bakery items in Bandra. The fresh daily bread is absolutely amazing!',
        date: '22 जून 2026',
      }
    ],
  },
];

// 4. Seed Posts
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-tambe-owner',
    authorName: 'तांबे स्वच्छता एजन्सी (व्यावसायिक)',
    areaId: 'area-kothrud',
    tag: 'spotlight',
    title_mr: 'नवीन सेवा आपल्या भागात सुरू!',
    title_en: 'New verified service active now!',
    content_mr: 'कोथरूड परिसरातील रहिवाशांसाठी खुशखबर! आता आपल्या भागात अधिकृत व पडताळणी केलेली घर स्वच्छता सेवा उपलब्ध आहे. पहिल्या ५ ग्राहकांसाठी २०% सूट उपलब्ध. आजच बुकिंग करा!',
    content_en: 'Good news for Kothrud residents! We are officially launched in your area. Use first-time booking to get 20% discount on deep home sanitation!',
    likes: 12,
    likedBy: [],
    commentsCount: 2,
    createdAt: '2026-06-16T10:30:00Z',
  },
  {
    id: 'post-2',
    authorId: 'user-resident-1',
    authorName: 'महेश कुलकर्णी',
    areaId: 'area-kothrud',
    tag: 'local_issue',
    title_mr: 'शास्त्रीनगर रोडवर कचरा साचला आहे',
    title_en: 'Garbage dump pile at Shastrinagar road',
    content_mr: 'गेल्या ३ दिवसांपासून मनपाची कचरा गाडी शास्त्रीनगरच्या कॉर्नरला आलेली नाही. रस्त्यावर दुर्गंधी पसरली आहे. स्थानिक रहिवाशांनी एकत्र तक्रार नोंदवावी ही विनंती.',
    content_en: 'Garbage bin has not been cleared for the last three days near Shastrinagar lane. Bad odor is spreading. Request all to report on NMC app.',
    likes: 24,
    likedBy: [],
    commentsCount: 3,
    createdAt: '2026-06-15T08:15:00Z',
  },
  {
    id: 'post-3',
    authorId: 'user-resident-2',
    authorName: 'मीनाक्षी जोशी',
    areaId: 'area-kothrud',
    tag: 'community',
    title_mr: 'रविवार सकाळी योगा वर्ग - कोथरूड पार्क',
    title_en: 'Sunday morning free Yoga session - Kothrud Park',
    content_mr: 'या रविवारी सकाळी ६:३० वाजता कोथरूड उद्यानामध्ये एक विनामूल्य योगा वर्ग आयोजित केला आहे. सर्वांनी चटई घेऊन यावे. आपले आरोग्य आपल्या हाती!',
    content_en: 'Organizing a free Yoga session this Sunday at 6:30 AM in Kothrud Park. Feel free to join, bring your yoga mats.',
    likes: 18,
    likedBy: [],
    commentsCount: 1,
    createdAt: '2026-06-14T14:20:00Z',
  },
  {
    id: 'post-sneha',
    authorId: 'user-sneha',
    authorName: 'Sneha P.',
    areaId: 'area-bandra',
    tag: 'local_issue',
    title_mr: 'पाणी टंचाई',
    title_en: 'Water Shortage',
    content_mr: 'गेले तीन दिवस सकाळी आमच्या गल्लीत पाणी येत नाही. कोणाला कारण माहिती आहे का?',
    content_en: 'There is no water coming in our street for the last three days in the morning. Does anyone know the reason?',
    likes: 12,
    likedBy: [],
    commentsCount: 2,
    createdAt: '2026-06-23T14:00:00Z',
  },
  {
    id: 'post-loki-1',
    authorId: 'user-loki',
    authorName: 'Loki L.',
    areaId: 'area-bandra',
    tag: 'ask',
    title_mr: 'इलेक्ट्रिशियन मदत',
    title_en: 'Electrician Help',
    content_mr: 'लिंकिंग रोडजवळ चांगला इलेक्ट्रिशियन हवा आहे. कोणाकडे संपर्क आहे का?',
    content_en: 'Looking for a reliable electrician near Linking Road. Any recommendations?',
    likes: 12,
    likedBy: [],
    commentsCount: 5,
    createdAt: '2026-06-23T14:05:00Z',
  },
  {
    id: 'post-loki-2',
    authorId: 'user-loki',
    authorName: 'Loki L.',
    areaId: 'area-bandra',
    tag: 'ask',
    title_mr: 'इलेक्ट्रिशियन मदत',
    title_en: 'Electrician Help',
    content_mr: 'लिंकिंग रोडजवळ चांगला इलेक्ट्रिशियन हवा आहे. कोणाकडे संपर्क आहे का?',
    content_en: 'Looking for a reliable electrician near Linking Road. Any recommendations?',
    likes: 12,
    likedBy: [],
    commentsCount: 5,
    createdAt: '2026-06-23T14:04:00Z',
  },
  {
    id: 'post-sneha-east',
    authorId: 'user-sneha-east',
    authorName: 'Sneha P.',
    areaId: 'area-bandra-east',
    tag: 'local_issue',
    title_mr: 'गेले तीन दिवस पाणी टंचाई',
    title_en: 'Water shortage in our area',
    content_mr: 'गेले तीन दिवस सकाळी पाणी येत नाही. कारण माहिती आहे का?',
    content_en: 'There is no water coming in our street for the last three days in the morning. Does anyone know the reason?',
    likes: 12,
    likedBy: [],
    commentsCount: 2,
    createdAt: '2026-06-23T14:00:00Z',
  },
  {
    id: 'post-ravet-1',
    authorId: 'user-ravet-resident',
    authorName: 'Rahul S.',
    areaId: 'area-ravet',
    tag: 'local_issue',
    title_mr: 'रावेत उड्डाणपुलाजवळ कचरा',
    title_en: 'Garbage pile near Ravet flyover',
    content_mr: 'गेल्या ३ दिवसांपासून रावेत उड्डाणपुलाखाली कचरा साचला आहे. दुर्गंधी येत आहे.',
    content_en: 'Garbage has been piling up under the Ravet flyover for the last three days. Strong odor in the area.',
    likes: 15,
    likedBy: [],
    commentsCount: 3,
    createdAt: '2026-06-25T09:00:00Z',
  },
];

// 5. Seed Comments
export const mockComments: Comment[] = [
  {
    id: 'com-1',
    postId: 'post-2',
    authorName: 'विजय गोखले',
    content: 'होय, मी आज सकाळी तिकडून गेलो, खूप घाण साचली आहे. आरोग्य विभागाला मेल केला पाहिजे.',
    createdAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 'com-2',
    postId: 'post-2',
    authorName: 'स्वाती दीक्षित',
    content: 'नगरसेवकांना याबद्दल कळवले आहे, त्यांनी आज संध्याकाळपर्यंत कचरा उचलण्याचे आश्वासन दिले आहे.',
    createdAt: '2026-06-15T10:15:00Z',
  },
  {
    id: 'com-3',
    postId: 'post-3',
    authorName: 'सचिन आपटे',
    content: 'खूप चांगला उपक्रम! मी नक्की येईन कुटुंबासोबत.',
    createdAt: '2026-06-14T16:00:00Z',
  },
  {
    id: 'com-sneha-1',
    postId: 'post-sneha',
    authorName: 'Mahesh K.',
    content: 'Same on Hill Road — BMC said pipeline repair, fixed by tomorrow.',
    createdAt: '2026-06-23T15:00:00Z',
  },
  {
    id: 'com-sneha-2',
    postId: 'post-sneha',
    authorName: 'Priya D.',
    content: 'Thanks Mahesh, that helps.',
    createdAt: '2026-06-23T15:20:00Z',
  },
];

// 6. Seed Notifications
export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-resident-default',
    title_mr: 'तुमची बुकिंग स्वीकारली गेली आहे',
    title_en: 'Booking Accepted',
    message_mr: 'पाटील प्लंबिंग यांनी १८ जून रोजी दुपारी १०:०० वाजताची तुमची नळ दुरुस्तीची अपॉइंटमेंट स्वीकारली आहे.',
    message_en: 'Patil Plumbing has accepted your appointment on 18th June at 10:00 AM.',
    type: 'booking',
    read: false,
    createdAt: '2026-06-17T12:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-resident-default',
    title_mr: 'नवीन पडताळणी झालेला व्यवसाय!',
    title_en: 'New Verified Business',
    message_mr: 'साठे आणि असोसिएट्स कायदेशीर सल्लागार आता तुमच्या भागात सेवा पुरवत आहेत.',
    message_en: 'Sathe & Associates Legal Services is now verified and operational in your area.',
    type: 'spotlight',
    read: true,
    createdAt: '2026-06-16T15:30:00Z',
  },
];
