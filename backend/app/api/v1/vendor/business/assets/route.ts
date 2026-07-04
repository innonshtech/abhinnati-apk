import { NextRequest } from 'next/server';
import { VendorController } from '../../../../../../src/presentation/controllers/vendor.controller';
import { ApiResponse, BadRequestError } from '../../../../../../src/presentation/utils/response';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'logo') {
      return VendorController.uploadLogo(req);
    } else if (type === 'cover') {
      return VendorController.uploadCoverPhoto(req);
    } else if (type === 'gallery') {
      return VendorController.uploadGalleryImages(req);
    }

    throw new BadRequestError("Invalid or missing search parameter 'type'. Allowed values are 'logo', 'cover', or 'gallery'.");
  } catch (error) {
    return ApiResponse.handle(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'logo') {
      return VendorController.deleteLogo(req);
    } else if (type === 'cover') {
      return VendorController.deleteCoverPhoto(req);
    } else if (type === 'gallery') {
      return VendorController.deleteGalleryImage(req);
    }

    throw new BadRequestError("Invalid or missing search parameter 'type'. Allowed values are 'logo', 'cover', or 'gallery'.");
  } catch (error) {
    return ApiResponse.handle(error);
  }
}

export async function PUT(req: NextRequest) {
  return VendorController.reorderGallery(req);
}
