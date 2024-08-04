// src/composables/usePokemonUtils.ts

export function getPokemonTypePath (typeName: string) {
  return new URL(`/src/assets/svgs/types/${typeName}.svg`, import.meta.url).href
}

export function getTypeColors (types: { type: { name: string } }[] | undefined) {
  if (!types) return {}
  if (types.length === 2) {
    return {
      background: `linear-gradient(var(--color-type-${types[0].type.name}), var(--color-type-${types[1].type.name}))`,
    }
  } else {
    return {
      background: `var(--color-type-${types[0].type.name})`,
    }
  }
}
