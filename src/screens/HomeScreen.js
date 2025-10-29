import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, TextInput } from 'react-native';
import CategoryCarousel from '../components/CategoryCarousel';
import ProductCard from '../components/ProductCard';
import { db } from '../services/firebase';

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(()=> {
    const load = async () => {
      const catsSnap = await getDocs(collection(db, 'categories'));
      setCategories(catsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const prodsSnap = await getDocs(collection(db, 'products'));
      setProducts(prodsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{flex:1, padding:12}}>
      <TextInput placeholder="Buscar productos..." value={search} onChangeText={setSearch}
        style={{borderWidth:1, borderColor:'#eee', padding:10, borderRadius:8, marginBottom:10}} />

      <Text style={{fontSize:16, marginBottom:8}}>Categorías</Text>
      <FlatList
        data={categories}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => <CategoryCarousel category={item} products={products.filter(p => p.categoryId === item.id)} />}
      />

      <Text style={{fontSize:16, marginVertical:8}}>Resultados</Text>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({item}) => <ProductCard product={item} />}
        contentContainerStyle={{paddingBottom:60}}
      />
    </SafeAreaView>
  );
}
