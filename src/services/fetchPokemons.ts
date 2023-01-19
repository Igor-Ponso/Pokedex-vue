import { usePokemonStore } from '@/stores/Pokemon';
import { api } from '@/api/config';
import { useToast } from 'vue-toastification';

export const fetchPokemonsData = async () => {
  try {
    for (let i = 1; i <= 151; i++) {
      await api.get('/pokemon-species/' + i).then((response) => {
        usePokemonStore().pokemonEntries.push(response.data);
      });

      await api.get('/pokemon/' + i).then((response) => {
        usePokemonStore().pokemonList.push(response.data);
      });
    }
  } catch (err: any) {
    useToast().error(`Erro ao consultar os dados - ${err?.response?.status}`);
  }
};

//const pokemons = ref([] as Pokemon[]);
//const pokemons = ref<Pokemon[]>([]); // * Other way for the same thing
