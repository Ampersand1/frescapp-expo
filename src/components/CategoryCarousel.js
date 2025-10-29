import { FlatList, Text, View } from 'react-native';
import ProductCard from './ProductCard';

export default function CategoryCarousel({ category, products }) {
  return (
    <View style={{marginRight:12}}>
      <Text style={{fontWeight:'bold'}}>{category.name}</Text>
      <FlatList
        data={products}
        horizontal
        keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => <ProductCard product={item} />}
      />
    </View>
  );
}
