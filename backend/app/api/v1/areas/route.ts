import { NextResponse } from 'next/server';

const mockAreas = [
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

export async function GET() {
  return NextResponse.json({ success: true, data: mockAreas });
}
