/**
 * Composable para formatação de dados Pokémon
 * Segue Single Responsibility Principle - apenas formata dados
 */

export const usePokemonFormatting = () => {
  const padWithLeadingZeros = (num: number, totalLength: number): string => {
    return String(num).padStart(totalLength, '0');
  };

  const formatWeight = (weight: number): string => {
    return `${(weight / 10).toFixed(1)}KG`;
  };

  const formatHeight = (height: number): string => {
    return `${(height / 10).toFixed(1)}M`;
  };

  const formatStatName = (statName: string): string => {
    return statName.toUpperCase().replace(/-/g, ' ');
  };

  const getShinyUrl = (pokemonId: number): string => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`;
  };

  return {
    padWithLeadingZeros,
    formatWeight,
    formatHeight,
    formatStatName,
    getShinyUrl
  };
};
