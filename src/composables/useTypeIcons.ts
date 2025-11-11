/**
 * Composable para gerenciar ícones de tipos Pokémon
 * Segue Single Responsibility Principle - apenas lida com ícones de tipos
 */

const typeIcons = import.meta.glob('@/assets/svgs/type/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

export const useTypeIcons = () => {
  const getTypeIcon = (typeName: string): string => {
    const key = `/src/assets/svgs/type/${typeName}.svg`;
    return typeIcons[key] || '';
  };

  const hasTypeIcon = (typeName: string): boolean => {
    return !!getTypeIcon(typeName);
  };

  return {
    getTypeIcon,
    hasTypeIcon
  };
};
