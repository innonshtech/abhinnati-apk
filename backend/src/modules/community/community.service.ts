import { CommunityRepository } from './community.repository';

export class CommunityService {
  private communityRepository = new CommunityRepository();

  async getFeed(areaId: string) {
    const area = await this.communityRepository.findAreaById(areaId);
    const resolvedAreaId = area ? area.id : areaId;

    const posts = await this.communityRepository.findPostsByAreaId(resolvedAreaId);
    return posts.map((post: any) => ({
      ...post,
      likedBy: post.likedBy.map((l: any) => l.userId),
    }));
  }

  async getEmptyFeed(areaId: string, page = 1, limit = 10) {
    const selectedArea = await this.communityRepository.findAreaById(areaId);
    if (!selectedArea) {
      throw new Error('Selected area not found');
    }

    const postCount = await this.communityRepository.countPostsByAreaId(selectedArea.id);
    const hasPosts = postCount > 0;

    // Fetch all approved vendors (active & verified businesses)
    const approvedVendors = await this.communityRepository.findAllApprovedVendors();

    const R = 6371; // Earth's radius in km
    const lat1 = selectedArea.latitude;
    const lon1 = selectedArea.longitude;

    // Calculate distance for all vendors and filter within configured radius (5.0 km)
    const vendorsWithDistance = approvedVendors
      .map((vendor) => {
        const lat2 = vendor.latitude;
        const lon2 = vendor.longitude;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const temp =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(temp), Math.sqrt(1 - temp));
        const distanceVal = R * c;

        return { ...vendor, distanceVal };
      })
      .filter((vendor) => vendor.distanceVal <= 5.0)
      .sort((a, b) => a.distanceVal - b.distanceVal);

    // Apply pagination
    const total = vendorsWithDistance.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedVendors = vendorsWithDistance.slice((page - 1) * limit, page * limit);

    // Also support fallback properties to ensure the current UI doesn't break
    // Fetch latest businesses (directly in target area)
    const latestBusinesses = await this.communityRepository.findApprovedVendorsByAreaId(areaId, 4);

    // Fetch nearby areas list within 5 km
    const allAreas = await this.communityRepository.findAllActiveAreasExcept(areaId);
    const nearbyAreas = allAreas
      .map((a) => {
        const lat2 = a.latitude;
        const lon2 = a.longitude;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const temp =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(temp), Math.sqrt(1 - temp));
        const distanceVal = R * c;

        return { ...a, distanceVal };
      })
      .filter((a) => a.distanceVal <= 5.0)
      .sort((a, b) => a.distanceVal - b.distanceVal)
      .slice(0, 6);

    const nearbyAreasWithCounts = await Promise.all(
      nearbyAreas.map(async (area) => {
        const count = await this.communityRepository.countApprovedVendorsByAreaId(area.id);
        return {
          id: area.id,
          name_en: area.name,
          name_mr: area.name,
          latitude: area.latitude,
          longitude: area.longitude,
          distanceVal: area.distanceVal,
          newBusinessCount: count,
        };
      })
    );

    return {
      emptyFeed: !hasPosts,
      hasPosts, // Backward compatibility
      selectedArea: {
        id: selectedArea.id,
        name: selectedArea.name,
        name_en: selectedArea.name,
        name_mr: selectedArea.name,
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
      },
      businesses: paginatedVendors,
      latestBusinesses, // Backward compatibility
      nearbyAreas: nearbyAreasWithCounts, // Backward compatibility
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createPost(userId: string, userName: string, data: any) {
    const area = await this.communityRepository.findAreaById(data.areaId);
    const resolvedAreaId = area ? area.id : data.areaId;

    return this.communityRepository.createPost({
      authorId: userId,
      authorName: userName || 'Anonymous',
      areaId: resolvedAreaId,
      tag: data.tag,
      title_mr: data.title_mr,
      title_en: data.title_en,
      content_mr: data.content_mr,
      content_en: data.content_en,
      imageUrl: data.imageUrl || null,
      likes: 0,
      commentsCount: 0,
    });
  }

  async getComments(postId: string) {
    return this.communityRepository.findCommentsByPostId(postId);
  }

  async createComment(userId: string, userName: string, postId: string, data: any) {
    const post = await this.communityRepository.findPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    return this.communityRepository.createCommentAndIncrementCount(postId, {
      authorId: userId,
      authorName: data.authorName || userName || 'Anonymous',
      content: data.content,
    });
  }

  async deletePost(userId: string, userRole: string, postId: string) {
    const post = await this.communityRepository.findPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'admin') {
      throw new Error('Forbidden: Only the owner or an admin can delete this post');
    }

    return this.communityRepository.deletePost(postId);
  }
}
