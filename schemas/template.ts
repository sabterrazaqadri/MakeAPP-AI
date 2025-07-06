export default {
  name: 'template',
  title: 'Template',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
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
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
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
      title: 'name',
      description: 'description',
      category: 'category',
      createdAt: 'createdAt',
    },
    prepare(selection: any) {
      const { name, description, category, createdAt } = selection;
      const categoryText = category ? ` - ${category}` : '';
      return {
        title: name || 'Untitled Template',
        subtitle: `${description || ''}${categoryText} - ${new Date(createdAt).toLocaleDateString()}`,
      };
    },
  },
}; 