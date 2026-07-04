import { UserRepository } from './user.repository';
import { storageService } from '@/lib/storage';

export class UserService {
  private userRepository = new UserRepository();

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.language !== undefined) updateData.language = data.language;

    if (data.activeAreaId !== undefined) {
      const areaId = data.activeAreaId;
      
      let areaExists = await this.userRepository.findAreaById(areaId);

      if (!areaExists) {
        if (data.activeArea) {
          const aa = data.activeArea;
          const slug = (aa.name || 'custom-area').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
          areaExists = await this.userRepository.createArea({
            id: areaId,
            name: aa.name || 'Custom Location',
            slug: slug,
            pincode: aa.pincode || '400050',
            city: aa.city || 'Mumbai',
            district: aa.district || 'Mumbai Suburban',
            state: aa.state || 'Maharashtra',
            country: aa.country || 'India',
            latitude: aa.latitude,
            longitude: aa.longitude,
            isActive: true,
          });
        } else if (areaId.startsWith('gps_')) {
          const parts = areaId.split('_');
          const lat = parseFloat(parts[1]) || 19.0596;
          const lng = parseFloat(parts[2]) || 72.8295;
          const slug = `gps-${lat.toFixed(5)}-${lng.toFixed(5)}-${Math.floor(Math.random() * 10000)}`;
          areaExists = await this.userRepository.createArea({
            id: areaId,
            name: 'Detected Location',
            slug: slug,
            pincode: '400050',
            city: 'Mumbai',
            district: 'Mumbai Suburban',
            state: 'Maharashtra',
            country: 'India',
            latitude: lat,
            longitude: lng,
            isActive: true,
          });
        } else {
          throw new Error('Area not found and no details provided');
        }
      }
      updateData.activeAreaId = areaExists.id;
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      language: updatedUser.language,
      activeAreaId: updatedUser.activeAreaId,
    };
  }

  async createProfile(userId: string, data: { fullName: string; profileImage?: string }) {
    const trimmed = data.fullName.trim();
    const parts = trimmed.split(/\s+/);
    let displayName = parts[0];
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      const initial = lastPart.charAt(0).toUpperCase();
      displayName = `${parts[0]} ${initial}.`;
    }

    let imageUrl: string | undefined = undefined;
    if (data.profileImage) {
      const extension = data.profileImage.startsWith('data:image/jpeg') ? 'jpg' : 'png';
      const filename = `${userId}-${Date.now()}.${extension}`;
      imageUrl = await storageService.uploadFile('profile-images', filename, data.profileImage);
    }

    const updateData: any = {
      fullName: trimmed,
      displayName,
      name: displayName, // update legacy name field for compatibility
      onboardingStep: 'permissions',
    };

    if (imageUrl !== undefined) {
      updateData.profileImage = imageUrl;
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);

    return {
      id: updatedUser.id,
      phone: updatedUser.phone,
      fullName: updatedUser.fullName,
      displayName: updatedUser.displayName,
      profileImage: updatedUser.profileImage,
      onboardingStep: updatedUser.onboardingStep,
      role: updatedUser.role,
      language: updatedUser.language,
    };
  }
}
