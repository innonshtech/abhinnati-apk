import { CategoryRepository } from './category.repository';

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/[\s_]+/g, '-')  // replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
  }

  async getActiveCategories() {
    return this.categoryRepository.findAllActive();
  }

  async getCategory(idOrSlug: string) {
    const category = await this.categoryRepository.findByIdOrSlug(idOrSlug);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async getAllCategoriesForAdmin() {
    return this.categoryRepository.findAll();
  }

  async createCategory(data: {
    slug?: string;
    name_en: string;
    name_mr: string;
    iconName: string;
    isActive?: boolean;
    displayOrder?: number;
  }) {
    const slug = data.slug || this.generateSlug(data.name_en);

    // Verify uniqueness of slug
    const existing = await this.categoryRepository.findByIdOrSlug(slug);
    if (existing) {
      throw new Error(`Category with slug '${slug}' already exists`);
    }

    return this.categoryRepository.create({
      slug,
      name_en: data.name_en,
      name_mr: data.name_mr,
      iconName: data.iconName,
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
    });
  }

  async updateCategory(
    id: string,
    data: {
      slug?: string;
      name_en?: string;
      name_mr?: string;
      iconName?: string;
      isActive?: boolean;
      displayOrder?: number;
    }
  ) {
    const category = await this.categoryRepository.findByIdOrSlug(id);
    if (!category) {
      throw new Error('Category not found');
    }

    let slug = data.slug;
    if (!slug && data.name_en && data.name_en !== category.name_en) {
      slug = this.generateSlug(data.name_en);
    }

    if (slug && slug !== category.slug) {
      const existing = await this.categoryRepository.findByIdOrSlug(slug);
      if (existing && existing.id !== category.id) {
        throw new Error(`Category with slug '${slug}' already exists`);
      }
    }

    return this.categoryRepository.update(category.id, {
      ...data,
      ...(slug && { slug }),
    });
  }

  async deleteCategory(idOrSlug: string) {
    const category = await this.categoryRepository.findByIdOrSlug(idOrSlug);
    if (!category) {
      throw new Error('Category not found');
    }
    return this.categoryRepository.delete(category.id);
  }

  async seedDefaultCategories() {
    const active = await this.categoryRepository.findAll();
    if (active.length > 0) {
      return { seeded: false, count: active.length };
    }

    const defaults = [
      {
        slug: 'plumbing',
        name_en: 'Plumbing & Home Services',
        name_mr: 'प्लंबिंग आणि गृह सेवा',
        iconName: 'CategoryHomeIcon',
        displayOrder: 1,
      },
      {
        slug: 'food',
        name_en: 'Food & Catering',
        name_mr: 'अन्न व केटरिंग',
        iconName: 'CategoryFoodIcon',
        displayOrder: 2,
      },
      {
        slug: 'cleaning',
        name_en: 'Cleaning & Beauty',
        name_mr: 'स्वच्छता आणि सौंदर्य',
        iconName: 'CategoryBeautyIcon',
        displayOrder: 3,
      },
      {
        slug: 'electric',
        name_en: 'Electrical & Auto',
        name_mr: 'इलेक्ट्रिकल आणि ऑटो',
        iconName: 'CategoryAutoIcon',
        displayOrder: 4,
      },
      {
        slug: 'legal',
        name_en: 'Professional & Legal',
        name_mr: 'व्यावसायिक आणि कायदेशीर',
        iconName: 'CategoryProfessionalIcon',
        displayOrder: 5,
      },
    ];

    let count = 0;
    for (const cat of defaults) {
      await this.categoryRepository.create(cat);
      count++;
    }

    return { seeded: true, count };
  }
}
