import { verifyAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validation';
import { responseHelper } from '@/lib/response';
import { UnauthorizedError } from '@/lib/errors';
import { UserService } from './user.service';
import { updateProfileSchema, createProfileSchema } from './user.validation';

export class UserController {
  private userService = new UserService();

  async handleUpdateProfile(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        throw new UnauthorizedError();
      }

      const body = await request.json();
      const validatedData = validateBody(updateProfileSchema, body);
      const data = await this.userService.updateProfile(user.id, validatedData);

      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleCreateProfile(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        throw new UnauthorizedError();
      }

      const body = await request.json();
      const validatedData = validateBody(createProfileSchema, body);
      const data = await this.userService.createProfile(user.id, validatedData);

      return responseHelper.success(data, undefined, 201);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }
}
