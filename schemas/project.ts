export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'code',
      title: 'Code',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Landing Page', value: 'landing' },
          { title: 'Dashboard', value: 'dashboard' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Blog', value: 'blog' },
          { title: 'Portfolio', value: 'portfolio' },
          { title: 'SaaS', value: 'saas' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'other',
    },
    {
      name: 'isFavorite',
      title: 'Favorite',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'isPublic',
      title: 'Public Project',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      userEmail: 'userEmail',
      createdAt: 'createdAt',
      category: 'category',
      isFavorite: 'isFavorite',
    },
    prepare(selection: any) {
      const { title, userEmail, createdAt, category, isFavorite } = selection;
      const categoryText = category ? ` - ${category}` : '';
      const favoriteText = isFavorite ? ' ⭐' : '';
      return {
        title: title || 'Untitled Project',
        subtitle: `${userEmail}${categoryText}${favoriteText} - ${new Date(createdAt).toLocaleDateString()}`,
      };
    },
  },
}; 