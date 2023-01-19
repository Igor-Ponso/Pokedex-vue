import { usePokemonStore } from '@/stores/Pokemon';
import { api } from '@/api/config';
import { useToast } from 'vue-toastification';
import { storeToRefs } from 'pinia';
const pokemonStore = usePokemonStore();
const { pokemonEntries } = storeToRefs(pokemonStore);

export const fetchPokemonsData = async () => {
  try {
    for (let i = 1; i <= 151; i++) {
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