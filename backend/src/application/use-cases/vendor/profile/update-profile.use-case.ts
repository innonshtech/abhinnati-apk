import { UserRepository } from '../../../../domain/repositories/user.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { UpdateProfileRequest } from '../../../dtos/vendor.dto';
import { StorageUploadService } from '../../../services/storage-upload.service';
import { NotFoundError, BadRequestError } from '../../../../presentation/utils/response';

export class UpdateProfileUseCase {
  constructor(
    private userRepo: UserRepository,
    private auditRepo: AuditLogRepository
  ) {}

  async execute(userId: string, dto: UpdateProfileRequest, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if phone or email unique constraint violated
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.userRepo.findByPhone(dto.phone);
      if (existingPhone) {
        throw new BadRequestError('Phone number already in use');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new BadRequestError('Email address already in use');
      }
    }

    const updatedUser = await this.userRepo.update(userId, {
      name: dto.name ?? undefined,
      language: dto.language ?? undefined,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
    });

    await this.auditRepo.create({
      userId,
      action: 'UPDATE_PROFILE',
      entityName: 'User',
      entityId: userId,
      oldValues: JSON.stringify({ name: user.name, email: user.email, phone: user.phone, language: user.language }),
      newValues: JSON.stringify({ name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, language: updatedUser.language }),
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async uploadProfilePicture(userId: string, base64Data: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const filename = `${userId}-${Date.now()}.png`;
    const publicUrl = await StorageUploadService.validateAndUpload(
      'profile-images',
      'vendors/profile',
      filename,
      base64Data
    );

    const updatedUser = await this.userRepo.update(userId, {
      profileImage: publicUrl,
    });

    await this.auditRepo.create({
      userId,
      action: 'UPLOAD_PROFILE_PICTURE',
      entityName: 'User',
      entityId: userId,
      newValues: JSON.stringify({ profileImage: publicUrl }),
      ipAddress,
      userAgent,
    });

    return { profileImage: publicUrl };
  }

  async deleteProfilePicture(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepo.update(userId, {
      profileImage: null,
    });

    await this.auditRepo.create({
      userId,
      action: 'DELETE_PROFILE_PICTURE',
      entityName: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return { profileImage: null };
  }
}
